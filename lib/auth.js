import gql from "graphql-tag";
import { useState } from "react";
import { useAuth } from "use-auth0-hooks";
import { useQuery } from "@apollo/react-hooks";

export const whoami = gql`
  query user {
    whoami {
      id
      role
    }
  }
`;

const AccessTokenStorageKey = "accessToken";

export function useLoggedIn() {
  const { isAuthenticated, isLoading, accessToken, login, logout } = useAuth();
  const [at, setAT] = useLocalStorage(AccessTokenStorageKey, "");
  const { loading, data, error } = useQuery(whoami, {
    fetchPolicy: "no-cache",
  });
  const always = {
    login,
    logout,
  };

  if (isLoading || loading) {
    return { loading: true };
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

  setAT(accessToken);

  if (isAuthenticated && data && data.whoami) {
    return {
      ...always,
      accessToken: at,
      loggedInUser: data.whoami,
      loading: false,
    };
  }

  return {
    ...always,
    loading: false,
  };
}

export function getToken() {
  if (typeof window === "undefined") {
    return "";
  }

  try {
    return window.localStorage.getItem(AccessTokenStorageKey);
  } catch (e) {
    return "";
  }
}

// Hook from https://usehooks.com/useLocalStorage/
function useLocalStorage(key, initialValue) {
  // State to store our value
  // Pass initial state function to useState so logic is only executed once
  const [storedValue, setStoredValue] = useState(() => {
    try {
      if (typeof window === "undefined") {
        return initialValue;
      }

      // Get from local storage by key
      const item = window.localStorage.getItem(key);
      // Parse stored json or if none return initialValue
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      // If error also return initialValue
      return initialValue;
    }
  });

  // Return a wrapped version of useState's setter function that ...
  // ... persists the new value to localStorage.
  const setValue = value => {
    try {
      // Allow value to be a function so we have same API as useState
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      // Save state
      setStoredValue(valueToStore);
      // Save to local storage
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      // A more advanced implementation would handle the error case
      console.log(error);
    }
  };

  return [storedValue, setValue];
}
