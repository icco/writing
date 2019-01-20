import gql from "graphql-tag";
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

export const getToken = () => {
  if (!process.browser) {
    return "";
  }

  try {
    let tokenData = window.localStorage.getItem("token");
    let decoded = jwtDecode(tokenData);
    let now = new Date().getTime() / 1000;

    if (now >= decoded.exp) {
      console.log("token expired");
      unsetToken();
      return "";
    }

    return tokenData;
  } catch (e) {
    return "";
  }
};

export const checkLoggedIn = apolloClient =>
  apolloClient
    .query({
      query: gql`
        query whoami {
          id
        }
      `,
    })
    .then(({ data }) => {
      return { loggedInUser: data };
    })
    .catch(() => {
      // Fail gracefully
      return { loggedInUser: {} };
    });
