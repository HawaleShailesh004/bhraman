import { notFound } from "next/navigation";
import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  HeartPulse,
  Mail,
  Phone,
  Shield,
} from "lucide-react";
import { OperatorPageHeader } from "@/components/operator/operator-shell";
import { getSessionOperator } from "@/lib/auth";
import { getOperatorBookingDetail } from "@/lib/operator";

export const dynamic = "force-dynamic";

export default async function OperatorBookingDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getSessionOperator();
  if (!session) return null;
  const booking = await getOperatorBookingDetail(
    session.operatorId,
    params.id,
  );
  if (!booking) notFound();

  return (
    <>
      <Link
        href="/operator/bookings"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-mist transition-colors hover:text-ink"
      >
        <ArrowLeft size={15} /> Back to bookings
      </Link>
      <OperatorPageHeader
        title={`Trip roster · ${booking.bookingRef}`}
        subtitle={`${booking.listingTitleSnapshot} · ${new Date(
          booking.startTimeSnapshot,
        ).toLocaleString("en-IN")}`}
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="reveal-up rounded-[14px] border border-line bg-white p-5 shadow-[var(--shadow-sm)] sm:p-6">
          <h2 className="font-display text-lg">Lead traveler</h2>
          <dl className="mt-5 space-y-4 text-sm">
            <div>
              <dt className="text-mist">Name</dt>
              <dd className="font-semibold">{booking.user.name}</dd>
            </div>
            <div>
              <dt className="text-mist">Email</dt>
              <dd>
                <a
                  className="inline-flex items-center gap-1.5 font-semibold text-forest hover:underline"
                  href={`mailto:${booking.customerEmail ?? booking.user.email}`}
                >
                  <Mail size={14} />
                {booking.customerEmail ?? booking.user.email}
                </a>
              </dd>
            </div>
            <div>
              <dt className="text-mist">Phone</dt>
              <dd>
                {booking.customerPhone ? (
                  <a
                    className="inline-flex items-center gap-1.5 font-semibold text-forest hover:underline"
                    href={`tel:${booking.customerPhone}`}
                  >
                    <Phone size={14} /> {booking.customerPhone}
                  </a>
                ) : (
                  <span className="font-semibold">Not captured</span>
                )}
              </dd>
            </div>
            <div>
              <dt className="text-mist">Group / lead gender</dt>
              <dd className="font-semibold">
                {booking.groupSize} travelers ·{" "}
                {booking.customerGender?.toLowerCase().replaceAll("_", " ") ??
                  "not shared"}
              </dd>
            </div>
          </dl>
        </section>

        <section
          className="reveal-up rounded-[14px] border border-forest/20 bg-[#EAF1EC] p-5 sm:p-6"
          style={{ animationDelay: "80ms" }}
        >
          <div className="flex items-center gap-2">
            <Shield size={18} className="text-forest" />
            <h2 className="font-display text-lg">Trip-day safety</h2>
          </div>
          <p className="mt-1 text-xs text-mist">
            Sensitive information. Use only for this trip and do not export.
          </p>
          <div className="mt-5 space-y-4">
            <div className="rounded-lg bg-white/80 p-4">
              <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-mist">
                <Phone size={14} /> Emergency contact
              </p>
              <p className="mt-2 font-semibold">
                {booking.emergencyContactName ?? "Not captured"}
              </p>
              <p className="text-sm text-[#54635A]">
                {booking.emergencyContactPhone ? (
                  <a
                    href={`tel:${booking.emergencyContactPhone}`}
                    className="font-semibold text-forest hover:underline"
                  >
                    {booking.emergencyContactPhone}
                  </a>
                ) : (
                  "No phone"
                )}
              </p>
            </div>
            <div className="rounded-lg bg-white/80 p-4">
              <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-mist">
                <HeartPulse size={14} /> Medical / accessibility notes
              </p>
              <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-[#33433A]">
                {booking.medicalNotes || "No notes provided."}
              </p>
            </div>
          </div>
        </section>
      </div>

      {booking.payment?.disputeStatus ? (
        <div className="mt-6 flex items-center gap-2 rounded-md border border-clay/20 bg-[#FFF7F5] p-4 text-sm text-clay">
          <AlertCircle size={17} />
          Escrow dispute:{" "}
          {booking.payment.disputeStatus
            .toLowerCase()
            .split("_")
            .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
            .join(" ")}
        </div>
      ) : null}
    </>
  );
}
