import jwt from "jsonwebtoken";
import Employer from "../models/Employer.js";

export const protectEmployer = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token, authorization denied." });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== "employer") {
      return res.status(403).json({ message: "Access denied. Employer only." });
    }

    const employer = await Employer.findById(decoded.id).select("-password");
    if (!employer) return res.status(401).json({ message: "Employer not found." });
    if (employer.isBlocked) return res.status(403).json({ message: "Account is blocked." });

    req.employer = employer;
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid token." });
  }
};