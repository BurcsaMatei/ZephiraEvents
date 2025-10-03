// components/sections/contact/ContactMapIframeConsent.tsx

"use client";

// ==============================
// Imports
// ==============================
import dynamic from "next/dynamic";
import type { ComponentType } from "react";

// ==============================
// Types
// ==============================
import type { ContactMapIframeConsentProps } from "./ContactMapIframeConsent.lazy";

// ==============================
// Dynamic import
// ==============================
const ContactMapIframeConsentLazy = dynamic(() => import("./ContactMapIframeConsent.lazy"), {
  ssr: true,
  loading: () => null,
}) as ComponentType<ContactMapIframeConsentProps>;

// ==============================
// Component
// ==============================
export default function ContactMapIframeConsent(props: ContactMapIframeConsentProps) {
  return <ContactMapIframeConsentLazy {...props} />;
}
