import { model } from "mongoose"
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

    const updatedUser = await userModel.findByIdAndUpdate(
      req.body.userId,
      { cartData: {} },
      { new: true, runValidators: true }
    )
    if (!updatedUser) throw new Error("User update failed")
    
    console.log("User cart cleared")

    const amountInPaise = Math.round(req.body.amount * 100)
    const orderOptions = {
      amount: amountInPaise,
      currency: "INR",
      receipt: `order_${savedOrder._id}`,
    }

    console.log("Creating Razorpay order with options:", orderOptions)
    const order = await razorpay.orders.create(orderOptions)
    console.log("Razorpay Order Created:", order)

    res.json({
      success: true,
      razorpayOrderId: order.id,
      amount: amountInPaise,
      currency: "INR",
      orderId: savedOrder._id,
      session_url: `${frontend_url}/verify?success=true&orderId=${savedOrder._id}`,
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

const verifyOrder = async (req, res) => {
  try {
    console.log("🔹 Received Data:", req.body); // Debug incoming request

    const { orderId, success, userId, items, address } = req.body;

    console.log(userId);

    if (!orderId) {
      return res.status(400).json({ success: false, message: "Missing orderId" });
    }

    console.log(`🔹 Processing Order: ${orderId}, Success: ${success}`);

    if (success === "true") {

      const newOrder = await orderModel.create({
        userId,
        items,
        address,
      })

  
      return res.json({ success: true, message: "payment successfully stored in db" });
    } else {
    
      return res.json({ success: false, message: "Payment Failed" });
    }
  } catch (error) {
    console.error("🚨 Backend Error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};


export { placeOrder, verifyOrder }
