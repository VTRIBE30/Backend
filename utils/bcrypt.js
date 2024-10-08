const bcrypt = require('bcrypt');
const saltRounds = 10;

const generateHash = (password) => {
    return bcrypt.hashSync(password, saltRounds)
}
const validatePassword = (password, hash) => {
    return bcrypt.compareSync(password, hash)
}

module.exports = {
    generateHash,
    validatePassword,
}