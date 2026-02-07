const { verifyAccessToken } = require("../utils/jwt");

const authMiddleware = (req, res, next) => {
  const token = req.cookies.accessToken;

  if (!token) {
    return res.redirect("/login");
  }

  const decoded = verifyAccessToken(token);

  if (!decoded) {
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    return res.redirect("/login");
  }

  req.user = decoded;
  next();
};

const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    return next();
  }
  return res.status(403).render("error", {
    message: "Access Denied: Admin only",
    user: req.user,
  });
};

const isUser = (req, res, next) => {
  if (req.user && (req.user.role === "user" || req.user.role === "admin")) {
    return next();
  }
  return res.status(403).render("error", {
    message: "Access Denied",
    user: req.user,
  });
};

module.exports = {
  authMiddleware,
  isAdmin,
  isUser,
};
