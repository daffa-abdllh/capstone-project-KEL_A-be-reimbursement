import { Router } from "express"
import authController from "./auth.controller.js"
import { isLoggedIn } from "../../utils/middleware.js"

const router = Router()

router.post("/login", authController.login)
router.post("/refresh", authController.refresh)
router.get("/userinfo", isLoggedIn, authController.userinfo)
router.delete("/logout", isLoggedIn, authController.logout)

export default router