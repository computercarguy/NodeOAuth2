module.exports = (req) => {
    if (req.headers.authorization) {
        let tokens = req.headers.authorization.split(" ");
        
        if (tokens[0].toLowerCase() == "bearer") {
            return tokens[1];    
        }
    }
    return null;
}
