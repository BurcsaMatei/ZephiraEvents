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
  contactTextClass,
  headingMb,
} from "../../../styles/contact/contactInfo.css";
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

// ==============================
// Component
// ==============================
const ContactInfo: React.FC<Props> = ({ businessName, address, phone, email }) => {
  const items: Array<{ iconSrc: string; title: string; text: React.ReactNode }> = [
    { iconSrc: withBase("/icons/contact/location.svg"), title: businessName, text: address },
    {
      iconSrc: withBase("/icons/contact/phone-call.svg"),
      title: "Telefon",
      text: phone !== "—" ? <a href={`tel:${phone.replace(/\s+/g, "")}`}>{phone}</a> : "—",
    },
    {
      iconSrc: withBase("/icons/contact/email.svg"),
      title: "E-mail",
      text: email !== "—" ? <a href={`mailto:${email}`}>{email}</a> : "—",
    },
  ];

  return (
    <>
      <Appear as="h2" id="contact-info-title" className={`${cardTitleClass} ${headingMb}`}>
        Informații de contact
      </Appear>

      <div className={contactGridClass} aria-labelledby="contact-info-title">
        {items.map((item, i) => (
          <Appear as="div" key={i} className={contactItemClass} delay={0.1 * i}>
            <AnimatedIcon
              src={item.iconSrc}
              size={26}
              hoverTilt
              className={contactIconClass}
              ariaLabel={item.title}
            />
            <div>
              <h3 className={cardTitleClass}>{item.title}</h3>
              <p className={contactTextClass}>{item.text}</p>
            </div>
          </Appear>
        ))}
      </div>
    </>
  );
};

export default ContactInfo;
