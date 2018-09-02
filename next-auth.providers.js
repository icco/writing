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
      callbackURL: "/auth/oauth/auth0/callback"
    },
    getProfile(profile) {
      return profile;
    }
  });

  return providers;
};
