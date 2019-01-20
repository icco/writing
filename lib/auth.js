import jwtDecode from "jwt-decode";

const getQueryParams = () => {
  const params = {};
  window.location.href.replace(
    /([^(?|#)=&]+)(=([^&]*))?/g,
    ($0, $1, $2, $3) => {
      params[$1] = $3;
    }
  );
  return params;
};

export const setToken = (idToken, accessToken) => {
  if (!process.browser) {
    return;
  }
  window.localStorage.setItem("token", accessToken);
};

export const unsetToken = () => {
  if (!process.browser) {
    return;
  }
  window.localStorage.removeItem("token");
};

export const getUserFromServerCookie = req => {
  if (!req.headers.cookie) {
    return undefined;
  }
  const jwtCookie = req.headers.cookie
    .split(";")
    .find(c => c.trim().startsWith("idToken="));
  if (!jwtCookie) {
    return undefined;
  }
  const jwt = jwtCookie.split("=")[1];
  return jwtDecode(jwt);
};

export const getUserFromLocalCookie = () => {
  return Cookie.getJSON("user");
};
