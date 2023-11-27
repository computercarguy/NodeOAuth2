module.exports = (router, users) => {
    router.post("/updateUser", users.update);
    router.post("/updatePassword", users.updatePassword);
    router.post("/disable", users.disable);
    router.post("/createPasswordReset", users.createPasswordReset);
    router.post("/doPasswordReset", users.doPasswordReset);
    router.post("/forgotUsername", users.forgotUsername);
    router.get("/", users.getUser);
    router.post("/logout", users.logout);
  
    return router;
  };
  