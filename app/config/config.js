import dotenv from "dotenv"
import { Sequelize } from "sequelize"

const dot = dotenv.config().parsed

export const env = (path) => {
    return dot[path]
}

export const sequelize = new Sequelize(env("DB_NAME"), env("DB_USERNAME"), env("DB_PASSWORD"), {
    host: env("DB_HOST"),
    dialect: env("DB_DIALECT"),
    port: env("DB_PORT"),
    logging: false
})

export const getCookieOptions = ({ req, maxAgeMs } = {}) => {
    const cookieSecureEnv = env("COOKIE_SECURE"); // "true" | "false" | undefined
    const sameSiteEnv = (env("COOKIE_SAMESITE") || "").toLowerCase();
    const cookieDomainEnv = env("COOKIE_DOMAIN"); // boleh kosong

    // deteksi host: IP/localhost -> domain harus undefined
    const host = (req?.hostname || req?.headers?.host || "").split(":")[0];
    const isIp = /^\d{1,3}(\.\d{1,3}){3}$/.test(host);
    const isLocal = host === "localhost";
    const domain = (isIp || isLocal) ? undefined : (cookieDomainEnv || undefined);

    // secure: default FALSE untuk local/ip (karena biasanya HTTP)
    const secure =
        cookieSecureEnv != null
        ? cookieSecureEnv === "true"
        : false;

    // sameSite: kalau secure false, jangan pernah "none" (browser reject)
    const sameSite =
        sameSiteEnv
        ? (sameSiteEnv === "none" && !secure ? "lax" : sameSiteEnv)
        : (secure ? "none" : "lax");

    return {
        httpOnly: true,
        secure,
        sameSite,
        domain,
        path: "/",
        maxAge: maxAgeMs,
    };
};