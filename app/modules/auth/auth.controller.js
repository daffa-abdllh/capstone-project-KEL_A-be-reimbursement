import { Op } from "sequelize"
import { env, getCookieOptions } from "../../config/config.js"
import { debug, errorHelper, issueToken } from "../../utils/helper/helper.js"
import Token from "../token/token.domain.js"
import User from "../user/user.domain.js"
import { loginSchema } from "./auth.schema.js"
import bcrypt from "bcryptjs"

const ACCESS_SECRET = env("ACCESS_TOKEN_SECRET_KEY")
const REFRESH_SECRET = env("REFRESH_TOKEN_SECRET_KEY")

class authController {
    async login (req, res) {
        try {
            const { identifier, password, remember_me } = loginSchema.parse(req.body)

            const isEmail = /^\S+@\S+\.\S+$/.test(identifier)
            const where = isEmail ? { email: identifier } : { username: identifier }

            const findUser = await User.findOne({ where })
            if (!findUser || !bcrypt.compareSync(password, findUser.password)) throw { username: identifier, code: 401, message: "Invalid username or password" }

            const payloadToken = (({ id, username, phone_number, email, role }) => ({
                id,
                username,
                phone_number,
                email,
                role
            }))(findUser)

            const tokenExpiresIn = parseInt(env("ACCESS_TOKEN_LIFETIME"))
            const token = issueToken(payloadToken, ACCESS_SECRET, tokenExpiresIn)
            const tokenExpiresAt = new Date(Date.now() + tokenExpiresIn * 1000)

            const refreshTokenExpiresIn = remember_me ? 3600 * 24 * 30 : 3600 * 24
            const refreshToken = issueToken(payloadToken, REFRESH_SECRET, refreshTokenExpiresIn)
            const refreshTokenExpiresAt = new Date(Date.now()  + refreshTokenExpiresIn * 1000)

            const storeToken = await Token.create({
                user_id: findUser.id,
                token: refreshToken,
                user_agent: req.headers["user-agent"],
                ip: req.headers["x-forwarded-for"] || req.socket.remoteAddress,
                expires_at: refreshTokenExpiresAt,
                usage: 1,
            })
            if (!storeToken) throw { username: findUser.username, code: 400, message: "Failed store new token" }

            // Cookie
            const accessCookieName = env("ACCESS_COOKIE_NAME") || "sso_access";
            const refreshCookieName = env("REFRESH_COOKIE_NAME") || "sso_refresh";

            res.cookie(
                accessCookieName,
                token,
                getCookieOptions({ req, maxAgeMs: tokenExpiresIn * 1000 })
            );

            res.cookie(
                refreshCookieName,
                refreshToken,
                getCookieOptions({ req, maxAgeMs: refreshTokenExpiresIn * 1000 })
            );

            const message = "Success login"
            debug(findUser.username, true, 200, message, req)
            return res.status(200).json({
                status: true,
                message: message,
                data: {
                    token_expires_at: tokenExpiresAt.toISOString(),
                    refresh_token_expires_at: refreshTokenExpiresAt.toISOString(),
                },

            })
        } catch (err) {
            const { username, code, message, body } = errorHelper(err)

            debug(username, false, code, message, req)
            return res.status(code).json(body)
        }
    }

    async refresh (req, res) {
        try {
            const refreshCookieName = env("REFRESH_COOKIE_NAME") || "sso_refresh";
            let token = req.cookies?.[refreshCookieName];
            if (!token) throw { username: null, code: 401, message: "Missing bearer refresh token" }

            const existed = await Token.findOne({
                where: {
                    token,
                    usage: 1,
                    expires_at: { [Op.gt]: new Date() }
                },
                include: {
                    model: User,
                    attributes: ["id", "username", "phone_number", "email", "role"]
                }
            })
            if (!existed) throw { username: null, code: 404, message: "Refresh token not found" }

            const payloadToken = (({ id, username, phone_number, email, role }) => ({
                id,
                username,
                phone_number,
                email,
                role
            }))(existed.user)

            const tokenExpiresIn = parseInt(env("ACCESS_TOKEN_LIFETIME"))
            const accessToken = issueToken(payloadToken, ACCESS_SECRET, tokenExpiresIn)
            const tokenExpiresAt = new Date(Date.now() + tokenExpiresIn * 1000)

            // Cookie
            const accessCookieName = env("ACCESS_COOKIE_NAME") || "sso_access";

            res.cookie(
                accessCookieName,
                accessToken,
                getCookieOptions({ req, maxAgeMs: tokenExpiresIn * 1000 })
            );

            const message = "Success get new token"
            debug(payloadToken.username, true, 200, message, req)
            return res.status(200).json({
                status: true,
                message: message,
                data: {
                    token_expires_at: tokenExpiresAt.toISOString(),
                }
            })
        } catch (err) {
            const { username, code, message, body } = errorHelper(err)

            debug(username, false, code, message, req)
            return res.status(code).json(body)
        }
    }

    async userinfo (req, res) {
        try {
            const { id, username } = req.auth

            const findUser = await User.findByPk(id, { attributes: { exclude: ["createdAt", "updatedAt", "password"] } })
            if (!findUser) throw { username, code: 404, message: "User not found" }

            const message = "Success get userinfo"
            debug(username, true, 200, message, req)
            return res.status(200).json({
                status: true,
                message,
                data: findUser
            })
        } catch (err) {
            const { username, code, message, body } = errorHelper(err)

            debug(username, false, code, message, req)
            return res.status(code).json(body)
        }
    }

    async logout (req, res) {
        try {
            const { id, username } = req.auth
            const { sso_access, sso_refresh } = req.token

            const findRefToken = await Token.findOne({
                where: {
                    token: sso_refresh,
                    usage: 1,
                    expires_at: { [Op.gt]: new Date() }
                },
                include: {
                    model: User,
                    attributes: ["id", "username", "phone_number", "email"]
                }
            })
            if (!findRefToken) throw { username, code: 401, message: "Invalid or expired refresh token" }

            await findRefToken.destroy()

            const accessCookieName = env("ACCESS_COOKIE_NAME") || "sso_access";
            const refreshCookieName = env("REFRESH_COOKIE_NAME") || "sso_refresh";
            const baseCookieOptions = getCookieOptions({ maxAgeMs: 0 });

            res.clearCookie(accessCookieName, baseCookieOptions);
            res.clearCookie(refreshCookieName, baseCookieOptions);

            debug(username, true, 204, "Success logout", req)
            return res.sendStatus(204)
        } catch (err) {
            const { username, code, message, body } = errorHelper(err)

            debug(username, false, code, message, req)
            return res.status(code).json(body)
        }
    }
}

export default new authController()