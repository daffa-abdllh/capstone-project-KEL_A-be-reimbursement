import jwt from "jsonwebtoken"
import { env } from "../config/config.js"
import { debug } from "./helper/helper.js"

const ACCESS_SECRET = env("ACCESS_TOKEN_SECRET_KEY")

export const isLoggedIn = async (req, res, next) => {
    try {
        const accessCookieName = env("ACCESS_COOKIE_NAME") || "sso_access";
        let sso_access = req.cookies?.[accessCookieName];
        if (!sso_access) throw { username: null, code: 401, message: "Missing access token" }

        const refreshCookieName = env("REFRESH_COOKIE_NAME") || "sso_refresh";
        let sso_refresh = req.cookies?.[refreshCookieName];

        const decode = await new Promise((resolve, reject) => {
            jwt.verify(sso_access, ACCESS_SECRET, (err, payload) => {
                if (err) return reject({ status: false, code: 401, message: "Invalid or expired access access token" })

                return resolve({
                    status: true,
                    data: {
                        id: payload.id,
                        username: payload.username,
                        email: payload.email,
                        phone_number: payload.phone_number,
                        role: payload.role
                    }
                })
            })
        })

        req.token = { sso_access, sso_refresh }
        req.auth = decode?.data
        next()
    } catch (err) {
        const { username, code, message } = err

        debug(username, false, code || 400, message, req)
        return res.status(code || 400).json({ status: false, message })
    }
}

export const role = (whoCanAccess) => {
    return (req, res, next) => {
        try {
            const role = req.auth.role
            if (!whoCanAccess.includes(role)) throw { username: null, code: 403, message: "Unauthorized role" }

            next()
        } catch (err) {
            const { username, code, message } = err

            debug(username, false, code || 400, message, req)
            return res.status(code || 400).json({ status: false, message })
        }
    }
}