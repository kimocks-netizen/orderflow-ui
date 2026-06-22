const BACKEND_URL = "http://13.247.70.10:8000";

export const onRequest = async () => {
  return fetch(`${BACKEND_URL}/health`);
};
