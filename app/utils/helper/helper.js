import { z } from "zod"
import jwt from "jsonwebtoken"
import fs from 'fs';
import path from 'path';

export const errorHelper = (err) => {
    const isZod = err instanceof z.ZodError
                            
    const username = err?.username || undefined
    const code = isZod ? 422 : (err?.code ?? 500)
    const message = isZod ? "Validation error." : (err?.message ?? "Internal Server Error")
    const body = { status: false, message }
                                        
    if (isZod) {
        body.errors = err.issues.map(({ path, message, code, expected, received }) => ({
            path: Array.isArray(path) ? path.join(".") : String(path ?? ""),
            message,
            code,
            expected,
            received,
        }))
    }

    return { username, code, message, body }
}

export const debug = (username, status, code, message, req) => {
    const debug = {
        ip: req.headers["x-forwarded-for"] || req.socket.remoteAddress,
        browser: req.headers['user-agent'],
        username,
        date: new Date().toISOString(),
        method: req.method,
        status,
        code,
        url: req.url,
        message
    };

    // Format untuk folder dan nama file
    const now = new Date();
    const yearMonth = `${now.getFullYear()}/${now.toLocaleString('default', { month: 'short' })}`;
    const day = String(now.getDate()).padStart(2, '0');
    const folder = path.join('./logging', yearMonth);
    const filePath = path.join(folder, `${day}.txt`);

    try {
        // Membuat folder jika belum ada
        fs.mkdirSync(folder, { recursive: true });

        // Menulis log ke file
        const logString = JSON.stringify(debug) + '\n';
        fs.appendFileSync(filePath, logString);
    } catch (err) {
        console.error('Terjadi kesalahan saat menulis log:', err);
    }

    console.log(debug);
}

export const issueToken = (payload, secret_key, duration) => {
    const token = jwt.sign(payload, secret_key, { expiresIn: duration })
    return token
}

export const toPlain = (instance) => {
    return instance.get({ plain: true })
}