import Anthropic from "@anthropic-ai/sdk";
import type { ToolUseBlock } from "@anthropic-ai/sdk/resources/messages";
import {
  buildFallbackPlannerExplanation,
  fallbackPlannerFilters,
  getAnthropicClient,
  plannerModel,
  plannerToolResultRows,
  PLANNER_SYSTEM,
  runSearchListings,
  searchListingsTool,
  toAnthropicMessages,
  type PlannerHistoryMessage,
} from "@/lib/anthropic";

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

function getToolUse(message: Anthropic.Message) {
  return (
    message.content.find(
      (block): block is ToolUseBlock => block.type === "tool_use" && block.name === "searchListings"
    ) ?? null
  );
}

export async function POST(request: Request) {
  const body = (await request.json()) as PlannerRequestBody;
  const userMessage =
    typeof body.userMessage === "string" ? body.userMessage.trim() : "";
  const history = parseHistory(body.history);

  if (!userMessage) {
    return Response.json({ error: "Message is required." }, { status: 400 });
  }

  const anthropic = getAnthropicClient();

  if (!anthropic) {
    const filters = fallbackPlannerFilters(userMessage);
    const listings = await runSearchListings(filters);
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
    const listings = await runSearchListings(filters);
    const explanation = buildFallbackPlannerExplanation(userMessage, listings);
    return Response.json({ explanation, listings });
  }

  const toolUse = getToolUse(firstPass);
  let listings = [] as Awaited<ReturnType<typeof runSearchListings>>;
  let explanation = getTextContent(firstPass);

  if (toolUse) {
    listings = await runSearchListings((toolUse.input ?? {}) as Parameters<typeof runSearchListings>[0]);

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
          content: [
            {
              type: "tool_result",
              tool_use_id: toolUse.id,
              content: JSON.stringify(plannerToolResultRows(listings)),
            },
          ],
        },
      ],
    });

    explanation = getTextContent(secondPass);
  }

  if (!toolUse) {
    const filters = fallbackPlannerFilters(userMessage);
    listings = await runSearchListings(filters);
    if (!explanation) {
      explanation = buildFallbackPlannerExplanation(userMessage, listings);
    }
  }

  return Response.json({ explanation, listings });
}
