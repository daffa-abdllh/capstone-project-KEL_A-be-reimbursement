import { Router } from "express"
import { isLoggedIn, role } from "../../utils/middleware.js"
import reimbursementController from "./reimbursement.controller.js"

const router = Router()

router.get("/reimbursement", isLoggedIn, reimbursementController.index)
router.post("/reimbursement", isLoggedIn, reimbursementController.store)
router.delete("/reimbursement/:id", isLoggedIn, reimbursementController.delete)
router.put("/reimbursement/:id/approval", [isLoggedIn, role([1, 2])], reimbursementController.approval)

export default router