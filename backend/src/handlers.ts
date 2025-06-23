import startingContext from "./InitialSystem";

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}
interface ChatRequest {
  messages: ChatMessage[];
}

interface Thread {
  id: string;
  title: string;
  createdAt: string;
  messages: ChatMessage[];
}


export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export function handleOptions(): Response {
  return new Response(null, { status: 204, headers: corsHeaders });
}

export function handleHealthCheck(): Response {
  return new Response("Server is up", { status: 200, headers: corsHeaders });
}

export async function handleChatRequest(request: Request, env: Record<string, string>): Promise<Response> {
  const apiKey = env.SECRET_OPENROUTER_API_KEY;
  const thread: Thread = await request.json();
  const { messages } = thread;
  console.log("the messages in the payload is")
  console.log(messages)
  const fullMessages = ensureSystemMessage(messages);
  console.log(fullMessages);

  const reply = await queryOpenRouter(fullMessages, apiKey);

  return new Response(reply, {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "text/plain" },
  });
}

// sanitize the text
function ensureSystemMessage(messages: ChatMessage[]): ChatMessage[] {
  const hasSystem = messages.some((msg) => msg.role === "system");

  const mergedContext = `
${startingContext}

---
You also receive a list of past messages in the messages array of the payload — representing a conversation between the user and you (the assistant).
Continue the conversation naturally, as if you are aware of the previous context.
`.trim();

  const fullSystemMessage: ChatMessage = {
    role: "system",
    content: mergedContext,
  };

  return hasSystem ? messages : [fullSystemMessage, ...messages];
}


async function queryOpenRouter(messages: ChatMessage[], apiKey: string): Promise<string> {
  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "mistralai/mistral-7b-instruct",
      messages,
    }),
  });

  const data: any = await res.json();
  return data.choices?.[0]?.message?.content || "No response";
}
