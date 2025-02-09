import orderModel from "../models/orderModel.js"
import userModel from "../models/userModel.js"
import Razorpay from "razorpay"

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET_KEY,
})

const placeOrder = async (req, res) => {
  const frontend_url = "http://localhost:5173" 

  try {
    console.log("Received order request:", req.body)

    if (!req.body.userId || !req.body.items || !req.body.amount || !req.body.address) {
      throw new Error("Missing required fields in the request body")
    }

    const newOrder = new orderModel({
      userId: req.body.userId,
      items: req.body.items,
      amount: req.body.amount,
      address: req.body.address,
    })

    const savedOrder = await newOrder.save()
    console.log("Order saved to database:", savedOrder)

    await userModel.findByIdAndUpdate(req.body.userId, { cartData: {} })
    console.log("User cart cleared")
    const amountInCents = Math.round(req.body.amount * 100)
    const orderOptions = {
      amount: amountInCents,
      currency: "INR",
      receipt: `order_${savedOrder._id}`,
    }
    console.log("Creating Razorpay order with options:", orderOptions)
    const order = await razorpay.orders.create(orderOptions)
    console.log("Razorpay Order Created:", order)
    res.json({
      success: true,
      razorpayOrderId: order.id,
      amount: amountInCents,
      currency: "USD", 
      orderId: savedOrder._id,
    })
  } catch (error) {
    console.error("Order Error:", error)
    res.status(500).json({
      success: false,
      message: "Order failed",
      error: error.message || "Unknown error occurred",
    })
  }
}
export{placeOrder}
