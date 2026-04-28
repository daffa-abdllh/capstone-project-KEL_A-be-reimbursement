export function decodeDataUriToBuffer(dataUri) {
    const raw = String(dataUri)
    const mimeType = raw.includes(";") ? raw.split(";")[0].split(":")[1] : undefined
    const base64Part = raw.includes(",") ? raw.split(",")[1] : raw

    // tolerate base64url
    const normalized = base64Part.replace(/-/g, "+").replace(/_/g, "/")
    const pad = normalized.length % 4
    const padded = pad ? normalized + "=".repeat(4 - pad) : normalized

    return {
        buffer: Buffer.from(padded, "base64"),
        mimeType,
    }
}

export function extFromMime(mimeType) {
    if (!mimeType) return null;

    const map = {
        // docs
        "application/pdf": "pdf",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xlsx",
        "application/vnd.ms-excel": "xls",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
        "application/msword": "doc",

        // images
        "image/png": "png",
        "image/jpeg": "jpg",
        "image/jpg": "jpg",
        "image/webp": "webp",

        // videos
        "video/mp4": "mp4",
        "video/quicktime": "mov",
    };

    // fallback: ambil subtype jika aman (contoh: image/gif => gif)
    const fallback = mimeType.includes("/") ? mimeType.split("/")[1] : null;

    return map[mimeType] || fallback;
}

export function replaceExt(filename, newExt) {
    if (!newExt) return filename;
    const safe = String(filename || "").trim();
    if (!safe) return safe;

    // hilangkan query string/fragment kalau ada (kadang user kirim aneh)
    const clean = safe.split("?")[0].split("#")[0];

    // kalau filename sudah punya ekstensi, ganti. Kalau tidak, tambahkan.
    if (/\.[A-Za-z0-9]+$/.test(clean)) {
        return clean.replace(/\.[A-Za-z0-9]+$/, `.${newExt}`);
    }
    return `${clean}.${newExt}`;
}