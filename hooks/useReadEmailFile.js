const useReadFile = require('./useReadFile');
const headerFile = "staticFiles/emailHeader.html";

module.exports = (filename, cbFunc) => {
    useReadFile(headerFile, (header, error) => {
        if (error || !header) {
            cbFunc(null, err);
        }

        useReadFile(filename, (body, err) => {
            if (error || !body) {
                cbFunc(null, err);
            }
    
            cbFunc(header.replace(":message", body), null);
        });
    });
}
