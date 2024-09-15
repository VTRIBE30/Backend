const jwt = require("jsonwebtoken");

class JWT {
  // generate user access token
  generateAccessToken(userId, email, phoneNumber) {
    return jwt.sign({ userId, email, phoneNumber }, process.env.JWT_SECRET, {
      expiresIn: "365d",
    });
  }

  // verify user access token
  verifyAccessToken(token, res) {
    try {
      jwt.verify(token, process.env.JWT_SECRET, (err, data) => {
        if (err) {
          return res.json({
            status: false,
            message: "Your token has expired, Please sign in again",
            err,
          });
        }
      });
    } catch (error) {
      res.status(401).json({
        status: false,
        message: "Something went wrong while trying to authorize you",
        error: error,
      });
      return;
    }
  }
  // generate ADMIN access token
  generateAdminAccessToken(adminId, email, role) {
    return jwt.sign(
      { adminId, email, role },
      process.env.ADMIN_JWT_SECRET,
      {
        expiresIn: "365d",
      }
    );
  }

  // verify user access token
  verifyAdminAccessToken(token, res) {
    try {
      jwt.verify(token, process.env.ADMIN_JWT_SECRET, (err, data) => {
        if (err) {
          return res.json({
            status: false,
            message: "Your token has expired, Please sign in again",
            err,
          });
        }
        if (decoded.role !== "SUPER_ADMIN" || "SUB_ADMIN") {
          return res
            .status(403)
            .json({ status: false, message: "Access forbidden" });
        }
      });
    } catch (error) {
      res.status(401).json({
        status: false,
        message: "Something went wrong while trying to authorize you",
        error: error,
      });
      return;
    }
  }
}

module.exports = JWT;
