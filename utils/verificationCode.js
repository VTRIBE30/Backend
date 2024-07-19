// Generate a random verification code
const generateVerificationCode = () => {
    const length = 6; // Set the desired length of the verification code
    let code = '';

    // Generate a random digit for each position in the code
    for (let i = 0; i < length; i++) {
        const digit = Math.floor(Math.random() * 10);
        code += digit.toString();
    }

    return code;
};

// Generate the expiration date for the verification code
const generateExpirationDate = () => {
    const expirationMinutes = 30; // Set the desired expiration time in minutes
    const expirationDate = new Date();
    expirationDate.setTime(expirationDate.getTime() + expirationMinutes * 60 * 1000);
    return expirationDate;
};

module.exports = {
    generateVerificationCode,
    generateExpirationDate
};
