// Reference: https://www.npmjs.com/package/mysql

const dbPool = require('mysql');
const useAwsSecrets = require('../hooks/useAwsSecrets');
let pool;

useAwsSecrets(savelog, setPool);

module.exports = {
    query,
    healthCheck,
    savelog,
};

function setPool(secrets){
    if (secrets) {
        pool = dbPool.createPool({
            user: secrets.user,
            host: secrets.host,
            database: secrets.database,
            password: secrets.authenticationEG,
            port: secrets.port
        });
    }
}

async function query(queryString, queryValues, cbFunc) {
    let parameterizedQuery = queryFormat(queryString, queryValues);
    
    if (!pool) {
        await useAwsSecrets(savelog, setPool);
    }

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

async function healthCheck(cbFunc) {
    if (!pool) {
        await useAwsSecrets(savelog, setPool);
    }

    query("SELECT 'healthCheckPassed'", null, cbFunc);
}

function setResponse(error, results) {
    return {
        error: error,
        results: results ? results : null,
    };
}

async function savelog(filename, methodname, stage, userid, message) {
    const insertLog = `INSERT INTO eventlog (message) VALUES (':message');`;
    let values = {message: `${filename}: ${methodname}: ${stage}: ${userid}: ${message}`};
  
    dbPool.query(insertLog, values);
}
