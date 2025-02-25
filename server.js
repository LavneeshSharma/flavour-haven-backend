import express from "express"
import cors from "cors"
import { connectdb } from "./config/db.js"
import foodRouter from "./routes/foodRoute.js"
import userRouter from "./routes/userRoute.js"
import 'dotenv/config'
import cartRouter from "./routes/cartRoute.js"
import orderRouter from "./routes/orderRoute.js"

const app=express()
const port=3000

app.use(express.json());
app.use(cors());
app.use("/api/food",foodRouter)
app.use("/images",express.static('uploads'))
app.use("/api/user",userRouter)
app.use("/api/cart",cartRouter)
app.use("/api/order",orderRouter)
connectdb();
app.get('/',(req,res)=>{
    res.send("API working")
})
app.listen(port,()=>{
    console.log(`Server started on http://localhost:${port}`)
})
