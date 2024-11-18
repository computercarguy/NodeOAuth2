const useSecrets = require("../hooks/useSecrets");

let tokenDB;

module.exports = (injectedTokenDB) => {
    tokenDB = injectedTokenDB;

    return { healthCheck };
};

function healthCheck(req, res) {
    tokenDB.healthCheck(async (results) => {
        const hosttype = process.env.hostType.toUpperCase();
        const secret = await useSecrets();

        res.send(
            results.error || !secret
                ? `${results.error} ${
                      !secret ? "Failed to get secret. " + hosttype : ""
                  }}`
                : "Hello World OAuth2! " + hosttype
        );
    });
}
