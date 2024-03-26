module.exports = (router, app, testAPIService) => {
  router.get("/hello", testAPIService.healthCheck);

  return router;
};
