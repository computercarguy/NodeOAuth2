module.exports = (router, app, testAPIService) => {
  router.get("/hello", testAPIService.helloWorld);

  return router;
};
