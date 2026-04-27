import { Router } from "express"
import userController from "./user.controller.js"
import { isLoggedIn, role } from "../../utils/middleware.js"

const router = Router()

router.post("/users", [isLoggedIn, role([1])], userController.store)
router.get("/users", [isLoggedIn], userController.index)
router.put("/users/:id", [isLoggedIn, role([1])], userController.update)
router.delete("/users/:id", [isLoggedIn, role([1])], userController.delete)

export default router