const fs = require('fs');

module.exports = (filename, cbFunc) => {
    fs.readFile(filename, 'utf8', (err, data) => {
        if (err) {
            cbFunc(null, err);
        }

        cbFunc(data, null);
    });
}