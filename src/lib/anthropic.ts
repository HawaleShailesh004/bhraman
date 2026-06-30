import "server-only";

import Anthropic from "@anthropic-ai/sdk";
import type { MessageParam, Tool } from "@anthropic-ai/sdk/resources/messages";
import type { Difficulty } from "@prisma/client";
import { searchPlannerListings } from "@/lib/listings";
import type { ListingCardData, ListingFilters } from "@/types/listing";

let anthropicClient: Anthropic | null = null;

export function getAnthropicClient() {
  if (!process.env.ANTHROPIC_API_KEY) {
    return null;
  }

  anthropicClient ??= new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });

  return anthropicClient;
}

export const plannerModel = "claude-sonnet-4-6";

type PlannerSearchInput = {
  categories?: Array<
    "trekking" | "rafting" | "camping" | "paragliding" | "rappelling" | "caving" | "kayaking"
  >;
  maxPrice?: number;
  difficulty?: Difficulty[];
  nearCity?: string;
  maxDurationHours?: number;
  preferredDate?: string;
};

type PlannerCategory = NonNullable<ListingFilters["categories"]>[number];

export const searchListingsTool: Tool = {
  name: "searchListings",
  description:
    "Search real, bookable adventure listings in the Bhraman marketplace. ALWAYS use this to find listings. NEVER invent or recall listings from memory. Only listings returned by this tool exist and are bookable.",
  input_schema: {
    type: "object",
    properties: {
      categories: {
        type: "array",
        items: {
          type: "string",
          enum: [
            "trekking",
            "rafting",
            "camping",
            "paragliding",
            "rappelling",
            "caving",
            "kayaking",
          ],
        },
      },
      maxPrice: { type: "number", description: "Max price per person in INR" },
      difficulty: {
        type: "array",
        items: {
          type: "string",
          enum: ["EASY", "MODERATE", "CHALLENGING", "EXTREME"],
        },
      },
      nearCity: {
        type: "string",
        description: "City or region the traveler starts from",
      },
      maxDurationHours: { type: "number" },
      preferredDate: {
        type: "string",
        description: "ISO date, e.g. 2026-10-12",
      },
    },
    required: [],
  },
};

export const PLANNER_SYSTEM = `You are Bhraman's trip planner for Maharashtra adventure travel.
RULES:
- You may ONLY recommend listings returned by the searchListings tool. Never invent, recall, or describe listings that did not come from the tool. If the tool returns nothing, say so honestly and suggest loosening one constraint (budget, date, or difficulty).
- Reference each listing by its real title. Do not state a price unless it came from the tool.
- Briefly explain why each listing fits the user's stated constraints (budget, difficulty, location, date).
- Be concise. Rank by fit. Never promise availability the tool didn't confirm.`;

function extractBudget(message: string) {
  const budgetMatch =
    message.match(/₹\s?(\d[\d,]*)/) ?? message.match(/\b(\d[\d,]*)\s*(?:rs|inr)\b/i);
  if (!budgetMatch) return undefined;
  return Number(budgetMatch[1].replace(/,/g, ""));
}

function extractDuration(message: string) {
  const hourMatch = message.match(/(\d+(?:\.\d+)?)\s*(?:hour|hours|hr|hrs)\b/i);
  return hourMatch ? Number(hourMatch[1]) : undefined;
}

function extractDifficulty(message: string): Difficulty[] | undefined {
  const lower = message.toLowerCase();
  if (lower.includes("beginner") || lower.includes("easy")) return ["EASY"];
  if (lower.includes("intermediate") || lower.includes("moderate")) return ["MODERATE"];
  if (lower.includes("challenging")) return ["CHALLENGING"];
  if (lower.includes("extreme") || lower.includes("advanced")) return ["EXTREME"];
  return undefined;
}

