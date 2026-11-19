import express from "express"
import cors from "cors"
import passport from "passport"
import http from "http"
import cookieParser from "cookie-parser";
import dotenv from 'dotenv'

dotenv.config({
    path: "./.env"
})

const app = express()

app.use(cors({
    origin: ["http://localhost:5173", "http://localhost:5174"], // ei ta te amra kon port e run hobe seta thik  korte parbo
    credentials: true
}))

app.use(express.json({ limit: "10kb" })) // amra ei vabe from er theke data nite pari ar limit korte pari
app.use(express.urlencoded({ extended: true, limit: "10kb" })) //amra ei vabe url er theke data nite pari ar limit korte pari ar extentded er kaj nested object toiri korte  mean object er vitore object toiri korte
app.use(express.static("public"))
app.use(cookieParser()) // read or remove cookie from user server 


// importing routes

// import userRouter from "./routes/user.routes.js"
import authRouter from "./routes/auth.js"
import ProductRouter from "./routes/products.route.js"
// import OrderRouter from "./routes/order.route.js"
import SuperAdminRouter from "./routes/superadmin.route.js"
import sellerRouter from "./routes/sellerRequest.routes.js";
import buyerRouter from "./routes/buyer.routes.js";
import cartRouter from "./routes/cart.route.js";
import orderRouter from "./routes/order.route.js"
import notificationRouter from "./routes/notification.routes.js"

// routes decleartion

// app.use("/api/v1/user", userRouter)
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/seller", sellerRouter);
app.use("/api/v1/buyer", buyerRouter);
app.use("/api/v1/sellerProducts", ProductRouter);
app.use("/api/v1/orders", orderRouter)
app.use("/api/v1/superAdmin", SuperAdminRouter);
app.use("/api/v1/cart", cartRouter);
app.use("/api/v1/notification", notificationRouter);

export default app;