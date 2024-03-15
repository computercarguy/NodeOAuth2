const swaggerAutogen = require('swagger-autogen')();

const doc = {
  info: {
    title: "Eric's Gear NodeOAuth API",
    description: ''
  },
  host: 'localhost:3001',
  schemes: ['http','https']
};

const outputFile = './swagger-output.json';
const routes = [`${__dirname}/users/userRoutes.js`,`${__dirname}/auth/authRoutes.js`,`${__dirname}/test/testAPIRoutes.js`];


/* NOTE: If you are using the express Router, you must pass in the 'routes' only the 
root file where the route starts, such as index.js, app.js, routes.js, etc ... */

swaggerAutogen(outputFile, routes, doc);