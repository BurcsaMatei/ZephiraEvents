// components/ListItem.tsx

// ==============================
// Imports
// ==============================
import * as React from "react";

import { type User } from "../interfaces";

// ==============================
// Types
// ==============================
type ListItemProps = {
  item: User;
};

// ==============================
// Component
// ==============================
export default function ListItem({ item }: ListItemProps) {
  const name = item?.name ?? "—";
  const id = item?.id != null ? String(item.id) : "—";

  return (
    <div>
      <strong>{name}</strong>
      <div style={{ opacity: 0.7 }}>ID: {id}</div>
    </div>
  );
}
