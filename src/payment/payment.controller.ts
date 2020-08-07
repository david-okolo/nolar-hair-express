import { Router } from "express";
import crypto from "crypto";
import { getRepository } from "typeorm";
import { Payment } from "../entities/payment.entity";
import { verifyHook } from "./payment.service";

const router = Router();

const whitelistedIPs = ["52.31.139.75", "52.49.173.169", "52.214.14.220"];

router.post("/webhook", async (req, res) => {
  const hash = crypto
    .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY)
    .update(JSON.stringify(req.body))
    .digest("hex");
  if (hash === req.headers["x-paystack-signature"]) {
    // Retrieve the request's body
    const { event, data } = req.body;

    if (event === "charge.success") {
      try {
        await verifyHook(data.reference);
      } catch (error) {
        res.sendStatus(500);
        return;
      }
    }

    res.sendStatus(200);
    return;
  }
  res.sendStatus(400);
});

export const PaymentController = router;
