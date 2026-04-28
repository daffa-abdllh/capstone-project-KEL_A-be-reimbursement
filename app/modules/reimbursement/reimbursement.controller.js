import { debug, errorHelper, toPlain } from "../../utils/helper/helper.js"
import { env, sequelize } from "../../config/config.js"
import { approvalSchema, storeReimburseSchema } from "./reimbursement.schema.js"
import Category from "../category/category.domain.js"
import { decodeDataUriToBuffer, extFromMime, replaceExt } from "../../utils/helper/document.helper.js"
import Reimbursement from "./reimbursement.domain.js"
import { deleteData, postData } from "../../utils/service.js"
import User from "../user/user.domain.js"

class reimburseController {
    async index (req, res) {
        const { id, username } = req.auth
        try {
            const reimburse = await Reimbursement.findAll({
                include: [
                    {
                        model: User,
                        attributes: ["id", "username", "first_name", "last_name"]
                    },
                    {
                        model: Category,
                        attributes: ["id", "name"]
                    }
                ],
                attributes: { exclude: ["createdAt", "updatedAt", "user_id", "category_id"] }
            })

            const message = "Success get reimbursement."
            debug(username, true, 200, message, req)
            return res.status(200).json({
                status: true,
                message,
                data: reimburse
            })
        } catch (err) {
            const { username, code, message, body } = errorHelper(err)

            await transaction.rollback()

            debug(username, false, code, message, req)
            return res.status(code).json(body)        
        }
    }

    async store (req, res) {
        const { id: user_id, username } = req.auth

        const transaction = await sequelize.transaction()
        try {
            const { date, category_id, description, amount, notas } = storeReimburseSchema.parse(req.body)

            const category = await Category.findOne({
                where: {
                    id: category_id,
                    status: true
                }
            })
            if (!category) throw { username, code: 404, message: "Category not found." }

            const storeReimburse = await Reimbursement.create(
                { date, user_id, category_id, description, amount },
                { transaction }
            )
            if (!storeReimburse) throw { username, code: 400, message: "Failed create reimburse." }
            
            const path = `${user_id}/reimbursements/${storeReimburse.id}/notas/`

            let docs = {
                path,
                files: []
            }
            let upload = []
            let duplicateData = []
            for (const nota of notas) {
                const { mimeType } = decodeDataUriToBuffer(nota.file)
                const ext = extFromMime(mimeType)
                const filename = replaceExt(nota.filename, ext)

                docs.files.push({ filename })
                upload.push({ filename, file: nota.file })
                duplicateData.push({ path, filename })
            }

            const checkDuplicate = await postData(JSON.stringify({ items: duplicateData }), `${env("S3_URL")}/${env("BUCKET_NAME")}/check-duplicate`);
            if (checkDuplicate.status !== 200) throw { username, code: 400, message: checkDuplicate.data.message }


            await storeReimburse.update({ notas: docs }, { transaction })

            const uploadDocs = await postData(JSON.stringify({ path, items: upload }), `${env("S3_URL")}/${env("BUCKET_NAME")}/bulk/upload`)
            if (uploadDocs.status !== 201) throw { username, code: 400, message: checkDuplicate.data.message }

            await transaction.commit()

            const message = "Success create reimbursemet."
            debug(username, true, 201, message, req)
            return res.status(201).json({
                status: true,
                message,
                data: {
                    id: storeReimburse.id,
                    date,
                    description
                }
            })
        } catch (err) {
            const { username, code, message, body } = errorHelper(err)

            await transaction.rollback()

            debug(username, false, code, message, req)
            return res.status(code).json(body)            
        }
    }

    async delete (req, res) {
        const { id: user_id, username } = req.auth
        const { id } = req.params

        const transaction = await sequelize.transaction()
        try {
            const findReimburse = await Reimbursement.findOne({
                where: { id, user_id }
            })
            if (!findReimburse) throw { username, code: 404, message: "Reimbursement not found." }

            await findReimburse.destroy({ transaction })

            const reimburse = toPlain(findReimburse)
            for (const item of reimburse.notas.files) {
                const data = {
                    path: reimburse.notas.path,
                    filename: item.filename
                }

                const deleteFile = await deleteData(JSON.stringify(data), `${env("S3_URL")}/file/${env("BUCKET_NAME")}`)
                if (deleteFile.status !== 204) throw { username, code: deleteData.status, message: deleteData.data.message }
            }

            await transaction.commit()

            debug(username, true, 204, "Success delete reimbursement", req)
            return res.sendStatus(204)
        } catch (err) {
            const { username, code, message, body } = errorHelper(err)

            await transaction.rollback()

            debug(username, false, code, message, req)
            return res.status(code).json(body)        
        }
    }

    async approval (req, res) {
        const { username } = req.auth
        const { id } = req.params

        const transaction = await sequelize.transaction()
        try {
            const { status, proof_of_payments } = approvalSchema.parse(req.body)

            const findReimburse = await Reimbursement.findOne({
                where: { id, status: 1 }
            })
            if (!findReimburse) throw { username, code: 404, message: "Reimburse not found" }

            const reimburse = toPlain(findReimburse)
            const path = `${reimburse.user_id}/reimbursements/${id}/proof-of-payments/`

            let update = {
                status: 2,
                proof_of_payments: {
                    path,
                    files: []
                }
            }
            let upload = []
            let duplicateData = []
            if (status === 2) {
                for (const proof of proof_of_payments) {
                    const { mimeType } = decodeDataUriToBuffer(proof.file)
                    const ext = extFromMime(mimeType)
                    const filename = replaceExt(proof.filename, ext)

                    update.proof_of_payments.files.push({ filename })
                    upload.push({ filename, file: proof.file })
                    duplicateData.push({ path, filename })
                }

                const checkDuplicate = await postData(JSON.stringify({ items: duplicateData }), `${env("S3_URL")}/${env("BUCKET_NAME")}/check-duplicate`);
                if (checkDuplicate.status !== 200) throw { username, code: 400, message: checkDuplicate.data.message }

                const uploadDocs = await postData(JSON.stringify({ path, items: upload }), `${env("S3_URL")}/${env("BUCKET_NAME")}/bulk/upload`)
                if (uploadDocs.status !== 201) throw { username, code: 400, message: checkDuplicate.data.message }
            } else {
                update.status = 0
                update.proof_of_payments = {}
            }

            await findReimburse.update({ ...update }, { transaction })
            await transaction.commit()

            const message = `Success ${status === 1 ? "Approved" : "Rejected"}`
            debug(username, true, 200, message, req)
            return res.status(200).json({
                status: true,
                message,
                data: {
                    id: findReimburse.id,
                    date: findReimburse.date,
                    description: findReimburse.description,
                }
            })
        } catch (err) {
            const { username, code, message, body } = errorHelper(err)

            await transaction.rollback()

            debug(username, false, code, message, req)
            return res.status(code).json(body)       
        }
    }
}

export default new reimburseController()