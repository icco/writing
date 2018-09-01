module.exports = () => {
  let providers = [];
  providers.push({
    providerName: "auth0",
    providerOptions: {
      scope: []
    },
    Strategy: require("passport-auth0").Strategy,
    strategyOptions: {
      domain: "icco.auth0.com",
      clientID: process.env.AUTH0_CLIENT_ID,
      clientSecret: process.env.AUTH0_CLIENT_SECRET,
      callbackURL: "/callback"
    },
    getProfile(accessToken, refreshToken, extraParams, profile, done) {
      // accessToken is the token to call Auth0 API (not needed in the most cases)
      // extraParams.id_token has the JSON Web Token
      // profile has all the information from the user
      return done(null, profile);
    }
  });

  return providers;
};
