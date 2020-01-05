import gql from "graphql-tag";
import { useAuth } from "use-auth0-hooks";
import { useLazyQuery } from "@apollo/react-hooks";
import { useLocalStorage } from "react-use";

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
  const authData = useAuth();
  const aTokenData = useAuth({
    audience: "https://natwelch.com",
    scope: "role profile",
  });
  const [at, setAT] = useLocalStorage(AccessTokenStorageKey, null);
  const [getUser, queryData] = useLazyQuery(whoami, {
    fetchPolicy: "no-cache",
  });
  const always = {
    login: authData.login,
    logout: authData.logout,
  };

  if (queryData.loading) {
    return { ...always, loading: true };
  }

  if (authData.error) {
    return { error: authData.error };
  }

  if (aTokenData.error) {
    return { error: aTokenData.error };
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

  if (at != aTokenData.accessToken) {
    setAT(accessToken);
  }

  if (!queryData.data) {
    getUser();
  }

  if (!queryData.loading) {
    if (queryData.data) {
      return {
        ...always,
        accessToken: at,
        loggedInUser: queryData.data.whoami,
        loading: false,
      };
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
    let value = window.localStorage.getItem(AccessTokenStorageKey);

    if (value == "undefined" || value == "null") {
      return null;
    }

    return value;
  } catch (e) {
    return null;
  }
}
