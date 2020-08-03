import React, { useMemo, useEffect, useState } from "react";
import fetch from "isomorphic-unfetch";
import { useAuth0 } from "@auth0/auth0-react";

import { logger } from "./logger";
import { createApolloClient } from "./apollo-create";

export function initializeApollo(initialState = null, bearerToken = "") {
  const apolloClient = createApolloClient(initialState, bearerToken);

  // If your page has Next.js data fetching methods that use Apollo Client, the initial state
  // gets hydrated here
  if (initialState) {
    apolloClient.cache.restore(initialState);
  }

  return apolloClient;
}

export function useApollo(initialState) {
  const { isAuthenticated, getTokenSilently } = useAuth0({
    audience: "https://natwelch.com",
  });
  const [bearerToken, setBearerToken] = useState("");
  useEffect(() => {
    const getToken = async () => {
      const token = isAuthenticated ? await getTokenSilently() : "";
      setBearerToken(token);
    };
    getToken();
  }, [getTokenSilently, isAuthenticated]);
  const store = useMemo(() => initializeApollo(initialState, bearerToken), [
    initialState,
    bearerToken,
  ]);

  return store;
}
