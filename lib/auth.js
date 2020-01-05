import gql from "graphql-tag";
import { useState } from "react";
import { useAuth } from "use-auth0-hooks";
import { useLazyQuery } from "@apollo/react-hooks";
import {useLocalStorage} from 'react-use';

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
  const { isAuthenticated, isLoading, accessToken, login, logout } = useAuth({
    audience: 'https://natwelch.com',
    scope: 'openid profile',
  });
  const [at, setAT] = useLocalStorage(AccessTokenStorageKey, "");
  const [getUser, { loading, data, error }] = useLazyQuery(whoami, {
    fetchPolicy: "no-cache",
  });
  const always = {
    login,
    logout,
  };

  if (isLoading || loading) {
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

  if (at != accessToken) {
    setAT(accessToken);
  }

  if (isAuthenticated) {
    if (!data) {
    getUser()
    }

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
    return "";
  }

  try {
    let value = window.localStorage.getItem(AccessTokenStorageKey);

    if (value == "undefined" || value == "null") {
      return ""
    }

    return value
  } catch (e) {
    return "";
  }
}
