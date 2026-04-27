import { z } from "zod"

export const loginSchema = z.object({
    identifier: z
        .string()
        .nonempty("Identifier is required"),

    password: z
        .string()
        .nonempty("Password is required")
        .min(8, "Password must be at least 8 characters"),

    remember_me: z
        .boolean({
            required_error: "Remember Me is required",
            invalid_type_error: "Must be true or false",
        }),
})