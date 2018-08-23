import jwtDecode from "jwt-decode";
import Cookie from "js-cookie";
import Router from "next/router";

const authKey = "isAuthenticated";
const userKey = "user";
const jwtKey = "jwt";

export const setToken = (token, expirationDate) => {
  if (!process.browser) {
    return;
  }
  Cookie.set(authKey, "yes", { expires: 9999 });
  Cookie.set(userKey, jwtDecode(token), { expires: expirationDate });
  Cookie.set(jwtKey, token, { expires: expirationDate });
};

export const unsetToken = () => {
  if (!process.browser) {
    return;
  }
  Cookie.remove(jwtKey);
  Cookie.remove(userKey);
  Cookie.remove(authKey);
};

export const canAuthenticate = () => {
  if (!process.browser) {
    return false;
  }
  return !!Cookie.get(authKey);
};

export const cannotAuthenticate = () => {
  if (!process.browser) {
    return;
  }
  Cookie.remove(authKey);
};

export const getUserFromServerCookie = req => {
  if (!req.headers.cookie) {
    return undefined;
  }
  const jwtCookie = req.headers.cookie
    .split(";")
    .find(c => c.trim().startsWith("jwt="));
  if (!jwtCookie) {
    return undefined;
  }
  const jwt = jwtCookie.split("=")[1];
  return jwtDecode(jwt);
};

export const getUserFromLocalCookie = () => {
  return Cookie.getJSON("user");
};
export const authenticated = (token, expiresIn, redirect = "/") => {
  const expirationDate = new Date(new Date().getTime() + expiresIn * 1000);
  setToken(token, expirationDate);
  Router.push(redirect);
};
