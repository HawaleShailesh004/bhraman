import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  BriefcaseBusiness,
  ShieldCheck,
  Star,
  Users,
} from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { ListingCardUi } from "@/components/discovery/listing-card-ui";
import { OperatorProfileHero } from "@/components/operators/operator-profile-hero";
import { getPublicOperatorProfile } from "@/lib/listings";
import { listingImageStyle } from "@/lib/ui-present";

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

  return (
    <main className="min-h-screen bg-paper">
      <Navbar onDark />
      <OperatorProfileHero
        businessName={operator.businessName}
        baseCity={operator.baseCity}
        verificationStatus={operator.verificationStatus}
        logoUrl={operator.logoUrl}
        bannerUrl={operator.bannerUrl}
        galleryFirst={operator.galleryUrls[0] ?? null}
      />

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
