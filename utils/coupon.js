const crypto = require('crypto');

exports.generateCouponCode = (userId, monetaryValue) => {
    const length = 10; 
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    let couponCode = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        couponCode += characters.charAt(randomIndex); 
    }

    const uniqueCouponCode = `${userId}-${couponCode}`;

    const numericValue = parseFloat(monetaryValue);

    return { code: uniqueCouponCode, value: numericValue };
}

