const authenticator = require("../auth/authenticator.js");
const useGetBearerToken = require("../hooks/useGetBearerToken.js");
const useReadEmailFile = require("../hooks/useReadEmailFile.js");
const useSendEmail = require("../hooks/useSendEmail.js");
const useSendResponse  = require("../hooks/useSendResponse.js");

const errorMessage = "Something went wrong.";
const success = "Success";

let tokenDB;
let userDB;
let passwordResetDB;
let auth;

module.exports = (injectedUserDB, injectedTokenDB, injectedPasswordResetDB, injectedAuthenticator) => {
    userDB = injectedUserDB;
    tokenDB = injectedTokenDB;
    passwordResetDB = injectedPasswordResetDB;
    auth = injectedAuthenticator;

    return {
        updatePassword,
        update,
        disable,
        getUser,
        createPasswordReset,
        doPasswordReset,
        forgotUsername,
        logout
    };
};

function updatePassword(req, res) {
    const token = useGetBearerToken(req);

    if (!token) {
        sendError(res);
        return;
    }

    tokenDB.getUserIDFromBearerToken(token, (userId) => {
        if (!userId || req.body.current.trim() === req.body.password.trim()) {
            sendError(res);
            return;
        }

        userDB.updatePassword(req.body.current, req.body.password, userId, (response) => {
            if (!response || response.results.changedRows === 0) {
                sendError(res);
                return;
            }

            userDB.validateUser(userId, (user) => {
                useReadEmailFile("staticFiles/passwordReset.html", (body, error) => {
                    if (!body || error) {
                        sendError(res);
                        return;
                    }

                    const subject = 'Password reset';

                    useSendEmail(user.Email, subject, body);
                });
            });

            useSendResponse(
                res,
                response && response.error == null ? success : errorMessage,
                response ? response.error : errorMessage
            );
        });
    });
}

function update(req, res) {
    const token = useGetBearerToken(req);

    if (!token) {
        sendError(res);
        return;
    }

    tokenDB.getUserIDFromBearerToken(token, (userId) => {
        if (!userId) {
            sendError(res);
            return;
        }

        userDB.update(req.body, userId, (response) => {
            useSendResponse(
                res,
                response && response.error == null ? success : errorMessage,
                response ? response.error : errorMessage
            );
        });
    });
}

function disable(req, res) {
    const token = useGetBearerToken(req);

    if (!token) {
        sendError(res);
        return;
    }

    tokenDB.getUserIDFromBearerToken(token, (userId) => {
        if (!userId) {
            sendError(res);
            return;
        }

        userDB.disable(userId, (response) => {
            if (!response) {
                sendError(res);
                return;
            }
    
            tokenDB.disableUserTokens(token, userId, null, null);

            useReadEmailFile("staticFiles/accountDisabled.html", (body, error) => {
                if (!body || error) {
                    sendError(res);
                    return;
                }

                const subject = 'Account Disabled';

                useSendEmail(req.body.email, subject, body);
            });

            useSendResponse(
                res,
                response && response.error == null ? success : errorMessage,
                response ? response.error : errorMessage
            );
        });
    });
}

function getUser(req, res) {
    const token = useGetBearerToken(req);

    if (!token) {
        sendError(res);
        return;
    }

    tokenDB.getUserIDFromBearerToken(token, (userId) => {
        if (!userId) {
            sendError(res);
            return;
        }

        userDB.getUserById(userId, (response) => {
            useSendResponse(
                res,
                response,
                response == null ? errorMessage : null
            );
        });
    });
}

function forgotUsername(req, res) {
    if (!req.body.email) {
        sendError(res);
        return;
    }
    
    userDB.getUserForPasswordReset(req.body.email, (userId, username) => {
        if (!userId || !username) {
            sendError(res);
            return;
        }
        
        useReadEmailFile("staticFiles/forgotUsername.html", (body, error) => {
            if (!body || error) {
                sendError(res);
                return;
            }

            const subject = 'Forgot Username';

            useSendEmail(req.body.email, subject, body.replace(":username", username), null, (message, error) => {
                useSendResponse(res, message, error);
            });
        });
    });
}

function createPasswordReset(req, res) {
    if (!req.body.email) {
        sendError(res);
        return;
    }
    
    userDB.getUserForPasswordReset(req.body.email, (userId, username) => {
        if (!userId || !username) {
            sendError(res);
            return;
        }
        
        passwordResetDB.createPasswordReset(userId, req.body.email, (response, error) => {
            if (error || !response) {
                sendError(res);
                return;
            }

            useReadEmailFile("staticFiles/forgotPassword.html", (body, error) => {
                if (!body || error) {
                    sendError(res);
                    return;
                }

                const subject = 'Password Reset Requested';
                const passwordResetLink = `http://appmarketplace.ericsgear.com/?email=${req.body.email}&guid=${response}`;

                useSendEmail(req.body.email, subject, body.replaceAll(":passwordResetLink", passwordResetLink), null, (message, error) => {
                    useSendResponse(res, message, error);
                });
            });
        });
    });
}

function doPasswordReset(req, res) {
    if (!req.body.email || !req.body.guid) {
        sendError(res);
        return;
    }

    const passwordResults = auth.CheckPasswords(req.body.password);

    if (!passwordResults.valid) {
        sendError(res);
        return;
    }

    passwordResetDB.getPasswordReset(req.body.guid, req.body.email, (userId) => {
        if (!userId) {
            sendError(res);
            return;
        }

        userDB.updatePassword(req.body.password, userId, (response) => {
            if (response.error == null) {
                passwordResetDB.disable(req.body.guid);
            }

            useReadEmailFile("staticFiles/passwordReset.html", (body, error) => {
                if (!body || error) {
                    sendError(res);
                    return;
                }

                const subject = 'Password Reset Succeeded';

                useSendEmail(req.body.email, subject, body);
            });

            useSendResponse(
                res,
                response && response.error == null ? success : errorMessage,
                response ? response.error : errorMessage,
            );
        });
    });
}

function sendError(res) {
    useSendResponse(
        res,
        "",
        errorMessage
    );
}

function logout(req, res) {
    const token = useGetBearerToken(req);
    
    if (!token) {
        sendError(res);
        return;
    }

    tokenDB.getUserIDFromBearerToken(token, (userId) => {
        if (!userId) {
            sendError(res);
            return;
        }

        tokenDB.disableUserTokens(token, userId, req.body.logoutType, (response) => {
            useSendResponse(
                res,
                response && !response.error ? success : null,
                !response || response.error ? errorMessage: null,
            );
        });
    });
}
