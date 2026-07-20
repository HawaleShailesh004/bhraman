import Link from "next/link";
import { ArrowLeft, MapPin } from "lucide-react";
import { OperatorAvatar } from "@/components/ui/operator-avatar";
import { VerificationStatusPill } from "@/components/ui/verified-badge";
import { resolveOperatorBanner } from "@/lib/operator-media";

/**
 * Dynamic operator profile hero: custom banner → trip photo → human/theme default.
 * Avatar prefers logoUrl, else a real guide-style portrait (trust signal).
 */
export function OperatorProfileHero({
  businessName,
  baseCity,
  verificationStatus,
  logoUrl,
  bannerUrl,
  galleryFirst,
}: {
  businessName: string;
  baseCity: string;
  verificationStatus: "UNVERIFIED" | "PENDING" | "VERIFIED";
  logoUrl?: string | null;
  bannerUrl?: string | null;
  galleryFirst?: string | null;
}) {
  const banner = resolveOperatorBanner(bannerUrl, galleryFirst);

  return (
    <section className="relative min-h-[380px] overflow-hidden pt-28 sm:min-h-[420px] sm:pt-32">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={banner}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to top, rgba(14,27,19,0.92) 0%, rgba(14,27,19,0.55) 45%, rgba(14,27,19,0.28) 100%)",
        }}
      />
      <div className="page-shell relative pb-10 sm:pb-12">
        <Link
          href="/operators"
          className="mb-5 inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-white/75 transition-colors hover:text-white sm:mb-7"
        >
          <ArrowLeft size={15} /> All operators
        </Link>
        <div className="reveal-up flex items-end gap-3 sm:gap-5">
          <OperatorAvatar
            name={businessName}
            src={logoUrl}
            size="xl"
            rounded="lg"
            className="border-white/25 shadow-xl"
          />
          <div className="min-w-0">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <VerificationStatusPill status={verificationStatus} />
            </div>
            <h1 className="break-words font-display text-[clamp(1.75rem,7vw,3.6rem)] font-medium leading-tight text-paper">
              {businessName}
            </h1>
            <p className="mt-2 flex items-center gap-1.5 text-sm text-white/80">
              <MapPin size={15} /> Based in {baseCity}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
