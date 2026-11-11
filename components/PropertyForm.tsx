"use client";
// Create / edit form for a property, including photo upload.
// Submits to a Server Action (app/(app)/properties/actions.ts) that forwards it to Laravel.
/* eslint-disable @next/next/no-img-element -- previews are local blob: URLs and API-served photos */
import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { ImagePlus, LoaderCircle, Trash2, Undo2 } from "lucide-react";
import { Alert } from "./Alert";
import { Field } from "./Field";
import { useFormAction } from "./useFormAction";
import type { FormAction } from "@/lib/forms";
import {
  CATEGORY_LABELS,
  PURPOSE_LABELS,
  STATUS_LABELS,
  toOptions,
  type Property,
} from "@/lib/properties";

// Keep in sync with PropertyRequest in Laravel (which enforces them).
const MAX_IMAGES = 12;
const MAX_IMAGE_MB = 5;
const ACCEPTED_TYPES = "image/jpeg,image/png,image/webp";

type Props = {
  /** Bound Server Action: saveProperty.bind(null, id | null). */
  action: FormAction;
  /** The property being edited; omit when creating. */
  property?: Property;
};

export function PropertyForm({ action, property }: Props) {
  const { state, errors, pending, onSubmit } = useFormAction(action);
  const [clientError, setClientError] = useState<string | null>(null);
  const [previews, setPreviews] = useState<{ name: string; url: string }[]>([]);
  const [removedIds, setRemovedIds] = useState<number[]>([]);
  const existingImages = property?.images ?? [];
  const keptCount = existingImages.length - removedIds.length;

  // Free the preview blob URLs when they are replaced or the form unmounts.
  useEffect(() => () => previews.forEach((p) => URL.revokeObjectURL(p.url)), [previews]);

  function handleFiles(files: FileList | null) {
    const list = Array.from(files ?? []);
    setPreviews(list.map((file) => ({ name: file.name, url: URL.createObjectURL(file) })));

    const tooBig = list.find((file) => file.size > MAX_IMAGE_MB * 1024 * 1024);
    if (tooBig) setClientError(`“${tooBig.name}” is larger than ${MAX_IMAGE_MB} MB.`);
    else if (keptCount + list.length > MAX_IMAGES) setClientError(`A property can have at most ${MAX_IMAGES} photos.`);
    else setClientError(null);
  }

  function toggleRemoved(id: number) {
    setRemovedIds((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]));
  }

  // Don't send photos we already know Laravel will reject.
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    if (clientError) return event.preventDefault();
    onSubmit(event);
  }

  // Laravel reports photo errors as "images" or "images.0", "images.1", …
  const imageErrors = Object.entries(errors)
    .filter(([key]) => key === "images" || key.startsWith("images."))
    .flatMap(([, messages]) => messages);

  return (
    <form onSubmit={handleSubmit} className="property-form" noValidate>
      {state.message && <Alert>{state.message}</Alert>}

      <section className="card form-section">
        <div className="card__header">
          <h2>Basics</h2>
          <p>What it is and how it’s listed.</p>
        </div>
        <div className="form-grid">
          <Field label="Title" name="title" errors={errors.title} className="form-grid__full">
            <input id="title" name="title" required maxLength={150} defaultValue={property?.title} placeholder="e.g. Bright two-bedroom apartment" />
          </Field>
          <Field label="Category" name="category" errors={errors.category}>
            <select id="category" name="category" required defaultValue={property?.category ?? ""}>
              <option value="" disabled>
                Choose a category
              </option>
              {toOptions(CATEGORY_LABELS).map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Purpose" name="purpose" errors={errors.purpose}>
            <select id="purpose" name="purpose" required defaultValue={property?.purpose ?? "sale"}>
              {toOptions(PURPOSE_LABELS).map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Status" name="status" errors={errors.status}>
            <select id="status" name="status" required defaultValue={property?.status ?? "available"}>
              {toOptions(STATUS_LABELS).map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Price" name="price" errors={errors.price} hint="Sale price, or monthly rent for rentals.">
            <input id="price" name="price" type="number" min={0} step="0.01" inputMode="decimal" required defaultValue={property?.price} placeholder="0" />
          </Field>
        </div>
      </section>

      <section className="card form-section">
        <div className="card__header">
          <h2>Location</h2>
        </div>
        <div className="form-grid">
          <Field label="Address" name="address" errors={errors.address} className="form-grid__wide">
            <input id="address" name="address" required maxLength={255} defaultValue={property?.address} placeholder="Street and number" />
          </Field>
          <Field label="City" name="city" errors={errors.city}>
            <input id="city" name="city" required maxLength={100} defaultValue={property?.city} />
          </Field>
        </div>
      </section>

      <section className="card form-section">
        <div className="card__header">
          <h2>Details</h2>
          <p>Optional. Leave blank when they don’t apply (e.g. land).</p>
        </div>
        <div className="form-grid">
          <Field label="Bedrooms" name="bedrooms" errors={errors.bedrooms}>
            <input id="bedrooms" name="bedrooms" type="number" min={0} max={100} inputMode="numeric" defaultValue={property?.bedrooms ?? ""} />
          </Field>
          <Field label="Bathrooms" name="bathrooms" errors={errors.bathrooms}>
            <input id="bathrooms" name="bathrooms" type="number" min={0} max={100} inputMode="numeric" defaultValue={property?.bathrooms ?? ""} />
          </Field>
          <Field label="Floor area (m²)" name="area" errors={errors.area}>
            <input id="area" name="area" type="number" min={1} inputMode="numeric" defaultValue={property?.area ?? ""} />
          </Field>
          <Field label="Description" name="description" errors={errors.description} className="form-grid__full">
            <textarea id="description" name="description" rows={5} maxLength={5000} defaultValue={property?.description ?? ""} placeholder="Highlights, condition, nearby amenities…" />
          </Field>
        </div>
      </section>

      <section className="card form-section">
        <div className="card__header">
          <h2>Photos</h2>
          <p>
            JPG, PNG or WebP, up to {MAX_IMAGE_MB} MB each, {MAX_IMAGES} photos per property. The first photo is the cover.
          </p>
        </div>

        {existingImages.length > 0 && (
          <ul className="photo-grid">
            {existingImages.map((image) => {
              const removed = removedIds.includes(image.id);
              return (
                <li key={image.id} className={`photo${removed ? " photo--removed" : ""}`}>
                  <img src={image.url} alt="" />
                  {removed && <input type="hidden" name="remove_image_ids[]" value={image.id} />}
                  <button
                    type="button"
                    className="photo__action"
                    onClick={() => toggleRemoved(image.id)}
                    aria-label={removed ? "Keep this photo" : "Remove this photo"}
                    title={removed ? "Keep" : "Remove"}
                  >
                    {removed ? <Undo2 size={16} /> : <Trash2 size={16} />}
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        <label className={`dropzone${imageErrors.length || clientError ? " dropzone--error" : ""}`}>
          <ImagePlus size={24} aria-hidden="true" />
          <span>
            <strong>{previews.length ? `${previews.length} photo(s) selected` : "Choose photos to upload"}</strong>
            <span className="muted">Click to browse. Selecting again replaces this selection.</span>
          </span>
          <input
            type="file"
            name="images[]"
            accept={ACCEPTED_TYPES}
            multiple
            onChange={(e) => handleFiles(e.currentTarget.files)}
          />
        </label>
        {(clientError || imageErrors[0]) && <p className="field__error">{clientError ?? imageErrors[0]}</p>}

        {previews.length > 0 && (
          <ul className="photo-grid photo-grid--new">
            {previews.map((p) => (
              <li key={p.url} className="photo">
                <img src={p.url} alt={p.name} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="form-actions">
        <button type="submit" className="button button--primary" disabled={pending}>
          {pending && <LoaderCircle size={18} className="spin" aria-hidden="true" />}
          {pending ? "Saving…" : property ? "Save changes" : "Add property"}
        </button>
        <Link href={property ? `/properties/${property.id}` : "/properties"} className="button button--secondary">
          Cancel
        </Link>
      </div>
    </form>
  );
}
