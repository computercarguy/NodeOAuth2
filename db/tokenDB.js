let dbPool;

module.exports = (injectedPgPool) => {
    dbPool = injectedPgPool;

    return {
        saveAccessToken,
        getUserIDFromBearerToken,
        disableUserTokens,
        healthCheck
    };
};

function healthCheck(cbFunc) {
    return dbPool.healthCheck(cbFunc);
}

function saveAccessToken(accessToken, userId, expires, cbFunc) {
    const insertTokenQuery = `INSERT INTO access_tokens (AccessToken, UserId, ExpirationDate) VALUES (':accessToken', :userId, ':expires');`;
    let values = {accessToken: accessToken, userId: userId, expires: expires.toISOString().slice(0, 19).replace('T', ' ')};
  
    dbPool.query(insertTokenQuery, values, (response) => {
        if (response.error) {
            dbPool.savelog("tokenDB.js", "saveAccessToken", "query", null, response.error);
        }
        
        cbFunc(response.error);
    });
}

function disableUserTokens(accessToken, userId, disableType, cbFunc) {
    let disableTokens = `UPDATE access_tokens SET ExpirationDate = NOW() WHERE UserId = :userId`;
    switch (disableType) {
        case 1: // other logins
            disableTokens += " AND AccessToken <> ':accessToken';";
            break;
        case 2: // current token / logout
            disableTokens += " AND AccessToken = ':accessToken';";
            break;
        case 0: // all tokens
        default:
            disableTokens += ";";
    }

    let values = {accessToken: accessToken, userId: userId};
  
    dbPool.query(disableTokens, values, (response) => {
        if (response.error) {
            dbPool.savelog("tokenDB.js", "disableUserTokens", "query", null, response.error);
        }

        if (cbFunc) {
            cbFunc(response);
        }
    });
}
  
function getUserIDFromBearerToken(bearerToken, cbFunc) {
    const getUserIDQuery = `SELECT UserId FROM access_tokens WHERE AccessToken = ':bearerToken' and ExpirationDate >= NOW();`;
    let values = {bearerToken: bearerToken};
  
    dbPool.query(getUserIDQuery, values, (response) => {
        const userID =
            response.results && response.results.length == 1
                ? response.results[0].UserId
                : null;
        
        if (response.error) {
            dbPool.savelog("tokenDB.js", "getUserIDFromBearerToken", "query", userID, response.error);
        }
  
        cbFunc(userID);
    });
}
