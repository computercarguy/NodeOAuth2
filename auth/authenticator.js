const useGetBearerToken = require("../hooks/useGetBearerToken");
const useReadEmailFile = require("../hooks/useReadEmailFile");
const useSendEmail = require("../hooks/useSendEmail");
const useSendResponse = require("../hooks/useSendResponse");

const errorMessage = "Something went wrong.";
const success = "Success:";
let userDB;
let tokenDB;

module.exports = (injectedUserDB, injectedTokenDB) => {
    userDB = injectedUserDB;
    tokenDB = injectedTokenDB;

    return {
        registerUser,
        login,
        validateUser,
        getUserId,
        getPasswordComplexity,
        CheckPasswords,
        checkWhitelist,
        checkUsernameEmail
    };
};

function registerUser(req, res) {
    if (!req.body.email || !req.body.username) {
        sendError(res);
        return;
    }

    const passwordResults = CheckPasswords(req.body.password);

    if (!passwordResults.valid) {
        sendError(res);
        return;
    }

    userDB.isValidUser(
        req.body.username,
        req.body.email,
        (error, isValidUser) => {
            if (error || !isValidUser) {
                useSendResponse(
                    res,
                    null,
                    error ? errorMessage : "This user already exists."
                );

                return;
            }

            userDB.register(req.body, (response) => {
                if (!response || response.error) {
                    sendError(res);
                    return;
                }

                useReadEmailFile(
                    "staticFiles/accountCreated.html",
                    (body, err) => {
                        if (!body || err) {
                            sendError(res);
                            return;
                        }

                        const subject = "Account Created";

                        useSendEmail(
                            req.body.email,
                            subject,
                            body,
                            null,
                            userDB.savelog
                        );
                    }
                );

                useSendResponse(
                    res,
                    response && response.error == null
                        ? success + response.results.insertId
                        : errorMessage,
                    response.error
                );
            });
        }
    );
}

function login(req, res, next) {
    console.log("login");
    next();
}

function validateUser(req, res) {
    const token = useGetBearerToken(req);

    if (!token) {
        sendError(res);
        return;
    }

    tokenDB.getUserIDFromBearerToken(useGetBearerToken(req), (userId) => {
        if (!userId) {
            sendError(res);
            return;
        }

        userDB.validateUser(userId, (response) => {
            useSendResponse(
                res,
                response,
                response == null ? errorMessage : null
            );
        });
    });
}

function getUserId(req, res) {
    const token = useGetBearerToken(req);

    if (!token) {
        sendError(res);
        return;
    }

    tokenDB.getUserIDFromBearerToken(useGetBearerToken(req), (userId) => {
        useSendResponse(res, userId, userId == null ? errorMessage : null);
    });
}

function sendError(res) {
    useSendResponse(res, "", errorMessage);
}

function PasswordComplexity() {
    return {
        minLength: 8,
        hasUpperCase: true,
        hasLowerCase: true,
        hasNumbers: true,
        hasNonalphas: true
    };
}

function getPasswordComplexity(req, res) {
    useSendResponse(res, PasswordComplexity(), errorMessage);
}

function CheckPasswords(password) {
    const options = PasswordComplexity();

    let results = {
        minLength: options.minLength && password.length >= options.minLength,
        hasUpperCase: options.hasUpperCase && /[A-Z]/.test(password),
        hasLowerCase: options.hasLowerCase && /[a-z]/.test(password),
        hasNumbers: options.hasNumbers && /\d/.test(password),
        hasNonalphas: options.hasNonalphas && /\W/.test(password),
        valid: true
    };

    for (var key in results) {
        if (results.hasOwnProperty(key)) {
            results["valid"] &= results[key];
        }
    }

    return results;
}

function checkWhitelist(req, res) {
    //console.log(req.params);
    /*
    console.log("host: " + req.get("host"));
    console.log("origin: " + req.get("origin"));
    let remoteServer = req.get("origin") ?? req.get("host");
    console.log("remoteServer: " + remoteServer);
    var url_parts = new URL(remoteServer);
    console.log(url_parts);
    */
}

function checkUsernameEmail(req, res) {
    if (!req.body.email && !req.body.username) {
        sendError(res);
        return;
    }

    userDB.isValidUser(
        req.body.username,
        req.body.email,
        (error, isValidUser) => {
            useSendResponse(
                res,
                !isValidUser,
                isValidUser
                    ? error
                        ? errorMessage
                        : "This information already exists."
                    : ""
            );
        }
    );
}
