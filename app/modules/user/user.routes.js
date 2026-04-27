import { Router } from "express"
import userController from "./user.controller.js"
import { isLoggedIn, role } from "../../utils/middleware.js"

const router = Router()

router.post("/users", [isLoggedIn, role([1])], userController.store)

export default router