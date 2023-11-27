module.exports = (res, message, error) => {
    res.status(error != null ? 400 : 200).json({
        message: message,
        error: error,
    });
}
