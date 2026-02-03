module.exports = (err, req, res, next) => {
    console.error(err.stack);

    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';

    res.status(statusCode).json({
        errorCode: 'INTERNAL_SERVER_ERROR',
        message: message,
        details: process.env.NODE_ENV === 'development' ? [err.stack] : []
    });
};
