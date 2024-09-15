const jwt = require("jsonwebtoken");

const authenticateUser = (req, res, next) => {
  if (
    !req.headers["authorization"] ||
    !req.headers["authorization"].startsWith("Bearer") ||
    !req.headers["authorization"].split(" ")[1]
  ) {
    return res.status(401).json({
      status: false,
      error: "Authentication failed: No token provided",
    });
  }
  const token = req.headers["authorization"].split(" ")[1];
  try {
    jwt.verify(token, process.env.JWT_SECRET, (err, data) => {
      if (err) {
        return res.status(401).json({
          status: false,
          error:
            "Authentication failed: Invalid or expired token, you may need to sign in again",
          err,
        });
      }
      // console.log(data)
      req.user = data;
      return next();
    });
  } catch (error) {
    console.log(error);
    return res.status(401).json({
      status: false,
      message: "Something went wrong while trying to authorize you",
      error: error,
    });
  }
};

const authenticateAdmin = (req, res, next) => {
  if (
    !req.headers["authorization"] ||
    !req.headers["authorization"].startsWith("Bearer") ||
    !req.headers["authorization"].split(" ")[1]
  ) {
    return res.status(401).json({
      status: false,
      error: "Authentication failed: No token provided",
    });
  }
  const token = req.headers["authorization"].split(" ")[1];
  try {
    jwt.verify(token, process.env.ADMIN_JWT_SECRET, (err, data) => {
      if (err) {
        return res.status(401).json({
          status: false,
          error:
            "Authentication failed: Invalid or expired token, you may need to sign in again",
          err,
        });
      }
      // console.log(data)
      req.admin = data;
      return next();
    });
  } catch (error) {
    console.log(error);
    return res.status(401).json({
      status: false,
      message: "Something went wrong while trying to authorize you",
      error: error,
    });
  }
};

module.exports = { authenticateUser, authenticateAdmin };
