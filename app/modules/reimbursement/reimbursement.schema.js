import { z } from "zod"

const anyBase64DataUri = z
    .string()
    .trim()
    .min(1, "File is required")
    .regex(
        /^data:[^;]+;base64,[A-Za-z0-9+/=\r\n]+$/,
        "File must be a Base64 Data URI (data:<mime>;base64,...)"
    );

export const storeReimburseSchema = z.object({
    date: z.coerce.date({
        required_error: "Survey date is required",
        invalid_type_error: "Survey date must be a valid date",
    }),
    category_id: z
        .uuid()
        .nonempty("Category is required"),
    
    description: z
        .string()
        .nonempty("Description is required"),

    amount: z
        .number()
        .min(1, "Amount is required"),
    
    notas: z.array(z.object({
        filename: z.string().nonempty("File name is required"),
        file: anyBase64DataUri
    }))
})

export const approvalSchema = z.object({
    status: z.coerce.number().refine((val) => val === 2 || val === 0, {
        message: "Status can only be 2 or 0.",
    }),
    
    proof_of_payments: z.array(z.object({
        filename: z.string().nonempty("File name is required"),
        file: anyBase64DataUri
    }))
    .nullable()
    .optional(), 
}).superRefine((data, ctx) => {
    if (data.status === 1) {
        if (!data.proof_of_payments || data.proof_of_payments.length === 0) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Proof of payment must be attached",
                path: ["proof_of_payments"], // Error akan menempel di field ini
            });
        }
    }
    
  });