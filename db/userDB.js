let dbPool;

module.exports = (injectedPgPool) => {
    dbPool = injectedPgPool;

    return {
        register,
        getUser,
        getUserById,
        isValidUser,
        updatePassword,
        update,
        disable,
        validateUser,
        getUserForPasswordReset
    };
};

var crypto = require("crypto");

function register(body, cbFunc) {
    var shaPass = crypto.createHash("sha256").update(body.password).digest("hex");

    const query = `INSERT INTO users (FirstName, LastName, Username, UserPassword, Business, BusinessName, Address1, Address2, City, State, Email, Zipcode) 
        VALUES (':firstName', ':lastName', ':username', ':shaPass', :business, ':businessName', ':address1', ':address2', ':city', ':state', ':email', ':zipCode');`;
    const values = body;

    values.shaPass = shaPass;
    values.business = values.business == "Business" ? 1 : 0;

    if (values.business == 1) {
        values.businessName = "";
    }

    dbPool.query(query, values, cbFunc);
}
  
function updatePassword(currentPassword, password, userId, cbFunc) {
    var shaPass = crypto.createHash("sha256").update(password).digest("hex");
    var shaPassOrig = crypto.createHash("sha256").update(currentPassword).digest("hex");
    const query = `UPDATE users SET UserPassword = ':shaPass' WHERE Id = ':userId' AND UserPassword = ':currentPassword' AND Active = 1;`;
    const values = {shaPass: shaPass, userId: userId, currentPassword: shaPassOrig};

    dbPool.query(query, values, cbFunc);
}
  
function update(body, userId, cbFunc) {
    const query = `UPDATE users 
        SET FirstName = ':firstName',  
            LastName = ':lastName', 
            Username = ':username', 
            Business = :business, 
            BusinessName = ':businessName', 
            Address1 = ':address1', 
            Address2 = ':address2', 
            City = ':city', 
            State = ':state', 
            Email = ':email', 
            Zipcode = ':zipCode'
        WHERE Id = ':userId' AND Active = 1;`;

    const values = body;
    values.userId = userId;

    dbPool.query(query, values, cbFunc);
}

function disable(userId, cbFunc) {
    const query = `UPDATE users SET Active = 0 WHERE Id = ':userId';`;
    const values = {userId: userId};

    dbPool.query(query, values, cbFunc);
}

function getUserById(userId, cbFunc) {
    const getUserQuery = `SELECT Id, FirstName, LastName, Username, Business, BusinessName, Address1, Address2, City, State, Email, Zipcode FROM users WHERE Id = ':userId' AND Active = 1;`;
    const values = {userId: userId};

    dbPool.query(getUserQuery, values, (response) => {
        cbFunc(
            response.results && response.results.length === 1
                ? response.results[0]
                : null
        );
    });
}

function getUser(username, password, cbFunc) {
    var shaPass = crypto.createHash("sha256").update(password).digest("hex");
  
    const getUserQuery = `SELECT Id, FirstName, LastName, Username, Business, BusinessName, Address1, Address2, City, State, Email, Zipcode FROM users WHERE Username = ':username' AND UserPassword = ':shaPass' AND Active = 1;`;
    const values = {username: username, shaPass: shaPass};
  
    dbPool.query(getUserQuery, values, (response) => {
        cbFunc(
            false,
            response.results && response.results.length === 1
                ? response.results[0]
                : null
        );
    });
}
  
function isValidUser(username, email, cbFunc) {
    const query = `SELECT Id FROM users WHERE Username = ':username' OR Email = ':email' AND Active = 1`;
    const values = {username: username, email: email};
  
    const checkUsrcbFunc = (response) => {
        const isValidUser = response.results
            ? response.results.length === 0
            : null;
    
        cbFunc(response.error, isValidUser);
    };
  
    dbPool.query(query, values, checkUsrcbFunc);
}

function validateUser(userId, cbFunc) {
    const query = `SELECT FirstName, LastName, Username, Email FROM users WHERE Id = ':userId' AND Active = 1`;
    const values = {userId: userId};
  
    const checkUsrcbFunc = (response) => {
        const isValidUser = response.results.length == 1 ? response.results[0] : null;
    
        cbFunc(isValidUser);
    };
  
    dbPool.query(query, values, checkUsrcbFunc);
}

function getUserForPasswordReset(email, cbFunc) {
    const query = `SELECT Id, Username FROM users WHERE Email = ':email' AND Active = 1`;
    const values = {email: email};
  
    const checkUsrcbFunc = (response) => {
        if (response.results.length === 1){
            const userId = response.results[0].Id;
            const username = response.results[0].Username;
        
            cbFunc(userId, username);
        }
        else {
            cbFunc(null, null);
        }
    };
  
    dbPool.query(query, values, checkUsrcbFunc);
}