import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import Razorpay from "razorpay";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET_KEY,
});

const placeOrder = async (req, res) => {
  try {
    const newOrder = new orderModel({
      userId: req.body.userId,
      items: req.body.items,
      amount: req.body.amount,
      address: req.body.address,
    });

    await newOrder.save();
    await userModel.findByIdAndUpdate(req.body.userId, { cartData: {} });

    const amount = req.body.amount * 100; 
    const options = {
      amount: amount,
      currency: "INR",
      receipt: `order_${newOrder._id}`,
    };

    const order = await razorpay.orders.create(options);

    res.json({
      success: true,
      orderId: newOrder._id,
      razorpayOrderId: order.id, 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Order failed", error });
  }
};

export { placeOrder };
