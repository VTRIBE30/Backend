const { decrypt } = require("../utils/encrypt");

const authorizeUser = (req, res, next) => {
    if (!req.headers['x-api-key']) {
        return res.status(401).json({
            status: false,
            error: 'Authorization failed: No API key provided',
        });
    }
    const apiKey = req.headers['x-api-key'];
    try {
        // console.log(apiKey)
        if (decrypt(apiKey) !== decrypt(process.env.API_KEY)) {
            return res.status(401).json({
                status: false,
                error: 'Authorization failed: Invalid API key',
            });
        }
        next();
    } catch (error) {
        console.log(error)
        return res.status(401).json({
            status: false,
            message: "Something went wrong while trying to authorize you",
            error: error,
        });
    }
}

module.exports = { authorizeUser }