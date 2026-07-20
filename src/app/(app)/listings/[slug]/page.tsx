import { notFound } from "next/navigation";
import Link from "next/link";
import { MapPin, Clock, Users, Mountain, ChevronRight } from "lucide-react";
import { Button, DifficultyMeter, Eyebrow } from "@/components/ui/primitives";
import { CategoryIcon } from "@/components/ui/category-icon";
import {
  BookingPanelUi,
  InclusionsUi,
  ItineraryTimelineUi,
  ListingHeroImage,
  OperatorBlockUi,
  ReviewsUi,
  UpcomingBatchTrustUi,
  WeatherSignalUi,
} from "@/components/listing/detail-parts-ui";
import { KnowTheRoomListing } from "@/components/listing/know-the-room-listing";
import { ListingGalleryStrip } from "@/components/listing/listing-media-gallery";
import { formatInr } from "@/lib/format";
import { getListingDetail } from "@/lib/listings";
import { getWeatherSignal } from "@/lib/weather";

export const revalidate = 3600;

type ListingPageProps = {
  params: { slug: string };
};

export default async function ListingDetailPage({ params }: ListingPageProps) {
  const listing = await getListingDetail(params.slug);
  if (!listing) notFound();

  const weather = await getWeatherSignal(
    listing.place.latitude,
    listing.place.longitude,
  );

  return (
    <main className="min-h-screen overflow-x-clip bg-paper pb-[calc(5.5rem+env(safe-area-inset-bottom))] lg:pb-16">
      <section className="relative overflow-hidden">
        <ListingHeroImage listing={listing} />
        <div className="absolute inset-x-0 bottom-0">
          <div className="page-shell pb-6 sm:pb-8">
            <nav className="mb-3 flex flex-wrap items-center gap-1.5 text-sm text-white/80 sm:mb-4">
              <Link href="/" className="hover:text-white">
                Home
              </Link>
              <ChevronRight size={14} className="shrink-0" />
              <Link href="/discover" className="hover:text-white">
                Discover
              </Link>
              <ChevronRight size={14} className="shrink-0" />
              <span className="min-w-0 break-words text-white/60">
                {listing.category.name}
              </span>
            </nav>
            <div className="mb-3 flex flex-wrap items-center gap-2 sm:gap-3">
              <span className="inline-flex max-w-full items-center gap-1.5 rounded-full bg-amber px-3 py-1.5 text-xs font-bold text-amber-text">
                <CategoryIcon slug={listing.category.slug} size={12} />
                <span className="truncate">{listing.category.name}</span>
              </span>
              <span className="rounded-full bg-white/95 px-3 py-1.5">
                <DifficultyMeter difficulty={listing.difficulty} />
              </span>
            </div>
            <h1 className="max-w-4xl break-words font-display text-[clamp(1.6rem,6vw,3.25rem)] font-black leading-tight text-paper">
              {listing.title}
            </h1>
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-white/90 sm:gap-5">
              <span className="flex min-w-0 max-w-full items-start gap-1.5 break-words">
                <MapPin size={15} className="mt-0.5 shrink-0" />
                {listing.place.name}, {listing.place.district}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock size={15} className="shrink-0" />{" "}
                {listing.durationHours} hours
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Users size={15} className="shrink-0" />{" "}
                {listing.minGroupSize}–{listing.maxGroupSize} people
              </span>
              {listing.place.elevationM ? (
                <span className="inline-flex items-center gap-1.5">
                  <Mountain size={15} className="shrink-0" />{" "}
                  {listing.place.elevationM}m
                </span>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <section className="page-shell grid gap-5 py-8 sm:gap-5 sm:py-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,360px)]">
        <div className="min-w-0 space-y-10 sm:space-y-12">
          <div className="min-w-0">
            <p className="break-words font-serif text-base italic leading-relaxed text-ink-muted sm:text-lg">
              {listing.summary}
            </p>
            <p className="mt-4 break-words whitespace-pre-line leading-relaxed text-body-muted">
              {listing.description}
            </p>
          </div>

          <ListingGalleryStrip listing={listing} />

          <div className="lg:hidden">
            <WeatherSignalUi weather={weather} />
          </div>

          <div>
            <Eyebrow>The plan</Eyebrow>
            <h2 className="mb-6 font-display text-2xl">Your itinerary</h2>
            <ItineraryTimelineUi listing={listing} />
          </div>

          <div>
            <Eyebrow>Details</Eyebrow>
            <h2 className="mb-6 font-display text-2xl">What to expect</h2>
            <InclusionsUi listing={listing} />
          </div>

          <div>
            <Eyebrow>Traveler signals</Eyebrow>
            <h2 className="mb-6 font-display text-2xl">Know the room</h2>
            <KnowTheRoomListing listing={listing} />
          </div>

          <div>
            <Eyebrow>Your operator</Eyebrow>
            <h2 className="mb-6 font-display text-2xl">Meet your operator</h2>
            <OperatorBlockUi listing={listing} />
          </div>

          <div>
            <Eyebrow>Reviews</Eyebrow>
            <h2 className="mb-6 font-display text-2xl">What adventurers say</h2>
            <ReviewsUi
              reviews={listing.reviews}
              ratingAvg={listing.ratingAvg}
              ratingCount={listing.ratingCount}
            />
          </div>
        </div>

        <div className="min-w-0 space-y-5">
          <div className="hidden lg:block">
            <WeatherSignalUi weather={weather} />
          </div>
          <UpcomingBatchTrustUi listing={listing} />
          <div className="hidden lg:block">
            <BookingPanelUi listing={listing} />
          </div>
        </div>
      </section>

      <div className="safe-pb fixed inset-x-0 bottom-0 z-40 border-t border-line bg-paper/95 px-4 py-3 backdrop-blur-xl lg:hidden">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
          <div className="min-w-0 truncate">
            <p className="truncate font-display text-xl font-extrabold">
              {formatInr(listing.basePrice)}
            </p>
            <p className="text-[11px] text-mist">per person</p>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-1">
            <Button href={`/book/${listing.slug}`} className="px-5 py-3 sm:px-6">
              Reserve now
            </Button>
            <p className="max-w-[11rem] text-right text-[10px] leading-snug text-mist">
              We hold your money · Operator paid after your trip
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
