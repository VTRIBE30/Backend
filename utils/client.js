const getClientURL = (req) => {
    const protocol = req.protocol;
    const host = req.get('host');
    const clientURL = `${protocol}://${host}`;

    return clientURL;
};

module.exports = {getClientURL}