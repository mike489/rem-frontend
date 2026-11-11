// One property in the list: cover photo, price, title, location and key facts.
/* eslint-disable @next/next/no-img-element -- photos are served by the Laravel API */
import Link from "next/link";
import { ImageOff, MapPin } from "lucide-react";
import { Badge } from "./Badge";
import { PropertyFacts } from "./PropertyFacts";
import { PURPOSE_LABELS, STATUS_LABELS, STATUS_TONES, formatPrice, type Property } from "@/lib/properties";

export function PropertyCard({ property }: { property: Property }) {
  return (
    <Link href={`/properties/${property.id}`} className="property-card">
      <div className="property-card__media">
        {property.cover_image_url ? (
          <img src={property.cover_image_url} alt="" loading="lazy" />
        ) : (
          <span className="property-card__placeholder" aria-hidden="true">
            <ImageOff size={28} />
          </span>
        )}
        <span className="property-card__badges">
          <Badge tone="accent">{PURPOSE_LABELS[property.purpose]}</Badge>
          <Badge tone={STATUS_TONES[property.status]}>{STATUS_LABELS[property.status]}</Badge>
        </span>
      </div>
      <div className="property-card__body">
        <span className="property-card__price">{formatPrice(property)}</span>
        <h3 className="property-card__title">{property.title}</h3>
        <p className="property-card__location">
          <MapPin size={15} aria-hidden="true" />
          <span>
            {property.address}, {property.city}
          </span>
        </p>
        <PropertyFacts property={property} compact />
      </div>
    </Link>
  );
}
