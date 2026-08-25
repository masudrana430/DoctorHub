/** biome-ignore-all lint/correctness/noUnusedImports: <explanation> */
/** biome-ignore-all assist/source/organizeImports: <explanation> */
import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { upload } from "../../lib/multer";
import { auth } from "../../middleware/checkAuth";
import { UserController } from "./user.controller";

const router = Router();

router.patch("/profile-image", 
    auth(Role.SUPER_ADMIN, Role.ADMIN, Role.DOCTOR, Role.PATIENT),
    upload.single("profileImage"),
    UserController.uploadProfileImage);

export const UserRoutes = router;
