import bcrypt from "bcryptjs"
import { debug, errorHelper } from "../../utils/helper/helper.js"
import { storeUserSchema, updateUserSchema } from "./user.schema.js"
import User from "./user.domain.js"

class userController {
    async index (req, res) {
        const { username } = req.auth
        try {
            const users = await User.findAll({
                attributes: ["id", "username", "email", "phone_number", "role"]
            })

            const message = "Success get users"
            debug(username, true, 200, message, req)
            return res.status(200).json({
                status: true,
                message,
                data: users
            })
        } catch (err) {
            const { username, code, message, body } = errorHelper(err)
            
            debug(username, false, code, message, req)
            return res.status(code).json(body)
        }
    }
    
    async store (req, res) {
        const { username } = req.auth
        try {
            const validate = storeUserSchema.parse(req.body)

            validate.password = bcrypt.hashSync(validate.password)

            const storeUser = await User.create(validate)
            if (!storeUser) throw { username, code: 400, message: "Failed create user" }

            const message = "Success create user"
            debug(username, true, 201, message, req)
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

    async update (req, res) {
        const { username } = req.auth
        const { id } = req.params
        try {
            const validate = updateUserSchema.parse(req.body)

            const data = {
                username: validate.username,
                first_name: validate.first_name,
                last_name: validate.last_name,
                phone_number: validate.phone_number,
                email: validate.email,
                role: validate.role,
                ...validate.password && { password: bcrypt.hashSync(validate.password) }
            }

            const updateUser = await User.update(data, {
                where: { id }
            })
            if (!updateUser) throw { username, code: 400, message: "Failed update user" }

            const message = "Success update user"
            debug(username, true, 200, message, req)
            return res.status(200).json({
                status: true,
                message,
                data: {
                    id,
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

    async delete (req, res) {
        const { username } = req.auth
        const { id } = req.params
        try {
            const deleteUser = await User.destroy({
                where: { id }
            })
            if (!deleteUser) throw { username, code: 400, message: "Failed delete user" }

            debug(username, true, 204, "Success delete user", req)
            return res.sendStatus(204)
        } catch (err) {
            const { username, code, message, body } = errorHelper(err)

            debug(username, false, code, message, req)
            return res.status(code).json(body)
        }   
    }
}

export default new userController()