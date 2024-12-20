let dbPool;

module.exports = (injectedPgPool) => {
    dbPool = injectedPgPool;

    return {
        register,
        getUser,
        getUserById,
        isValidUser,
        updatePassword,
        resetPassword,
        update,
        disableUser,
        validateUser,
        getUserForPasswordReset,
        savelog
    };
};

var crypto = require("crypto");

async function savelog(filename, methodname, stage, userid, message) {
    dbPool.savelog(filename, methodname, stage, userid, message);
}

function register(body, cbFunc) {
    var shaPass = crypto
        .createHash("sha256")
        .update(body.password?.trim())
        .digest("hex");

    const query = `INSERT INTO users (FirstName, LastName, Username, UserPassword, Business, BusinessName, Address1, Address2, City, State, Email, Zipcode, Country)
        VALUES (':firstName', ':lastName', ':username', ':shaPass', :business, ':businessName', ':address1', ':address2', ':city', ':state', ':email', ':zipcode', ':country');`;
    const values = body;

    values.shaPass = shaPass;
    values.business = values.business == "Business" ? 1 : 0;

    if (values.business == 1) {
        values.businessName = "";
    }

    dbPool.query(query, values, (results) => {
        if (results.error) {
            dbPool.savelog(
                "userDB.js",
                "register",
                "query",
                null,
                results.error
            );
        }

        cbFunc(results);
    });
}

function updatePassword(currentPassword, password, userId, cbFunc) {
    var shaPass = crypto.createHash("sha256").update(password).digest("hex");
    var shaPassOrig = crypto
        .createHash("sha256")
        .update(currentPassword)
        .digest("hex");
    const query = `UPDATE users SET UserPassword = ':shaPass' WHERE Id = ':userId' AND UserPassword = ':currentPassword' AND Active = 1;`;
    const values = {
        shaPass: shaPass?.trim(),
        userId: userId,
        currentPassword: shaPassOrig?.trim()
    };

    dbPool.query(query, values, (results) => {
        if (results.error) {
            dbPool.savelog(
                "userDB.js",
                "updatePassword",
                "query",
                null,
                results.error
            );
        }

        cbFunc(results);
    });
}

function resetPassword(password, userId, cbFunc) {
    // use this only for a validated password reset.
    var shaPass = crypto.createHash("sha256").update(password).digest("hex");
    const query = `UPDATE users SET UserPassword = ':shaPass' WHERE Id = ':userId' AND Active = 1;`;
    const values = {
        shaPass: shaPass?.trim(),
        userId: userId
    };

    dbPool.query(query, values, (results) => {
        if (results.error) {
            dbPool.savelog(
                "userDB.js",
                "resetPassword",
                "query",
                null,
                results.error
            );
        }

        cbFunc(results);
    });
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
            Zipcode = ':zipcode',
            Country = ':country'
        WHERE Id = ':userId' AND Active = 1;`;

    const values = body;
    values.userId = userId;

    dbPool.query(query, values, (results) => {
        if (results.error) {
            dbPool.savelog("userDB.js", "update", "query", null, results.error);
        }

        cbFunc(results);
    });
}

function disableUser(userId, cbFunc) {
    const query = `UPDATE users SET Active = 0 WHERE Id = ':userId';`;
    const values = { userId: userId };

    dbPool.query(query, values, (results) => {
        if (results.error) {
            dbPool.savelog(
                "userDB.js",
                "disableUser",
                "query",
                null,
                results.error
            );
        }

        cbFunc(results);
    });
}

function getUserById(userId, cbFunc) {
    const getUserQuery = `SELECT Id, FirstName, LastName, Username, Business, BusinessName, Address1, Address2, City, State, Email, Zipcode, Country FROM users WHERE Id = ':userId' AND Active = 1;`;
    const values = { userId: userId };

    dbPool.query(getUserQuery, values, (response) => {
        if (response.error) {
            dbPool.savelog(
                "userDB.js",
                "getUserById",
                "query",
                null,
                response.error
            );
        }

        cbFunc(
            response.results && response.results.length === 1
                ? response.results[0]
                : null
        );
    });
}

function getUser(username, password, cbFunc) {
    var shaPass = crypto.createHash("sha256").update(password).digest("hex");

    const getUserQuery = `SELECT Id, FirstName, LastName, Username, Business, BusinessName, Address1, Address2, City, State, Email, Zipcode, Country FROM users WHERE Username = ':username' AND UserPassword = ':shaPass' AND Active = 1;`;
    const values = { username: username?.trim(), shaPass: shaPass?.trim() };

    dbPool.query(getUserQuery, values, (response) => {
        if (response.error) {
            dbPool.savelog(
                "userDB.js",
                "getUser",
                "query",
                null,
                response.error
            );
        }

        cbFunc(
            false,
            response.results && response.results.length === 1
                ? response.results[0]
                : null
        );
    });
}

function isValidUser(username, email, cbFunc) {
    let whereClause = [];

    if (username?.trim()) {
        whereClause.push("Username = ':username'");
    }

    if (email?.trim()) {
        whereClause.push("Email = ':email'");
    }

    if (whereClause.length === 0) {
        cbFunc(null, false);
        return;
    }

    const query = `SELECT Id FROM users WHERE ${whereClause.join(" OR '")};`;
    const values = { username: username?.trim(), email: email?.trim() };

    const checkUsrcbFunc = (response) => {
        const isValidUser = response.results
            ? response.results.length === 0
            : null;

        if (response.error) {
            dbPool.savelog(
                "userDB.js",
                "isValidUser",
                "query",
                null,
                response.error
            );
        }

        cbFunc(response.error, isValidUser);
    };

    dbPool.query(query, values, checkUsrcbFunc);
}

function validateUser(userId, cbFunc) {
    const query = `SELECT FirstName, LastName, Username, Email FROM users WHERE Id = ':userId' AND Active = 1`;
    const values = { userId: userId };

    const checkUsrcbFunc = (response) => {
        const isValidUser =
            response.results.length == 1 ? response.results[0] : null;

        if (response.error) {
            dbPool.savelog(
                "userDB.js",
                "validateUser",
                "query",
                null,
                response.error
            );
        }

        cbFunc(isValidUser);
    };

    dbPool.query(query, values, checkUsrcbFunc);
}

function getUserForPasswordReset(email, cbFunc) {
    const query = `SELECT Id, Username FROM users WHERE Email = ':email' AND Active = 1`;
    const values = { email: email?.trim() };

    const checkUsrcbFunc = (response) => {
        if (response.error) {
            dbPool.savelog(
                "userDB.js",
                "getUserForPasswordReset",
                "query",
                null,
                response.error
            );
        }

        if (response.results.length === 1) {
            const userId = response.results[0].Id;
            const username = response.results[0].Username;

            cbFunc(userId, username);
        } else {
            cbFunc(null, null);
        }
    };

    dbPool.query(query, values, checkUsrcbFunc);
}
