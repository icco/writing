import gql from "graphql-tag";
import { useAuth } from "use-auth0-hooks";
import { useLazyQuery } from "@apollo/react-hooks";
import { useLocalStorage } from "react-use";
import { createApolloClient } from "./apollo-create";

export const whoami = gql`
  query user {
    whoami {
      id
      role
    }
  }
`;

const AccessTokenStorageKey = "natwelch.com:accessToken";

export function useLoggedIn() {
  const authData = useAuth({
    audience: "https://natwelch.com",
  });
  const [value, updateCookie]  = useCookie(AccessTokenStorageKey);
  const [getUser, queryData] = useLazyQuery(whoami, {
    fetchPolicy: "no-cache",
    ssr: false,
  });
  const always = {
    login: authData.login,
    logout: authData.logout,
  };

  if (authData.loading || (queryData.loading && queryData.called)) {
    return { ...always, loading: true };
  }

  if (authData.error) {
    return { error: authData.error };
  }

  if (queryData.error) {
    return { error: queryData.error };
  }

  if (!authData.isAuthenticated) {
    return {
      ...always,
      loading: false,
    };
  }

  if (value != authData.accessToken) {
    updateCookie(authData.accessToken);
  } else {
    if (
      (!authData.isLoading || authData.isAuthenticated) &&
      !queryData.called
    ) {
      getUser({ client: createApolloClient() });
    }

    if (!queryData.loading && queryData.called) {
      if (queryData.data) {
        return {
          ...always,
          accessToken: at,
          loggedInUser: queryData.data.whoami,
          loading: false,
        };
      }
    }
  }

  return {
    ...always,
    loading: false,
  };
}

export function getToken() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const [value]  = useCookie(AccessTokenStorageKey);

    if (value == "undefined" || value == "null") {
      return null;
    }

    return value;
  } catch (e) {
    console.log(e);
    return null;
  }
}
