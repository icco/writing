import jwtDecode from "jwt-decode";

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
