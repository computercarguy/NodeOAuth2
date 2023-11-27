const useGetBearerToken = require("../hooks/useGetBearerToken");
const useReadEmailFile = require("../hooks/useReadEmailFile");
const useSendEmail = require("../hooks/useSendEmail");
const useSendResponse = require("../hooks/useSendResponse");

const errorMessage = "Something went wrong.";
const success = "Success";
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
        checkWhitelist
    };
};

function registerUser(req, res) {
    if (!req.body.email || !req.body.username) {
        sendError(res);
        return;
    }

    userDB.isValidUser(req.body.username, req.body.email, (error, isValidUser) => {
        if (error || !isValidUser) {
            const message = error
                ? errorMessage
                : "This user already exists.";

            useSendResponse(res, message, error | "");

            return;
        }

        userDB.register(req.body, (response) => {
            if (!response) {
                sendError(res);
                return;
            }

            useReadEmailFile("staticFiles/accountCreated.html", (body, err) => {
                if (!body || err) {
                    sendError(res);
                    return;
                }

                const subject = 'Account Created';

                useSendEmail(req.body.email, subject, body);
            });

            useSendResponse(
                res,
                response && response.error == null ? success : errorMessage,
                response.error
            );
        });
    });
}

function login(req, res, next) {
    // console.log("login");
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
                response == null ? errorMessage : null,
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
        useSendResponse(
            res,
            userId,
            userId == null ? errorMessage : null,
        );
    });
}

function sendError(res) {
    useSendResponse(
        res,
        "",
        errorMessage
    );
}

function checkWhitelist(req, res) {
    console.log("host: " + req.get("host"));
    console.log("origin: " + req.get("origin"));
    let remoteServer = req.get("origin") ?? req.get("host");
    console.log("remoteServer: " + remoteServer);
    var url_parts = new URL(remoteServer);
    console.log(url_parts);

}
