import { authenticated, cannotAuthenticate } from "./auth";

import uuid from "uuid";

const responseType = "token id_token";

const getLock = options => {
  const config = require("../config.json");
  const Auth0Lock = require("auth0-lock").default;
  return new Auth0Lock(
    config.AUTH0_CLIENT_ID,
    config.AUTH0_CLIENT_DOMAIN,
    options
  );
};

const getBaseUrl = () => `${window.location.protocol}//${window.location.host}`;

const getOptions = container => {
  return {
    container,
    closable: false,
    auth: {
      responseType,
      redirectUrl: `${getBaseUrl()}/auth/callback`,
      params: {
        scope: "openid profile email",
        state: uuid.v4()
      }
    }
  };
};

export const show = container => {
  const lock = getLock(getOptions(container));
  lock.on("authenticated", function(authResult) {
    authenticated(authResult.idToken, authResult.expiresIn);
  });
  return lock.show();
};
export const logout = () => getLock().logout({ returnTo: getBaseUrl() });
export const finishAuthFlow = () =>
  getLock().resumeAuth(window.location.hash, function(error, authResult) {
    authenticated(authResult.idToken, authResult.expiresIn);
  });
export const tryReauth = () => {
  const lock = getLock();
  lock.checkSession(
    {
      responseType
    },
    function(error, authResult) {
      if (error) {
        console.error(error);
        cannotAuthenticate();
        return;
      }
      authenticated(
        authResult.idToken,
        authResult.expiresIn,
        window.location.pathname
      );
    }
  );
};
