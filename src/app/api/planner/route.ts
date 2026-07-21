import Anthropic from "@anthropic-ai/sdk";
import type { ToolUseBlock } from "@anthropic-ai/sdk/resources/messages";
import {
  buildFallbackPlannerExplanation,
  fallbackPlannerFilters,
  getAnthropicClient,
  plannerModel,
  plannerToolResultRows,
  PLANNER_SYSTEM,
  prefersFemaleGuides,
  runSearchListings,
  searchListingsTool,
  toAnthropicMessages,
  type PlannerHistoryMessage,
} from "@/lib/anthropic";
import type { ListingCardData } from "@/types/listing";

type PlannerRequestBody = {
  userMessage?: unknown;
  history?: unknown;
};

function parseHistory(input: unknown): PlannerHistoryMessage[] {
  if (!Array.isArray(input)) return [];

  return input.flatMap((entry) => {
    if (
      typeof entry === "object" &&
      entry !== null &&
      "role" in entry &&
      "content" in entry &&
      (entry.role === "user" || entry.role === "assistant") &&
      typeof entry.content === "string"
    ) {
      return [{ role: entry.role, content: entry.content }];
    }
    return [];
  });
}

function getTextContent(message: Anthropic.Message) {
  return message.content
    .filter((block): block is Extract<typeof block, { type: "text" }> => block.type === "text")
    .map((block) => block.text)
    .join("");
}

function getToolUses(message: Anthropic.Message) {
  return message.content.filter(
    (block): block is ToolUseBlock =>
      block.type === "tool_use" && block.name === "searchListings",
  );
}

function mergeListings(rows: ListingCardData[]) {
  const byId = new Map<string, ListingCardData>();
  for (const row of rows) byId.set(row.id, row);
  return Array.from(byId.values()).slice(0, 6);
}

export async function POST(request: Request) {
  const body = (await request.json()) as PlannerRequestBody;
  const userMessage =
    typeof body.userMessage === "string" ? body.userMessage.trim() : "";
  const history = parseHistory(body.history);

  if (!userMessage) {
    return Response.json({ error: "Message is required." }, { status: 400 });
  }

  const searchOptions = {
    sourceMessage: userMessage,
    preferFemaleGuides: prefersFemaleGuides(userMessage),
  };

  const anthropic = getAnthropicClient();

  if (!anthropic) {
    const filters = fallbackPlannerFilters(userMessage);
    const listings = await runSearchListings(filters, searchOptions);
    const explanation = buildFallbackPlannerExplanation(userMessage, listings);
    return Response.json({ explanation, listings });
  }

  let firstPass: Anthropic.Message;

  try {
    firstPass = await anthropic.messages.create({
      model: plannerModel,
      max_tokens: 1024,
      system: PLANNER_SYSTEM,
      tools: [searchListingsTool],
      messages: toAnthropicMessages(history, userMessage),
    });
  } catch {
    const filters = fallbackPlannerFilters(userMessage);
    const listings = await runSearchListings(filters, searchOptions);
    const explanation = buildFallbackPlannerExplanation(userMessage, listings);
    return Response.json({ explanation, listings });
  }

  const toolUses = getToolUses(firstPass);
  let listings = [] as ListingCardData[];
  let explanation = getTextContent(firstPass);

  if (toolUses.length > 0) {
    const batches = await Promise.all(
      toolUses.map((toolUse) =>
        runSearchListings(
          (toolUse.input ?? {}) as Parameters<typeof runSearchListings>[0],
          searchOptions,
        ),
      ),
    );
    listings = mergeListings(batches.flat());

    try {
      const secondPass = await anthropic.messages.create({
        model: plannerModel,
        max_tokens: 1024,
        system: PLANNER_SYSTEM,
        tools: [searchListingsTool],
        messages: [
          ...toAnthropicMessages(history, userMessage),
          { role: "assistant", content: firstPass.content },
          {
            role: "user",
            content: toolUses.map((toolUse, index) => ({
              type: "tool_result" as const,
              tool_use_id: toolUse.id,
              content: JSON.stringify(plannerToolResultRows(batches[index] ?? [])),
            })),
          },
        ],
      });

      explanation = getTextContent(secondPass);
    } catch {
      explanation = buildFallbackPlannerExplanation(userMessage, listings);
    }
  }

  if (toolUses.length === 0) {
    const filters = fallbackPlannerFilters(userMessage);
    listings = await runSearchListings(filters, searchOptions);
    if (!explanation) {
      explanation = buildFallbackPlannerExplanation(userMessage, listings);
    }
  }

  if (listings.length === 0) {
    listings = await runSearchListings(
      fallbackPlannerFilters(userMessage),
      searchOptions,
    );
    explanation = buildFallbackPlannerExplanation(userMessage, listings);
  }

  return Response.json({ explanation, listings });
}
