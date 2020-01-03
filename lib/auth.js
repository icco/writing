import gql from "graphql-tag";
import jwtDecode from "jwt-decode";

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
    let decoded = jwtDecode(tokenData, {});
    let now = new Date().getTime() / 1000;

    if (now >= decoded.exp) {
      unsetToken();
      return "";
    }

    return tokenData;
  } catch (e) {
    return "";
  }
};

const whoami = gql`
  query {
    whoami {
      id
      role
    }
  }
`;

const checkLoggedIn = apolloClient =>
  apolloClient
    .query({
      query: whoami,
      fetchPolicy: "no-cache",
    })
    .then(({ data }) => {
      return { loggedInUser: data.whoami };
    })
    .catch(() => {
      // Fail gracefully
      return { loggedInUser: null };
    });

module.exports = {
  checkLoggedIn,
  getToken,
  unsetToken,
  setToken,
};