function extractCategories(message: string): ListingFilters["categories"] {
  const lower = message.toLowerCase();
  const categoryMap: Array<{ slug: PlannerCategory; terms: string[] }> = [
    { slug: "trekking", terms: ["trek", "trekking", "hike", "summit", "fort"] },
    { slug: "rafting", terms: ["rafting", "river"] },
    { slug: "camping", terms: ["camp", "camping"] },
    { slug: "paragliding", terms: ["paragliding", "glide"] },
    { slug: "rappelling", terms: ["rappel", "rappelling", "waterfall"] },
    { slug: "caving", terms: ["cave", "caving"] },
    { slug: "kayaking", terms: ["kayak", "kayaking"] },
  ];

  const matches = categoryMap
    .filter((category) => category.terms.some((term) => lower.includes(term)))
    .map((category) => category.slug);

  return matches.length > 0 ? matches : undefined;
}

function extractCity(message: string) {
  const cities = [
    "pune",
    "mumbai",
    "lonavala",
    "kolad",
    "nashik",
    "bari",
    "igatpuri",
    "kamshet",
    "karjat",
  ];
  const lower = message.toLowerCase();
  return cities.find((city) => lower.includes(city));
}

function extractPreferredDate(message: string) {
  const isoDateMatch = message.match(/\b(20\d{2}-\d{2}-\d{2})\b/);
  if (isoDateMatch) return isoDateMatch[1];

  const lower = message.toLowerCase();
  const today = new Date();
  if (lower.includes("this weekend") || lower.includes("saturday") || lower.includes("sunday")) {
    const date = new Date(today);
    while (date.getDay() !== 6) {
      date.setDate(date.getDate() + 1);
    }
    return date.toISOString().slice(0, 10);
  }

  return undefined;
}

export function fallbackPlannerFilters(message: string): PlannerSearchInput {
  return {
    categories: extractCategories(message) as PlannerSearchInput["categories"],
    maxPrice: extractBudget(message),
    difficulty: extractDifficulty(message),
    nearCity: extractCity(message),
    maxDurationHours: extractDuration(message),
    preferredDate: extractPreferredDate(message),
  };
}

export async function runSearchListings(input: PlannerSearchInput): Promise<ListingCardData[]> {
  const filters: ListingFilters = {
    categories: input.categories,
    maxPrice: input.maxPrice,
    difficulty: input.difficulty,
    city: input.nearCity,
    maxDurationHours: input.maxDurationHours,
    date: input.preferredDate,
    sort: "rating",
  };

  return searchPlannerListings(filters);
}

export function plannerToolResultRows(rows: ListingCardData[]) {
  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    price: row.basePrice,
    difficulty: row.difficulty,
    durationHours: row.durationHours,
    place: row.place.name,
    city: row.place.city,
    category: row.category.name,
  }));
}

export function buildFallbackPlannerExplanation(
  userMessage: string,
  rows: ListingCardData[]
) {
  if (rows.length === 0) {
    return "I couldn't find a real listing that fits all of that right now. Try loosening one constraint like budget, date, or difficulty and I'll search again.";
  }

  const locationHint = extractCity(userMessage);
  const budgetHint = extractBudget(userMessage);
  const intro = [
    locationHint ? `I searched around ${locationHint}.` : "I searched the current marketplace catalog.",
    budgetHint ? `I kept the shortlist under ${budgetHint.toLocaleString("en-IN")} INR per person.` : null,
    `I found ${rows.length} real match${rows.length === 1 ? "" : "es"} ranked by fit.`,
  ]
    .filter(Boolean)
    .join(" ");

  const bullets = rows
    .map(
      (row, index) =>
        `${index + 1}. ${row.title} fits because it is in ${row.place.city}, costs ₹${row.basePrice.toLocaleString(
          "en-IN"
        )} per person, and matches the ${row.category.name.toLowerCase()} / ${row.difficulty.toLowerCase()} profile.`
    )
    .join("\n");

  return `${intro}\n${bullets}`;
}

export type PlannerHistoryMessage = {
  role: "user" | "assistant";
  content: string;
};

export function toAnthropicMessages(history: PlannerHistoryMessage[], userMessage: string): MessageParam[] {
  return [
    ...history.map((message) => ({
      role: message.role,
      content: message.content,
    })),
    { role: "user", content: userMessage },
  ];
}
