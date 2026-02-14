import { Router } from "express";
import { getAllProfiles, getProfile, EditProfile, deleteProfile } from "../controllers/adminController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import roleMiddleware from "../middlewares/roleMiddleware,.js";

const router = Router();

router.get("/profiles", authMiddleware, roleMiddleware(["admin"]), getAllProfiles);

router.get("/profile/:id", authMiddleware, roleMiddleware(["admin"]), getProfile);

router.put("/profile/:id", authMiddleware, roleMiddleware(["admin"]), EditProfile);

router.delete("/profile/:id", authMiddleware, roleMiddleware(["admin"]), deleteProfile);

export default router;