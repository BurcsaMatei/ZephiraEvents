// components/List.tsx

// ==============================
// Imports
// ==============================
import * as React from "react";

import { type User } from "../interfaces";
import ListItem from "./ListItem";

// ==============================
// Types
// ==============================
type ListProps = {
  items: ReadonlyArray<User>;
};

// ==============================
// Component
// ==============================
export default function List({ items }: ListProps) {
  return (
    <ul>
      {items.map((item) => (
        <li key={item.id}>
          <ListItem item={item} />
        </li>
      ))}
    </ul>
  );
}
