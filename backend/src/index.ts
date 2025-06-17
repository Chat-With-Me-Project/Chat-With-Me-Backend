import startingContext from "./InitialSystem";

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

interface ChatRequest {
  messages: ChatMessage[];
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export default {
  async fetch(request: Request, env: Record<string, string>): Promise<Response> {
    const { method, url } = request;
    const pathname = new URL(url).pathname;

    // Handle preflight OPTIONS request
    if (method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders,
      });
    }

    // Simple health check
    if (method === "GET" && pathname === "/") {
      return new Response("Server is up", {
        status: 200,
        headers: corsHeaders,
      });
    }

    // Only allow POST to /chat
    if (method !== "POST" || pathname !== "/chat") {
      return new Response("Not Found", {
        status: 404,
        headers: corsHeaders,
      });
    }

    const apiKey = env.SECRET_OPENROUTER_API_KEY;
    const body: ChatRequest = await request.json();
    const { messages } = body;

    const hasSystem = messages.some((msg) => msg.role === "system");
    const fullMessages = hasSystem
      ? messages
      : [{ role: "system", content: startingContext }, ...messages];

    const openrouterRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "mistralai/mistral-7b-instruct",
        messages: fullMessages,
      }),
    });

    const data: any = await openrouterRes.json();
    const reply = data.choices?.[0]?.message?.content || "No response";

    return new Response(reply, {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "text/plain",
      },
    });
  },
};
