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

// Di dalam config.js
// config.js
export const getCookieOptions = ({ req, maxAgeMs } = {}) => {
    // 1. Ambil host dari request
    const host = (req?.hostname || req?.headers?.host || "").split(":")[0];
    
    // 2. Cek apakah ini lokal (localhost atau 127.0.0.1)
    const isLocal = host === "localhost" || host === "127.0.0.1";

    // 3. ATURAN KRUSIAL: Jika lokal, domain WAJIB undefined
    // Jangan berikan string "localhost" ke property domain
    const domain = isLocal ? undefined : (env("COOKIE_DOMAIN") || undefined);

    const secure = env("COOKIE_SECURE") === "true";
    const sameSite = (env("COOKIE_SAMESITE") || (secure ? "none" : "lax")).toLowerCase();

    return {
        httpOnly: true,
        secure,
        sameSite,
        domain, // Ini akan bernilai undefined saat kamu buka di localhost
        path: "/",
        maxAge: maxAgeMs,
    };
};