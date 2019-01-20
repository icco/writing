const getAuth0 = options => {
  const auth0 = require("auth0-js");

  // This probably can't be an env var.
  const {
    AUTH0_CLIENT_ID = "MwFD0COlI4F4AWvOZThe1psOIletecnL",
    AUTH0_DOMAIN = "https://icco.auth0.com/",
  } = process.env;

  return new auth0.WebAuth({
    clientID: AUTH0_CLIENT_ID,
    domain: AUTH0_CLIENT_DOMAIN,
  });
};

const getBaseUrl = () => `${window.location.protocol}//${window.location.host}`;

const getOptions = container => {
  return {
    responseType: "token id_token",
    redirectUri: `${getBaseUrl()}/auth/signed-in`,
    scope: "openid profile email",
  };
};

export const authorize = () => getAuth0().authorize(getOptions());
export const logout = () => getAuth0().logout({ returnTo: getBaseUrl() });
export const parseHash = callback => getAuth0().parseHash(callback);
