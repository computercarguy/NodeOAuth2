const { randomUUID } = require('crypto');
let dbPool;

module.exports = (injectedPgPool) => {
    dbPool = injectedPgPool;

    return {
        createPasswordReset,
        getPasswordReset,
        disable
    };
};

function createPasswordReset(userId, email, cbFunc) {
    const guid = randomUUID();
    const query = `INSERT INTO passwordReset (UserId, Guid, Email) 
        VALUES (':userId', ':guid', ':email');`;
    const values = {userId: userId, guid: guid, email: email};
  
    const checkUsrcbFunc = (response) => {
        if (response.message !== "") {
            cbFunc(guid);    
        }
        else {
            cbFunc("", response.message);
        }
    };
  
    dbPool.query(query, values, checkUsrcbFunc);
}

function getPasswordReset(guid, email, cbFunc) {
    const query = `SELECT UserId FROM passwordReset WHERE Email = ':email' AND Guid = ':guid' AND ExpiresAt > NOW();`;
    const values = {guid: guid, email: email};
  
    const checkUsrcbFunc = (response) => {
        const userId = response && response.results.length == 1 ? response.results[0].UserId : null;
        cbFunc(userId);
    };
  
    dbPool.query(query, values, checkUsrcbFunc);
}

function disable(guid) {
    const query = `UPDATE passwordReset SET ExpiresAt = NOW() WHERE Guid = ':guid';`;
    const values = {guid: guid};

    dbPool.query(query, values);
}
