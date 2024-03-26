let tokenDB;

module.exports = (injectedTokenDB) => {
    tokenDB = injectedTokenDB;
    
    return {healthCheck};
};

function healthCheck(req, res) {
    tokenDB.healthCheck((results) => {
        res.send(results.error ? results.error : "Hello World OAuth2!");
    });
}
