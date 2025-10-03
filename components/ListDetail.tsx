// components/ListDetail.tsx

// ==============================
// Imports
// ==============================
import type { ReactNode } from "react";
import * as React from "react";

import { type User } from "../interfaces";

// ==============================
// Types
// ==============================
type ListDetailProps = {
  item: User;
  /**
   * Etichete i18n (opționale). Dacă `title` e setat, suprascrie titlul implicit
   * "Detail for ${name}".
   */
  labels?: {
    title?: string;
    id?: string;
    name?: string;
  };
  /** Slot pentru conținut suplimentar (ex. câmpuri extra) */
  children?: ReactNode;
};

// ==============================
// Constante
// ==============================
const DEFAULT_LABELS = {
  id: "ID",
  name: "Name",
} as const;

// ==============================
// Component
// ==============================
export default function ListDetail({ item, labels, children }: ListDetailProps) {
  const headingId = React.useId();

  const displayName = item?.name ?? "—";
  const displayId = item?.id != null ? String(item.id) : "—";
  const titleText = labels?.title ?? `Detail for ${displayName}`;

  return (
    <section aria-labelledby={headingId} data-testid="list-detail">
      <h2 id={headingId}>{titleText}</h2>

      <dl>
        <dt>{labels?.name ?? DEFAULT_LABELS.name}</dt>
        <dd>{displayName}</dd>

        <dt>{labels?.id ?? DEFAULT_LABELS.id}</dt>
        <dd>{displayId}</dd>
      </dl>

      {children}
    </section>
  );
}
