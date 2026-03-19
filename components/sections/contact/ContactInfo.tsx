// components/sections/contact/ContactInfo.tsx

// ==============================
// Imports
// ==============================
import React from "react";

import { withBase } from "../../../lib/config";
import {
  cardTitleClass,
  contactGridClass,
  contactIconClass,
  contactItemClass,
  contactItemLinkClass,
  contactTextClass,
} from "../../../styles/contact/ContactInfo.css";
import Appear from "../../animations/Appear";
import AnimatedIcon from "../../ui/AnimatedIcon";

// ==============================
// Types
// ==============================
type Props = {
  businessName: string;
  address: string;
  phone: string;
  email: string;
};

type ItemDef = {
  iconSrc: string;
  title: string;
  text: string;
  href: string | undefined;
  external?: boolean;
};

// ==============================
// Component
// ==============================
const ContactInfo: React.FC<Props> = ({ businessName, address, phone, email }) => {
  const items: ItemDef[] = [
    {
      iconSrc: withBase("/icons/contact/location.svg"),
      title: businessName,
      text: address,
      href:
        address !== "—"
          ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
          : undefined,
      external: true,
    },
    {
      iconSrc: withBase("/icons/contact/phone-call.svg"),
      title: "Telefon",
      text: phone,
      href: phone !== "—" ? `tel:${phone.replace(/\s+/g, "")}` : undefined,
    },
    {
      iconSrc: withBase("/icons/contact/email.svg"),
      title: "E-mail",
      text: email,
      href: email !== "—" ? `mailto:${email}` : undefined,
    },
  ];

  return (
    <div className={contactGridClass} aria-label="Informații de contact">
      {items.map((item, i) => {
        const inner = (
          <>
            <AnimatedIcon
              src={item.iconSrc}
              size={32}
              hoverTilt
              className={contactIconClass}
              ariaLabel={item.title}
            />
            <h3 className={cardTitleClass}>{item.title}</h3>
            <p className={contactTextClass}>{item.text}</p>
          </>
        );

        return (
          <Appear as="div" key={i} delay={0.1 * i}>
            {item.href ? (
              <a
                href={item.href}
                className={`${contactItemClass} ${contactItemLinkClass}`}
                {...(item.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              >
                {inner}
              </a>
            ) : (
              <div className={contactItemClass}>{inner}</div>
            )}
          </Appear>
        );
      })}
    </div>
  );
};

export default ContactInfo;
