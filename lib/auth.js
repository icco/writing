import gql from "graphql-tag";
import jwtDecode from "jwt-decode";
import React, { useState, useEffect } from 'react';
import { useAuth } from 'use-auth0-hooks';
import { useLazyQuery } from "@apollo/react-hooks";

export const whoami = gql`
  query user {
    whoami {
      id
      role
    }
  }
`;

export function useLoggedIn() {
  const { isAuthenticated, isLoading, accessToken, login, logout } = useAuth();
  const [getUser, { loading, data }] = useLazyQuery(whoami, {
    notifyOnNetworkStatusChange: true,
    fetchPolicy: "no-cache",
  });
  const [ at, setAT ] = useLocalStorage("accessToken", "")
  
  if (loading || isLoading) {
    return { loading: true }
  }

  if (!isLoading && isAuthenticated) {
    setAT(accessToken)
    getUser()

    if (data && data.whoami) {
      return {
        login,
        logout,
        accessToken: at,
        loggedInUser: data.whoami,
        loading: false,
      }
    }
  }

  return {}
}

export function getToken() {
  const [ at, _ ] = useLocalStorage("accessToken", "")
  return at
}

// Hook from https://usehooks.com/useLocalStorage/
function useLocalStorage(key, initialValue) {
  // State to store our value
  // Pass initial state function to useState so logic is only executed once
  const [storedValue, setStoredValue] = useState(() => {
    try {
      // Get from local storage by key
      const item = window.localStorage.getItem(key);
      // Parse stored json or if none return initialValue
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      // If error also return initialValue
      console.log(error);
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
