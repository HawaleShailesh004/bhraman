import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  BadgeCheck,
  BriefcaseBusiness,
  MapPin,
  ShieldCheck,
  Star,
  Users,
} from "lucide-react";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { ListingCardUi } from "@/components/discovery/listing-card-ui";
import { getPublicOperatorProfile } from "@/lib/listings";
import { listingImageStyle, operatorInitials } from "@/lib/ui-present";

type OperatorProfilePageProps = {
  params: { slug: string };
};

export async function generateMetadata({
  params,
}: OperatorProfilePageProps): Promise<Metadata> {
  const operator = await getPublicOperatorProfile(params.slug);
  if (!operator) return {};
  return {
    title: `${operator.businessName} | Bhraman`,
    description: operator.bio.slice(0, 155),
  };
}

export default async function OperatorProfilePage({
  params,
}: OperatorProfilePageProps) {
  const operator = await getPublicOperatorProfile(params.slug);
  if (!operator) notFound();

  const cover = operator.galleryUrls[0] ?? null;
  const verified = operator.verificationStatus === "VERIFIED";

  return (
    <main className="min-h-screen bg-paper">
      <Navbar onDark />
      <section
        className="relative min-h-[380px] overflow-hidden pt-28 sm:min-h-[420px] sm:pt-32"
        style={listingImageStyle("trekking", cover)}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/65 to-ink/30" />
        <div className="page-shell relative pb-10 sm:pb-12">
          <Link
            href="/operators"
            className="mb-5 inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-white/75 transition-colors hover:text-white sm:mb-7"
          >
            <ArrowLeft size={15} /> All operators
          </Link>
          <div className="reveal-up flex items-end gap-3 sm:gap-5">
          <div className="grid h-14 w-14 shrink-0 place-items-center rounded-md border border-white/20 bg-forest text-lg font-black text-paper shadow-xl sm:h-20 sm:w-20 sm:rounded-lg sm:text-2xl">
            {operatorInitials(operator.businessName)}
          </div>
          <div className="min-w-0">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              {verified ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber px-3 py-1 text-xs font-bold text-amber-text">
                  <BadgeCheck size={14} /> Verified operator
                </span>
              ) : (
                <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-paper">
                  {operator.verificationStatus === "PENDING"
                    ? "Verification in review"
                    : "Verification not started"}
                </span>
              )}
            </div>
            <h1 className="break-words font-display text-[clamp(1.75rem,7vw,3.6rem)] font-black leading-tight text-paper">
              {operator.businessName}
            </h1>
            <p className="mt-2 flex items-center gap-1.5 text-sm text-white/80">
              <MapPin size={15} /> Based in {operator.baseCity}
            </p>
          </div>
          </div>
        </div>
      </section>

      <section className="page-shell py-8 sm:py-12">
        <div className="grid gap-6 lg:grid-cols-[1fr_320px] lg:gap-8">
          <div className="reveal-up min-w-0">
            <p className="eyebrow">About the operator</p>
            <h2 className="sec-title">Local experience, visible standards</h2>
            <p className="mt-5 whitespace-pre-line leading-7 text-body-muted">
              {operator.bio}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2.5 sm:gap-3" aria-label="Operator trust signals">
            {[
              {
                icon: BriefcaseBusiness,
                value:
                  operator.yearsOperating === null
                    ? "Not provided"
                    : `${operator.yearsOperating}+ years`,
                label: "Operating",
              },
              {
                icon: ShieldCheck,
                value: operator.insuranceStatus ? "Covered" : "Not verified",
                label: operator.insuranceProvider ?? "Insurance",
              },
              {
                icon: Users,
                value:
                  operator.totalGuideCount > 0
                    ? `${operator.femaleGuideCount}/${operator.totalGuideCount}`
                    : "Not provided",
                label: "Women guides",
              },
              {
                icon: Star,
                value:
                  operator.ratingCount > 0
                    ? operator.ratingAvg.toFixed(1)
                    : "New",
                label: `${operator.ratingCount} verified reviews`,
              },
            ].map((item) => {
              const isPlaceholder =
                item.value === "Not provided" ||
                item.value === "Not verified" ||
                item.value === "New";
              return (
              <div
                key={item.label}
                className="reveal-up rounded-md border border-line bg-white p-3 shadow-[var(--shadow-sm)] transition-transform duration-200 hover:-translate-y-0.5 sm:p-4"
                style={{ animationDelay: "100ms" }}
              >
                <item.icon size={18} className="mb-2 text-forest sm:mb-3" />
                <p
                  className={`break-words font-display text-base font-extrabold sm:text-lg ${
                    isPlaceholder ? "text-mist" : ""
                  }`}
                >
                  {item.value}
                </p>
                <p className="mt-1 text-[11px] text-mist sm:text-xs">{item.label}</p>
              </div>
              );
            })}
          </div>
        </div>

        <div className="mt-8 flex items-start gap-3 rounded-[14px] border border-line bg-[#EAF1EC] p-4 text-sm text-[#33433A]">
          <ShieldCheck size={19} className="mt-0.5 shrink-0 text-forest" />
          <p>
            <strong className="text-ink">How to read these signals:</strong>{" "}
            verification confirms submitted business details. Insurance and
            team information are shown separately so you can make an informed
            choice for each trip.
          </p>
        </div>

        {operator.galleryUrls.length > 1 ? (
          <div className="mt-12">
            <p className="eyebrow">From past trips</p>
            <div className="mt-4 grid auto-rows-[120px] grid-cols-2 gap-3 md:auto-rows-[140px] md:grid-cols-4">
              {operator.galleryUrls.slice(0, 8).map((url, index) => (
                <div
                  key={url}
                  className={`reveal-scale rounded-md bg-cover bg-center transition-transform duration-300 hover:scale-[1.01] ${
                    index === 0 ? "col-span-2 row-span-2" : ""
                  }`}
                  style={listingImageStyle("trekking", url)}
                  role="img"
                  aria-label={`${operator.businessName} trip photo ${index + 1}`}
                />
              ))}
            </div>
          </div>
        ) : null}

        <div className="mt-12 sm:mt-16">
          <p className="eyebrow">Book with this operator</p>
          <h2 className="sec-title">Active experiences</h2>
          {operator.listings.length > 0 ? (
            <div className="mt-5 grid gap-4 sm:mt-7 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
              {operator.listings.map((listing, index) => (
                <ListingCardUi
                  key={listing.id}
                  listing={listing}
                  index={index}
                />
              ))}
            </div>
          ) : (
            <p className="mt-6 rounded-[14px] border border-dashed border-line bg-white p-8 text-center text-mist">
              No active experiences right now.
            </p>
          )}
        </div>
      </section>
      <Footer />
    </main>
  );
}
