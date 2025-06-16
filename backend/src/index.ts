import startingContext from "./InitialSystem";


interface ChatMessage {
	role: "user" | "assistant" | "system";
	content: string;
  }
  
  interface ChatRequest {
	messages: ChatMessage[];
  }

  
export default {
  async fetch(request: Request, env: Record<string, string>): Promise<Response> {
    const apiKey = env.SECRET_OPENROUTER_API_KEY;
	const { method, url } = request;
    const pathname = new URL(url).pathname;
	if (method === "GET" && pathname==="/") {
		return new Response("Server is up", { status: 200 });
	  }
    else if (request.method !== "POST") {
      return new Response("Only POST supported", { status: 405 });
    }

    const body: ChatRequest = await request.json();
	const { messages } = body;


    const hasSystem = messages.some((msg: any) => msg.role === "system");
    const fullMessages = hasSystem
      ? messages
      : [{ role: "system", content: startingContext }, ...messages];

    const openrouterRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "mistralai/mistral-7b-instruct",
        messages: fullMessages
      }),
    });

    const data: any = await openrouterRes.json();
    const reply = data.choices?.[0]?.message?.content || "No response";

    return new Response(reply);
  }
};
