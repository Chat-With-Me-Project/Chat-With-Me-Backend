import startingContext from "./InitialSystem";
import { corsHeaders, handleOptions, handleHealthCheck, handleChatRequest } from "./handlers";

export default {
  async fetch(request: Request, env: Record<string, string>): Promise<Response> {
    const { method, url } = request;
    const pathname = new URL(url).pathname;

    if (method === "OPTIONS") return handleOptions();
    if (method === "GET" && pathname === "/") return handleHealthCheck();
    if (method === "POST" && pathname === "/chat") return handleChatRequest(request, env);

    return new Response("Not Found", { status: 404, headers: corsHeaders });
  },
};
