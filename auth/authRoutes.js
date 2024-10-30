module.exports = (router, app, authenticator) => {
    router.post("/register", authenticator.registerUser);
    router.post("/checkUsernameEmail", authenticator.checkUsernameEmail);
    router.post("/login", authenticator.login, app.oauth.grant());
    router.get("/validate", authenticator.validateUser);
    router.get("/userid", authenticator.getUserId);
    router.get("/passwordcomplexity", authenticator.getPasswordComplexity);

    return router;
};
