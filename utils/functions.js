exports.isNumericFourLetterWord = (word) => {
  const regex = /^[0-9]{4}$/;
  return regex.test(word);
};

exports.isEmail = (input) => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(input);
};

exports.isPhoneNumber = (input) => {
  const phoneRegex = /^\+?[0-9]{1,4}-?[0-9]{6,}$/;
  if (typeof input !== "string") {
    return false;
  }

  if (!phoneRegex.test(input)) {
    return false;
  }

  return input.trim().startsWith("+");
};

exports.convertToCents = (amount, currency) => {
  switch (currency.toLowerCase()) {
    case "cad":
      return Math.round(amount * 100);
    default:
      throw new Error("Unsupported currency");
  }};

exports.formatWalletBalance = (balance) => {
  const formattedBalance = Number(balance).toFixed(2); 

  return Number(formattedBalance)
};
