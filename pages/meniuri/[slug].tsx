// pages/meniuri/[slug].tsx

// ==============================
// Imports
// ==============================
import type { GetStaticPaths, GetStaticProps, NextPage } from "next";

import Appear, { AppearGroup } from "../../components/animations/Appear";
import Breadcrumbs, { type Crumb } from "../../components/Breadcrumbs";
import Hero from "../../components/sections/Hero";
import Outro from "../../components/sections/Outro";
import Seo from "../../components/Seo";
import Separator from "../../components/Separator";
import { withBase } from "../../lib/config";
import { getAllMenus, getEventTypeAnchorHref, getMenuBySlug } from "../../lib/menus";
import * as s from "../../styles/menus/menuDetail.css";
import { list, sectionBlock, sectionTitle } from "../../styles/sections/menuOffers.css";
import type { Menu } from "../../types/menu";

// ==============================
// Types
// ==============================
type PageProps = {
  menu: Menu;
};

// ==============================
// Constante
// ==============================
function menuDescription(menu: Menu): string {
  const parts: string[] = [];
  if (menu.eventType) parts.push(menu.eventType);
  parts.push(`${menu.currency} ${menu.pricePerPers}/pers.`);
  return `${menu.title} — ${parts.join(" • ")}`;
}

// ==============================
// Component
// ==============================
const MenuDetailPage: NextPage<PageProps> = ({ menu }) => {
  const pagePath = `/meniuri/${menu.slug}`;
  const backHref = getEventTypeAnchorHref(menu.eventType);

  const crumbs: Crumb[] = [
    { name: "Acasă", href: "/" },
    { name: "Servicii", href: "/servicii" },
    { name: menu.eventType ?? "Meniu", current: true },
  ];

  return (
    <>
      <Seo
        title={`${menu.title} — Meniu`}
        description={menuDescription(menu)}
        url={pagePath}
        image={menu.image}
      />

      <section data-full-bleed="true">
        <Appear>
          <Hero
            title={menu.title}
            subtitle={`${menu.eventType} • ${menu.currency} ${menu.pricePerPers}/pers.`}
            image={{ src: menu.image, alt: menu.imageAlt || menu.title }}
            height="sm"
          />
        </Appear>
      </section>

      <Breadcrumbs items={crumbs} />

      <Separator />

      <AppearGroup stagger={0.12} delay={0.06} amount={0.2}>
        <section className="section">
          <div className="container">
            <Appear>
              <div className={s.metaRow}>
                <a className={s.backLink} href={withBase(backHref)}>
                  Înapoi la Servicii
                </a>
                <span className={s.pill}>{menu.eventType}</span>
                <span className={s.pill}>
                  {menu.currency} {menu.pricePerPers}/pers.
                </span>
              </div>
            </Appear>

            <Appear>
              <div className={s.sectionsGrid}>
                {/* Starter rece */}
                {menu.sections.starterRece.length > 0 && (
                  <div className={sectionBlock}>
                    <div className={sectionTitle}>Starter rece</div>
                    <ul className={list}>
                      {menu.sections.starterRece.map((it, idx) => (
                        <li key={idx}>{it}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Antreu cald */}
                {menu.sections.antreuCald.trim() !== "" && (
                  <div className={sectionBlock}>
                    <div className={sectionTitle}>Antreu cald</div>
                    <p className={s.paragraph}>{menu.sections.antreuCald}</p>
                  </div>
                )}

                {/* Fel intermediar */}
                {menu.sections.felIntermediar.trim() !== "" && (
                  <div className={sectionBlock}>
                    <div className={sectionTitle}>Fel intermediar</div>
                    <p className={s.paragraph}>{menu.sections.felIntermediar}</p>
                  </div>
                )}

                {/* Fel principal */}
                {Array.isArray(menu.sections.felPrincipal) ? (
                  menu.sections.felPrincipal.length > 0 && (
                    <div className={sectionBlock}>
                      <div className={sectionTitle}>Fel principal</div>
                      <ul className={list}>
                        {menu.sections.felPrincipal.map((it, idx) => (
                          <li key={idx}>{it}</li>
                        ))}
                      </ul>
                    </div>
                  )
                ) : menu.sections.felPrincipal.trim() !== "" ? (
                  <div className={sectionBlock}>
                    <div className={sectionTitle}>Fel principal</div>
                    <p className={s.paragraph}>{menu.sections.felPrincipal}</p>
                  </div>
                ) : null}

                {/* Pachet bar */}
                {menu.sections.pachetBar.length > 0 && (
                  <div className={sectionBlock}>
                    <div className={sectionTitle}>Pachet bar</div>
                    <ul className={list}>
                      {menu.sections.pachetBar.map((it, idx) => (
                        <li key={idx}>{it}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </Appear>
          </div>
        </section>

        <Separator />

        <section className="section">
          <div className="container">
            <Appear>
              <Outro
                eyebrow="Vrei o ofertă personalizată?"
                title="Spune-ne data și numărul de invitați"
                lead="Trimite detalii despre eveniment și preferințe. Îți răspundem rapid cu disponibilitatea și oferta potrivită."
                cta={{ label: "Solicită ofertă", href: "/contact" }}
              />
            </Appear>
          </div>
        </section>
      </AppearGroup>
    </>
  );
};

// ==============================
// SSG
// ==============================
export const getStaticPaths: GetStaticPaths = async () => {
  const menus = getAllMenus();
  return {
    paths: menus.map((m) => ({ params: { slug: m.slug } })),
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps<PageProps> = async (ctx) => {
  const slug = String(ctx.params?.slug ?? "");
  const menu = getMenuBySlug(slug);

  if (!menu) return { notFound: true };

  return {
    props: { menu },
  };
};

// ==============================
// Exporturi
// ==============================
export default MenuDetailPage;
