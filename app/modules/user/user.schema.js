import { z } from "zod"

export const storeUserSchema = z.object({
    username: z
        .string()
        .nonempty("Username is required"),

    first_name: z
        .string()
        .nonempty("Firstname code is required"),

    last_name: z
        .string()
        .nonempty("Lastname code is required"),

    phone_number: z
        .string()
        .nullable()
        .refine((val) => val === null || val.startsWith("62"), {
            message: "Phone number must start with 62",
        })
        .refine((val) => {
            if (val === null) return true;
            // validasi angka + panjang (62 + 8..13 digit => total 10..15 digit, sesuaikan kebutuhan)
            if (!/^\d+$/.test(val)) return false;
            return val.length >= 10 && val.length <= 15;
        }, {
            message: "Phone number must be numeric and have a valid length",
        }),

    bank_account: z
        .number()
        .min(1, "Bank account is required"),

    email: z
        .string()
        .nonempty("Email is required")
        .email("Invalid email format"),

    role: z
        .number()
        .min(1, "Role is required"),

    password: z
        .string()
        .nonempty("Password is required")
        .min(8, "Password must be at least 8 characters"),

    confirm_password: z
        .string()
        .nonempty("Confirm password is required")
}).refine((data) => data.password === data.confirm_password, {
    path: ["confirm_password"],
    message: "Passwords do not match",
})

export const updateUserSchema = z.object({
    username: z
        .string()
        .nonempty("Username is required"),

    first_name: z
        .string()
        .nonempty("Firstname code is required"),

    last_name: z
        .string()
        .nonempty("Lastname code is required"),

    phone_number: z
        .string()
        .nullable()
        .refine((val) => val === null || val.startsWith("62"), {
            message: "Phone number must start with 62",
        })
        .refine((val) => {
            if (val === null) return true;
            // validasi angka + panjang (62 + 8..13 digit => total 10..15 digit, sesuaikan kebutuhan)
            if (!/^\d+$/.test(val)) return false;
            return val.length >= 10 && val.length <= 15;
        }, {
            message: "Phone number must be numeric and have a valid length",
        }),

    bank_account: z
        .number()
        .min(1, "Bank account is required"),

    email: z
        .string()
        .nonempty("Email is required")
        .email("Invalid email format"),

    role: z
        .number()
        .min(1, "Role is required"),

    password: z
        .string()
        .nullable(),

    confirm_password: z
        .string()
        .nullable()
}).refine((data) => {
    if (data.password) {
        return data.password === data.confirm_password;
    }

    return true; // jika password tidak diupdate, validasi tetap lolos
}, {
    message: "Passwords do not match",
    path: ["confirm_password"],
})