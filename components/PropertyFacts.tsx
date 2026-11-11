// Category, bedrooms, bathrooms and floor area as a row of icon + value pairs.
import { Bath, BedDouble, Building2, Ruler } from "lucide-react";
import { CATEGORY_LABELS, type Property } from "@/lib/properties";

type Props = {
  property: Pick<Property, "category" | "bedrooms" | "bathrooms" | "area">;
  /** Card style: values only. Otherwise each fact gets a label too. */
  compact?: boolean;
};

export function PropertyFacts({ property, compact = false }: Props) {
  const facts = [
    { icon: Building2, label: "Type", value: CATEGORY_LABELS[property.category] },
    property.bedrooms !== null && {
      icon: BedDouble,
      label: "Bedrooms",
      value: compact ? `${property.bedrooms} bd` : property.bedrooms,
    },
    property.bathrooms !== null && {
      icon: Bath,
      label: "Bathrooms",
      value: compact ? `${property.bathrooms} ba` : property.bathrooms,
    },
    property.area !== null && { icon: Ruler, label: "Floor area", value: `${property.area.toLocaleString("en")} m²` },
  ].filter((fact) => fact !== false);

  return (
    <ul className={`facts${compact ? " facts--compact" : ""}`}>
      {facts.map(({ icon: Icon, label, value }) => (
        <li key={label} title={label}>
          <Icon size={compact ? 15 : 18} aria-hidden="true" />
          {compact ? (
            <span>{value}</span>
          ) : (
            <span className="facts__text">
              <span className="facts__label">{label}</span>
              <strong>{value}</strong>
            </span>
          )}
        </li>
      ))}
    </ul>
  );
}
