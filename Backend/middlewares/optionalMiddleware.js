import jwt from "jsonwebtoken";
import User from "../models/User.js";

const optionalAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token || token === "null" || token === "undefined") {
      req.user = null;
      return next();
    }

    const decoded = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET || process.env.JWT_SECRET
    );

    // ✅ FETCH REAL USER FROM DB
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      req.user = null;
      return next();
    }

    req.user = user; // ✅ FULL USER OBJECT
    next();

  } catch (err) {
    req.user = null;
    next();
  }
};

export default optionalAuth;
