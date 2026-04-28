import { z } from "zod"

export const createCategorySchema = z.object({
    name: z.string().nonempty("Name is required"),
    description: z.string().nonempty("Description is required"),
    status: z.boolean().default(true)
})