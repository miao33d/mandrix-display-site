const DEFAULT_API_ORIGIN = "https://www.mandrix.top";

export async function onRequest(context) {
  const { request, env, params } = context;
  const path = Array.isArray(params.path) ? params.path.join("/") : String(params.path || "");
  const apiOrigin = String(env.API_ORIGIN || DEFAULT_API_ORIGIN).replace(/\/+$/, "");
  const targetUrl = new URL(request.url);
  targetUrl.protocol = "https:";
  targetUrl.host = new URL(apiOrigin).host;
  targetUrl.pathname = `/api/${path}`;

  const proxiedRequest = new Request(targetUrl.toString(), request);
  const response = await fetch(proxiedRequest);
  const headers = new Headers(response.headers);
  headers.set("Access-Control-Allow-Origin", "*");
  headers.set("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS");
  headers.set("Access-Control-Allow-Headers", "Content-Type, x-admin-token, authorization");

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
