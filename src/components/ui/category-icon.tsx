import {
  Castle,
  Mountain,
  MoveDown,
  Sailboat,
  Tent,
  Triangle,
  Waves,
  Wind,
  type LucideIcon,
} from "lucide-react";

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  trekking: Mountain,
  rafting: Waves,
  camping: Tent,
  paragliding: Wind,
  rappelling: MoveDown,
  caving: Triangle,
  kayaking: Sailboat,
  fort: Castle,
};

export function getCategoryIcon(slug: string): LucideIcon {
  return CATEGORY_ICONS[slug] ?? Mountain;
}

export function CategoryIcon({
  slug,
  size = 14,
  className,
}: {
  slug: string;
  size?: number;
  className?: string;
}) {
  const Icon = getCategoryIcon(slug);
  return <Icon size={size} className={className} aria-hidden />;
}
