const roleMiddleware = (roles = ["admin"]) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: "Forbidden" });
        }
        if (req.user.role !== "admin") {
            return res.status(403).json({ message: "You are not authorized to perform this action" });
        }
        next();
    }
}

export default roleMiddleware;