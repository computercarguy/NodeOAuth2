// Reference: https://www.npmjs.com/package/mysql

const dbPool = require('mysql');
const useAwsSecrets = require('../hooks/useAwsSecrets');
let pool;

useAwsSecrets((secrets) => {
    pool = dbPool.createPool({
        user: "authenticationEG",
        host: "localhost",
        database: "ericsgearlogin",
        password: secrets.authenticationEG,
        port: 3306
    });
});

function query(queryString, queryValues, cbFunc) {
    let parameterizedQuery = queryFormat(queryString, queryValues);

    pool.query(parameterizedQuery, (error, results) => {
        if (cbFunc) {
            cbFunc(setResponse(error, results));
        }
    });
}

queryFormat = function (query, values) {
    if (!values) {
        return query;
    }

    return query.replace(/\:(\w+)/g, function (txt, key) {
        if (values.hasOwnProperty(key)) {
            return encodeURI(values[key]).replaceAll("%20",  " ").replaceAll("%3A", ":");
        }
        
        return txt;
    });
}

function healthCheck() {
    pool.ping(function (err) {
        if (err) throw err;

        console.log('Server responded to ping');
    });
}

function setResponse(error, results) {
    return {
        error: error,
        results: results ? results : null,
    };
}

module.exports = {
    query,
    healthCheck,
};