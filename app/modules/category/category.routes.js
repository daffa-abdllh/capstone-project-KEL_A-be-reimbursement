import { Router } from "express"
import { isLoggedIn, role } from "../../utils/middleware.js"
import categoryController from "./category.controller.js"

const router = Router()

router.post("/categories", [isLoggedIn, role([1, 2])], categoryController.store)
router.get("/categories", isLoggedIn, categoryController.index)
router.put("/categories/:id", [isLoggedIn, role([1, 2])], categoryController.update)
router.delete("/categories/:id", [isLoggedIn, role([1, 2])], categoryController.delete)

export default router