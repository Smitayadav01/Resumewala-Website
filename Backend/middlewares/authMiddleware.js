import jwt from "jsonwebtoken";
import User from "../models/User.js";

const authMiddleware = async (req, res, next) => {

  const authHeader = req.headers.authorization;

  // ✅ NO HEADER → allow
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    req.user = null;
    return next();
  }

  const token = authHeader.split(" ")[1];

  // ✅ BAD TOKEN (null, undefined)
  if (!token || token === "null" || token === "undefined") {
    req.user = null;
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      req.user = null;
      return next();
    }

    req.user = user;
    return next();

  } catch (err) {
    console.log("❌ Invalid token → treated as guest");
    req.user = null;
    return next();
  }
};

export default authMiddleware;