import express from "express"
import cors from "cors"
import { env, sequelize } from "./app/config/config.js"
import cookieParser from "cookie-parser"
import userRouter from "./app/modules/user/user.routes.js"
import authRouter from "./app/modules/auth/auth.routes.js"
import categoryRouter from "./app/modules/category/category.routes.js"
import reimbursementRouter from "./app/modules/reimbursement/reimbursement.routes.js"

const app = express()
const PORT = env("PORT")

app.use(cors({
    origin: JSON.parse(env("CLIENT_URL") || "[]"),
    credentials: true,
    exposedHeaders: ["set-cookie"]
}))
app.use(cookieParser())
app.use(express.json())

app.use(env("APP_PATH"), userRouter)
app.use(env("APP_PATH"), authRouter)
app.use(env("APP_PATH"), categoryRouter)
app.use(env("APP_PATH"), reimbursementRouter)

app.use((req, res) => {
    return res.status(404).json({ status: false, message: `Endpoint not found: ${req.originalUrl}` })
})

sequelize.sync()
    .then(() => console.log(`Connect to PostgreSQL on host ${env("DB_HOST")}`))
    .catch((err) => console.log("Failed connect to PostgreSQL: ", err))

app.listen(PORT, (
    console.log(`App running on port ${PORT}`)
))