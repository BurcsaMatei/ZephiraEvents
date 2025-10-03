// components/CardGrid.tsx

import { withBase } from "../lib/config";
import Appear from "./animations/Appear";
import Card from "./Card";
import Grid from "./Grid";

export type GalleryCard = {
  src: string;
  alt: string;
  caption?: string;
  href?: string;
};

type Props = {
  cards: GalleryCard[];
  onItemClick?: (index: number) => void;
  aboveTheFold?: boolean;
  priorityCount?: number;
};

// ==============================
// Component
// ==============================
export default function CardGrid({
  cards,
  onItemClick,
  aboveTheFold = false,
  priorityCount = 6,
}: Props) {
  const handleActivate = (i: number) => onItemClick?.(i);

  return (
    <Grid gap="16px" align="stretch" justify="stretch" mode="fluid" minCol={240}>
      {cards.map((c, i) => {
        const priority = aboveTheFold && i < priorityCount;

        const interactiveProps = onItemClick
          ? ({ onClick: () => handleActivate(i) } as const)
          : c.href
            ? ({ href: withBase(c.href) } as const) // base path pentru linkuri interne
            : ({} as const);

        return (
          <Appear
            as="div"
            key={`${c.href ?? c.src}-${i}`}
            style={{ height: "100%" }}
            delay={0.1 * i}
          >
            <Card
              title={c.alt || "Imagine"}
              image={{ src: c.src, alt: c.alt, priority }}
              mediaRatio="4/3"
              {...(c.caption ? { excerpt: c.caption } : {})}
              {...interactiveProps}
            />
          </Appear>
        );
      })}
    </Grid>
  );
}
