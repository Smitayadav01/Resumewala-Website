import { store } from "../store/store";
import { refreshSession, clearCredentials } from "../store/authSlice";
import { getAccessToken } from "../store/tokenStore";

const API_URL = import.meta.env.VITE_API_URL;

type AuthFetchOptions = RequestInit & {
  skipRefresh?: boolean;
};

export const authFetch = async (
  pathOrUrl: string,
  options: AuthFetchOptions = {}
): Promise<Response> => {
  const { skipRefresh, headers, ...requestOptions } = options;
  const token = getAccessToken();
  const url = pathOrUrl.startsWith("http") ? pathOrUrl : `${API_URL}${pathOrUrl}`;
  const requestHeaders = new Headers(headers);

  if (token) {
    requestHeaders.set("Authorization", `Bearer ${token}`);
  }

  let response = await fetch(url, {
    ...requestOptions,
    credentials: "include",
    headers: requestHeaders,
  });

  if (response.status !== 401 || skipRefresh) {
    return response;
  }

  const refreshed = await store.dispatch(refreshSession());

  if (refreshSession.rejected.match(refreshed)) {
    store.dispatch(clearCredentials());
    return response;
  }

  const nextToken = getAccessToken();
  const retryHeaders = new Headers(headers);

  if (nextToken) {
    retryHeaders.set("Authorization", `Bearer ${nextToken}`);
  }

  response = await fetch(url, {
    ...requestOptions,
    credentials: "include",
    headers: retryHeaders,
  });

  return response;
};
