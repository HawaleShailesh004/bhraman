import Link from "next/link";
import { countOperatorsAtPlace } from "@/lib/compare";

export async function ComparePlaceBanner({
  placeSlug,
  placeName,
}: {
  placeSlug: string;
  placeName: string;
}) {
  const operatorCount = await countOperatorsAtPlace(placeSlug);
  if (operatorCount < 2) return null;

  return (
    <div className="rounded-[14px] border border-forest/20 bg-[#EAF1EC] px-4 py-3 text-sm">
      <p className="font-semibold text-ink">
        Compare {operatorCount} operators at {placeName}
      </p>
      <p className="mt-1 text-body-muted">
        Same location, different prices, safety scores, and batch mix.
      </p>
      <Link
        href={`/compare/${placeSlug}`}
        className="mt-2 inline-block text-sm font-bold text-forest hover:underline"
      >
        View comparison →
      </Link>
    </div>
  );
}
