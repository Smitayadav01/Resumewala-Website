// middlewares/requireAuth.js

const requireAuth = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Login required"
    });
  }
  next();
};

export default requireAuth;