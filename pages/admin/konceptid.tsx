// pages/admin/konceptid.tsx
// Dashboard KonceptID — contract activ + istoric facturi.

import type { GetServerSideProps, InferGetServerSidePropsType } from "next";
import type { ReactElement } from "react";

import AdminLayout from "../../components/admin/AdminLayout";
import { verifyAdminSession } from "../../lib/admin/auth";
import { getFile, listFiles } from "../../lib/admin/github";
import * as s from "../../styles/admin/konceptid.css";
import type { ContractJson, InvoiceJson } from "../../types/konceptid";

// ──────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────
type Props = {
  contract: ContractJson | null;
  invoices: InvoiceJson[];
};

// ──────────────────────────────────────────────────────────
// Utils
// ──────────────────────────────────────────────────────────
function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("ro-RO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function statusLabel(status: ContractJson["status"]): string {
  const map: Record<ContractJson["status"], string> = {
    active: "Activ",
    cancelled: "Anulat",
    paused: "Pausat",
  };
  return map[status];
}

function invoiceStatusLabel(status: InvoiceJson["status"]): string {
  const map: Record<InvoiceJson["status"], string> = {
    paid: "Plătit",
    unpaid: "Neplătit",
    void: "Anulat",
  };
  return map[status];
}

function invoiceStatusClass(status: InvoiceJson["status"]): string {
  if (status === "paid") return `${s.invoiceStatus} ${s.invoicePaid}`;
  if (status === "unpaid") return `${s.invoiceStatus} ${s.invoiceUnpaid}`;
  return s.invoiceStatus;
}

