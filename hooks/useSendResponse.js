module.exports = (res, message, error, statusCode) => {
    let status = error != null ? 400 : 200;

    res.status(statusCode ?? status).json({
        message: message,
        error: error
    });
};
