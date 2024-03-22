let tokenDB;

module.exports = (injectedTokenDB) => {
    tokenDB = injectedTokenDB;
    
    return {helloWorld};
};

function helloWorld(req, res) {
    tokenDB.healthCheck();
    res.send("Hello World OAuth2!");
}
