"use strict";

const gql = require("graphql-tag");
const { jwtDecode } = require("jwt-decode");

const setToken = (idToken, accessToken) => {
  if (!process.browser) {
    return;
  }
  window.localStorage.setItem("token", accessToken);
};

const unsetToken = () => {
  if (!process.browser) {
    return;
  }
  window.localStorage.removeItem("token");
};

const getToken = () => {
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

const checkLoggedIn = apolloClient =>
  apolloClient
    .query({
      query: gql`
        query whoami {
          id
          role
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

module.exports = {
  checkLoggedIn,
  getToken,
  unsetToken,
  setToken,
};
