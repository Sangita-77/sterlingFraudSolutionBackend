import jwt from "jsonwebtoken";

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Extract token from "Bearer <token>"

  if (!token) {
    return res.status(401).json({ message: "Access token required" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      if (err.name === "TokenExpiredError") {
        return res.status(401).json({ message: "Token expired. Please login again." });
      }
      return res.status(403).json({ message: "Invalid token" });
    }
    req.userId = user.id;
    req.user = user;
    next();
  });
};

export const optionalAuth = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token) {
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (!err) {
        req.userId = user.id;
        req.user = user;
      }
    });
  }
  next();
};
