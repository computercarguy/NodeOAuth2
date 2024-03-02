module.exports = (router, app, testAPIService) => {
  router.post("/hello", testAPIService.helloWorld);

  return router;
};
