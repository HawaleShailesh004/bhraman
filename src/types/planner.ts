import type { ListingCardData } from "@/types/listing";

export type PlannerResponse = {
  explanation: string;
  listings: ListingCardData[];
};

export type PlannerChatMessage = {
  role: "user" | "assistant";
  content: string;
};
