import auth0 from "auth0-js";

const settings = {
  clientID: "MwFD0COlI4F4AWvOZThe1psOIletecnL",
  domain: "icco.auth0.com"
};

function webAuth(clientID, domain) {
  return new auth0.WebAuth({
    clientID: clientID,
    domain: domain
  });
}

function login() {
  const options = {
    responseType: "id_token",
    redirectUri: "http://localhost:8080/redirect",
    scope: "openid profile email"
  };

  return webAuth(settings.clientID, settings.domain).authorize(options);
}

function parseHash(cb) {
  return webAuth(settings.clientID, settings.domain).parseHash(cb);
}

function logout() {
  return webAuth(settings.clientID, settings.domain).logout();
}

export { login, parseHash, logout };
