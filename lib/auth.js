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
  const { isAuthenticated, isLoading, accessToken, login, logout } = useAuth({
    audience: "https://natwelch.com",
    scope: "role profile",
  });
  const [at, setAT] = useLocalStorage(AccessTokenStorageKey, null);
  const [getUser, { loading, data, error }] = useLazyQuery(whoami, {
    fetchPolicy: "no-cache",
  });
  const always = {
    login,
    logout,
  };

  if (loading || isLoading) {
    return { ...always, loading: true };
  }

  if (error) {
    return { error };
  }

  if (!isLoading && !isAuthenticated) {
    return {
      ...always,
      loading: false,
    };
  }

  if (!isLoading && at != accessToken) {
    setAT(accessToken);
  }

  if (!data) {
    getUser();
  }

  if (!isLoading && !loading) {
    if (data) {
      return {
        ...always,
        accessToken: at,
        loggedInUser: data.whoami,
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
