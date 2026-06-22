const BACKEND_URL = "http://13.247.70.10:8000";

export const onRequest: PagesFunction = async (context) => {
  const url = new URL(context.request.url);
  const backendUrl = new URL(url.pathname + url.search, BACKEND_URL);

  return fetch(backendUrl.toString(), {
    method: context.request.method,
    headers: context.request.headers,
    body:
      context.request.method === "GET" || context.request.method === "HEAD"
        ? undefined
        : context.request.body,
  });
};
