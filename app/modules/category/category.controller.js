import { debug, errorHelper } from "../../utils/helper/helper.js"
import Category from "./category.domain.js"
import { createCategorySchema } from "./category.schema.js"

class categoryController {
    async index (req, res) {
        const { id, username } = req.auth
        const { status } = req.query
        try {
            let Model = Category.scope("defaultScope")
            if (status === "true") {
                Model = Category.scope("active")
            } else if (status === "false") {
                Model = Category.scope("nonActive")
            }

            const categories = await Model.findAll({
                attributes: { exclude: ["createdAt", "updatedAt"] },
                order: [["status", "DESC"]]
            })

            const message = "Categories retrieved successfully."
            debug(username, true, 200, message, req)
            return res.status(200).json({ 
                status: true, 
                message, 
                data: categories 
            })
        } catch (err) {
            const { username, code, message, body } = errorHelper(err)

            debug(username, false, code, message, req)
            return res.status(code).json(body)
        }
    }

    async store (req, res) {
        const { id, username } = req.auth
        try {
            const validate = createCategorySchema.parse(req.body)

            const storeCategory = await Category.create(validate)
            if (!storeCategory) throw { username, code: 400, message: "Failed to create category." }

            const message = "Category created successfully."
            debug(username, true, 201, message, req)
            return res.status(201).json({ 
                status: true, 
                message, 
                data: storeCategory 
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
            const validate = createCategorySchema.parse(req.body)

            const category = await Category.findByPk(id)
            if (!category) throw { username, code: 404, message: "Category not found." }

            const updateCategory = await category.update(validate)
            if (!updateCategory) throw { username, code: 400, message: "Failed to update category." }

            const message = "Category updated successfully."
            debug(username, true, 200, message, req)
            return res.status(200).json({ 
                status: true, 
                message, 
                data: updateCategory 
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
            const category = await Category.findByPk(id)
            if (!category) throw { username, code: 404, message: "Category not found." }

            await category.destroy()

            debug(username, true, 204, "Category deleted successfully.", req)
            return res.sendStatus(204)
        } catch (err) {
            const { username, code, message, body } = errorHelper(err)

            debug(username, false, code, message, req)
            return res.status(code).json(body)
        }
    }
}

export default new categoryController()