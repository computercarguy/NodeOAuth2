// Database imports
const dbPool = require("./db/dbWrapper");
const tokenDB = require("./db/tokenDB")(dbPool);
const userDB = require("./db/userDB")(dbPool);
const passwordResetDB = require("./db/passwordResetDB")(dbPool);
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger-output.json');

// OAuth imports
const oAuthService = require("./auth/tokenService")(userDB, tokenDB);
const oAuth2Server = require("node-oauth2-server");

// Express
const express = require("express");
const app = express();
const cors = require('cors');
app.oauth = oAuth2Server({
    model: oAuthService,
    grants: ["password"],
    debug: true,
});

const testAPIService = require("./test/testAPIService.js")(tokenDB);
const testAPIRoutes = require("./test/testAPIRoutes.js")(
    express.Router(),
    app,
    testAPIService
);

// Auth and routes
const authenticator = require("./auth/authenticator")(userDB, tokenDB);
const users = require("./users/users.js")(userDB, tokenDB, passwordResetDB);
const authRoutes = require("./auth/authRoutes")(express.Router(), app, authenticator);
const userRoutes = require("./users/userRoutes")(express.Router(), users);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(app.oauth.errorHandler());

app.use('/*', (req, res, next) => {
    authenticator.checkWhitelist(req);
    next();
});
  
app.use("/auth", authRoutes);
app.use("/user", userRoutes);
app.use("/test", testAPIRoutes);
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header(`Access-Control-Allow-Methods`, `GET,PUT,POST,DELETE`);
    res.header(`Access-Control-Allow-Headers`, `Content-Type`);
    next();
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

const port = 3001;

app.listen(port, () => {
    console.log(`listening on port ${port}`);
});
