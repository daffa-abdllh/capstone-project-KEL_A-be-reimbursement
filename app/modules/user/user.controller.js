import bcrypt from "bcryptjs"
import { debug, errorHelper } from "../../utils/helper/helper.js"
import { storeUserSchema } from "./user.schema.js"
import User from "./user.domain.js"

class userController {
    async store (req, res) {
        try {
            const validate = storeUserSchema.parse(req.body)

            validate.password = bcrypt.hashSync(validate.password)

            const storeUser = await User.create(validate)
            if (!storeUser) throw { username: null, code: 400, message: "Failed create user" }

            const message = "Success create user"
            debug(null, true, 201, message, req)
            return res.status(201).json({
                status: true,
                message,
                data: {
                    id: storeUser.id,
                    username: validate.username,
                    email: validate.email,
                    role: validate.role
                }
            })
        } catch (err) {
            const { username, code, message, body } = errorHelper(err)

            debug(username, false, code, message, req)
            return res.status(code).json(body)
        }
    }
}

export default new userController()