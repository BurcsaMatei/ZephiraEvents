// lib/seo/menuJsonLd.ts
// ==============================
// Types & JSON-LD generator for Menu/MenuItem
// ==============================

export type MenuData = {
  slug: string;
  title: string;
  pricePerPers: number;
  currency: string;
  image: string;
  imageAlt: string;
  sections: {
    starterRece: string[];
    antreuCald: string;
    felIntermediar: string;
    felPrincipal: string | string[];
    pachetBar: string[];
  };
};

// ==============================
// Utils
// ==============================
function toMenuItems(names: string[]) {
  return names.map((name) => ({ "@type": "MenuItem", name }));
}

// ==============================
// Builder
// ==============================
export function buildMenuJsonLd(
  menus: MenuData[],
  pageUrl?: string,
  toAbsoluteImage?: (src: string) => string,
) {
  const hasMenuSection = menus.map((m) => {
    const items: { "@type": "MenuSection"; name: string; hasMenuItem: unknown[] }[] = [];

    items.push({
      "@type": "MenuSection",
      name: "Starter rece",
      hasMenuItem: toMenuItems(m.sections.starterRece),
    });

    items.push({
      "@type": "MenuSection",
      name: "Antreu cald",
      hasMenuItem: toMenuItems([m.sections.antreuCald]),
    });

    items.push({
      "@type": "MenuSection",
      name: "Fel intermediar",
      hasMenuItem: toMenuItems([m.sections.felIntermediar]),
    });

    const felPrincipalArr = Array.isArray(m.sections.felPrincipal)
      ? m.sections.felPrincipal
      : [m.sections.felPrincipal];

    items.push({
      "@type": "MenuSection",
      name: "Fel principal",
      hasMenuItem: toMenuItems(felPrincipalArr),
    });

    items.push({
      "@type": "MenuSection",
      name: "Pachet bar",
      hasMenuItem: toMenuItems(m.sections.pachetBar),
    });

    return {
      "@type": "MenuSection",
      name: m.title,
      image: toAbsoluteImage ? toAbsoluteImage(m.image) : m.image,
      description: `Meniu ${m.title} — ${m.currency} ${m.pricePerPers}/pers.`,
      offers: {
        "@type": "Offer",
        priceCurrency: m.currency,
        price: m.pricePerPers,
      },
      hasMenuSection: items,
    };
  });

  return {
    "@context": "https://schema.org",
    "@type": "Menu",
    name: "Oferte de meniu — ZephiraEvents",
    ...(pageUrl ? { url: pageUrl } : {}),
    hasMenuSection,
  };
}