// ──────────────────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────────────────
export default function AdminKonceptIDPage({
  contract,
  invoices,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <>
      <h1 className={s.pageTitle}>KonceptID</h1>

      {contract === null ? (
        <p className={s.emptyState}>Nu există un contract activ pentru acest proiect.</p>
      ) : (
        <>
          {/* Contract activ */}
          <div className={s.section}>
            <p className={s.sectionTitle}>Contract activ</p>
            <div className={s.contractCard}>
              <div className={s.contractField}>
                <span className={s.contractLabel}>Client</span>
                <span className={s.contractValue}>{contract.clientName}</span>
              </div>
              <div className={s.contractField}>
                <span className={s.contractLabel}>Plan</span>
                <span className={s.contractValue}>{contract.plan}</span>
              </div>
              <div className={s.contractField}>
                <span className={s.contractLabel}>Preț lunar</span>
                <span className={s.contractValue}>
                  {contract.priceMonthly} {contract.currency}
                </span>
              </div>
              <div className={s.contractField}>
                <span className={s.contractLabel}>Dată start</span>
                <span className={s.contractValue}>{formatDate(contract.startDate)}</span>
              </div>
              <div className={s.contractField}>
                <span className={s.contractLabel}>Metodă plată</span>
                <span className={s.contractValue}>{contract.paymentMethod}</span>
              </div>
              <div className={s.contractField}>
                <span className={s.contractLabel}>Status</span>
                <span
                  className={`${s.statusBadge} ${contract.status === "active" ? s.statusActive : s.statusCancelled}`}
                >
                  {statusLabel(contract.status)}
                </span>
              </div>
              <div className={s.contractDownloadRow}>
                <a
                  href="https://raw.githubusercontent.com/BurcsaMatei/ZephiraEvents/main/data/konceptid/contract_ZE.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={s.downloadContractLink}
                >
                  ↓ Descarcă contract
                </a>
              </div>
            </div>
          </div>

          {/* Următoarea factură */}
          {(() => {
            const targetDate = invoices.length === 0 ? contract.startDate : contract.nextBillingDate;
            const daysLeft = Math.ceil((new Date(targetDate).getTime() - Date.now()) / 86400000);
            const paymentLink =
              contract.billingCycle === "annual"
                ? contract.paymentLinkAnnual
                : contract.billingCycle === "biannual"
                  ? contract.paymentLinkBiannual
                  : contract.paymentLinkMonthly;
            return (
              <div className={s.billingCard}>
                <div className={s.billingDays}>{daysLeft}</div>
                <div>
                  <p className={s.contractValue}>
                    {formatDate(targetDate)} — {contract.priceMonthly}{" "}
                    {contract.currency}
                  </p>
                  <p className={s.billingLabel}>
                    {invoices.length === 0
                      ? "zile până la prima factură"
                      : `${daysLeft === 1 ? "zi rămasă" : "zile rămase"} până la următoarea factură`}
                  </p>
                  <a
                    href={paymentLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={s.payNowBtn}
                  >
                    Plătește acum
                  </a>
                </div>
              </div>
            );
          })()}

          {/* Planuri disponibile */}
          <div className={s.section}>
            <p className={s.sectionTitle}>Planuri disponibile</p>
            <div className={s.plansGrid}>
              <div className={`${s.planCard}${contract.billingCycle === "monthly" ? ` ${s.planCardActive}` : ""}`}>
                {contract.billingCycle === "monthly" && (
                  <span className={s.planCurrentBadge}>Plan curent</span>
                )}
                <p className={s.planName}>Lunar</p>
                <p className={s.planPrice}>200 RON<span className={s.planPer}>/lună</span></p>
                <p className={s.planDiscount}>&nbsp;</p>
                <a
                  href={contract.paymentLinkMonthly}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${s.planBtn}${contract.billingCycle === "monthly" ? ` ${s.planBtnActive}` : ""}`}
                >
                  {contract.billingCycle === "monthly" ? "Plan curent" : "Alege"}
                </a>
              </div>
              <div className={`${s.planCard}${contract.billingCycle === "biannual" ? ` ${s.planCardActive}` : ""}`}>
                {contract.billingCycle === "biannual" && (
                  <span className={s.planCurrentBadge}>Plan curent</span>
                )}
                <p className={s.planName}>Bianual</p>
                <p className={s.planPrice}>183 RON<span className={s.planPer}>/lună</span></p>
                <p className={s.planDiscount}>Economisești 8%</p>
                <a
                  href={contract.paymentLinkBiannual}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${s.planBtn}${contract.billingCycle === "biannual" ? ` ${s.planBtnActive}` : ""}`}
                >
                  {contract.billingCycle === "biannual" ? "Plan curent" : "Alege"}
                </a>
              </div>
              <div className={`${s.planCard}${contract.billingCycle === "annual" ? ` ${s.planCardActive}` : ""}`}>
                {contract.billingCycle === "annual" && (
                  <span className={s.planCurrentBadge}>Plan curent</span>
                )}
                <p className={s.planName}>Anual</p>
                <p className={s.planPrice}>166 RON<span className={s.planPer}>/lună</span></p>
                <p className={s.planDiscount}>Economisești 17%</p>
                <a
                  href={contract.paymentLinkAnnual}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${s.planBtn}${contract.billingCycle === "annual" ? ` ${s.planBtnActive}` : ""}`}
                >
                  {contract.billingCycle === "annual" ? "Plan curent" : "Alege"}
                </a>
              </div>
            </div>
          </div>

          {/* Istoric facturi */}
          <div className={s.section}>
            <p className={s.sectionTitle}>Istoric facturi</p>
            {invoices.length === 0 ? (
              <p className={s.emptyState}>Nu există facturi înregistrate.</p>
            ) : (
              <div className={s.invoiceList}>
                {invoices.map((inv) => (
                  <div key={inv.id} className={s.invoiceRow}>
                    <span className={s.invoiceDate}>{formatDate(inv.createdAt)}</span>
                    <span className={s.invoiceAmount}>
                      {inv.amount} {inv.currency}
                    </span>
                    <span className={invoiceStatusClass(inv.status)}>
                      {invoiceStatusLabel(inv.status)}
                    </span>
                    {inv.invoicePdfUrl ? (
                      <a
                        href={inv.invoicePdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={s.downloadLink}
                      >
                        Descarcă PDF
                      </a>
                    ) : (
                      <span />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
}

AdminKonceptIDPage.getLayout = function getLayout(page: ReactElement) {
  return <AdminLayout>{page}</AdminLayout>;
};

// ──────────────────────────────────────────────────────────
// SSR
// ──────────────────────────────────────────────────────────
export const getServerSideProps: GetServerSideProps<Props> = async ({ req }) => {
  if (!verifyAdminSession(req)) {
    return { redirect: { destination: "/admin/login", permanent: false } };
  }

  try {
    const { content } = await getFile("data/konceptid/contract.json");
    const contract = JSON.parse(content) as ContractJson;

    const entries = await listFiles("data/konceptid/invoices");
    const jsonFiles = entries.filter(
      (e) => e.type === "file" && e.name.endsWith(".json") && e.name !== ".gitkeep",
    );

    const invoices = await Promise.all(
      jsonFiles.map(async (e) => {
        const { content: raw } = await getFile(e.path);
        return JSON.parse(raw) as InvoiceJson;
      }),
    );

    const sorted = invoices.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    return { props: { contract, invoices: sorted } };
  } catch {
    return { props: { contract: null, invoices: [] } };
  }
};
