const BACKEND_URL = "http://13.247.70.10:8000";

const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export const onRequest = async (context: any) => {
  if (context.request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  const url = new URL(context.request.url);
  const backendUrl = BACKEND_URL + url.pathname + url.search;

  // Build clean headers — do NOT forward Host
  const headers: Record<string, string> = {
    "Content-Type": context.request.headers.get("Content-Type") || "application/json",
  };
  const auth = context.request.headers.get("Authorization");
  if (auth) headers["Authorization"] = auth;

  const isBodyMethod = !["GET", "HEAD"].includes(context.request.method);

  const res = await fetch(backendUrl, {
    method: context.request.method,
    headers,
    body: isBodyMethod ? await context.request.text() : undefined,
  });

  const newHeaders = new Headers();
  newHeaders.set("Content-Type", res.headers.get("Content-Type") || "application/json");
  Object.entries(CORS_HEADERS).forEach(([k, v]) => newHeaders.set(k, v));

  return new Response(res.body, {
    status: res.status,
    headers: newHeaders,
  });
};
