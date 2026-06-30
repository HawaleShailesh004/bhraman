import { notFound } from "next/navigation";
import Link from "next/link";
import { MapPin, Clock, Users, Mountain, ChevronRight } from "lucide-react";
import { DifficultyMeter, Eyebrow } from "@/components/ui/primitives";
import { CategoryIcon } from "@/components/ui/category-icon";
import {
  BookingPanelUi,
  InclusionsUi,
  ItineraryTimelineUi,
  ListingHeroImage,
  OperatorBlockUi,
  ReviewsUi,
  WeatherSignalUi,
} from "@/components/listing/detail-parts-ui";
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
    listing.place.longitude
  );

  return (
    <main className="min-h-screen bg-paper pb-28 lg:pb-16">
      <section className="relative">
        <ListingHeroImage listing={listing} />
        <div className="absolute bottom-0 left-0 right-0">
          <div className="max-w-6xl mx-auto px-6 pb-8">
            <nav className="flex items-center gap-1.5 text-white/80 text-sm mb-4">
              <Link href="/" className="hover:text-white">
                Home
              </Link>
              <ChevronRight size={14} />
              <Link href="/discover" className="hover:text-white">
                Discover
              </Link>
              <ChevronRight size={14} />
              <span className="text-white/60">{listing.category.name}</span>
            </nav>
            <div className="flex items-center gap-3 mb-3">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber px-3 py-1.5 text-xs font-bold text-[#3A2406]">
                <CategoryIcon slug={listing.category.slug} size={12} />
                {listing.category.name}
              </span>
              <span className="bg-white/95 rounded-full px-3 py-1.5">
                <DifficultyMeter difficulty={listing.difficulty} />
              </span>
            </div>
            <h1 className="font-display font-black text-paper text-[clamp(28px,5vw,52px)] leading-tight max-w-4xl">
              {listing.title}
            </h1>
            <div className="flex items-center gap-5 text-white/90 text-sm mt-3 flex-wrap">
              <span className="flex items-center gap-1.5">
                <MapPin size={15} /> {listing.place.name}, {listing.place.district}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock size={15} /> {listing.durationHours} hours
              </span>
              <span className="flex items-center gap-1.5">
                <Users size={15} /> {listing.minGroupSize}–{listing.maxGroupSize} people
              </span>
              {listing.place.elevationM ? (
                <span className="flex items-center gap-1.5">
                  <Mountain size={15} /> {listing.place.elevationM}m
                </span>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-12 grid lg:grid-cols-[1fr_360px] gap-10">
        <div className="space-y-12">
          <div>
            <p className="text-lg text-[#33433A] leading-relaxed font-serif italic">
              {listing.summary}
            </p>
            <p className="text-[#54635A] leading-relaxed mt-4 whitespace-pre-line">
              {listing.description}
            </p>
          </div>

          <div className="lg:hidden">
            <WeatherSignalUi weather={weather} />
          </div>

          <div>
            <Eyebrow>The plan</Eyebrow>
            <h2 className="font-display text-2xl mb-6">Your itinerary</h2>
            <ItineraryTimelineUi listing={listing} />
          </div>

          <div>
            <Eyebrow>Details</Eyebrow>
            <h2 className="font-display text-2xl mb-6">What to expect</h2>
            <InclusionsUi listing={listing} />
          </div>

          <div>
            <Eyebrow>Your operator</Eyebrow>
            <h2 className="font-display text-2xl mb-6">Run by verified experts</h2>
            <OperatorBlockUi listing={listing} />
          </div>

          <div>
            <Eyebrow>Reviews</Eyebrow>
            <h2 className="font-display text-2xl mb-6">What adventurers say</h2>
            <ReviewsUi
              reviews={listing.reviews}
              ratingAvg={listing.ratingAvg}
              ratingCount={listing.ratingCount}
            />
          </div>
        </div>

        <div className="space-y-5">
          <div className="hidden lg:block">
            <WeatherSignalUi weather={weather} />
          </div>
          <BookingPanelUi listing={listing} />
        </div>
      </section>
    </main>
  );
}
