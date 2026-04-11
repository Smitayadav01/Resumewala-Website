const roleMiddleware = (roles = ["admin"]) => {
    return (req, res, next) => {

        // ✅ check auth
        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        // ✅ check role
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: "Forbidden" });
        }

        next();
    };
};

export default roleMiddleware;