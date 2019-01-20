import gql from "graphql-tag";

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

export const checkLoggedIn = apolloClient =>
  apolloClient
    .query({
      query: gql`
        query whoAmI {
          user {
            id
            name
          }
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
