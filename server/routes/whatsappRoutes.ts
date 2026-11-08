import { Router, Request, Response } from "express";
import twilio from "twilio";
import { io } from "../index.js"; // ➔ Hooks into your real-time socket engine for live dashboard reactions!

const router = Router();

// ➔ INCOMING WHATSAPP MESSAGE WEBHOOK (POST /api/whatsapp/webhook)
router.post("/webhook", async (req: Request, res: Response): Promise<void> => {
  try {
    // 1. Twilio passes incoming chat metrics as standard URL-encoded form data parameters
    const { From, Body, ProfileName } = req.body;

    // Standard guard verification checks
    if (!From || !Body) {
      res.status(400).send("Missing text message metrics data components.");
      return;
    }

    // 2. Extract and format cell footprint markers
    const incomingPhone = From.replace("whatsapp:", "").trim(); // Strips out the 'whatsapp:' identifier prefix
    const messageText = Body.trim();
    const customerName = ProfileName || "Guest Patron";

    console.log(`📡 [Incoming WhatsApp Chat Alert]:`);
    console.log(`➔ Sender Cell: ${incomingPhone}`);
    console.log(`➔ Sender Name: ${customerName}`);
    console.log(`➔ Typed Message: "${messageText}"`);

    // 3. For Day 1 verification, let's create an automated instant chat reply helper
    const twiml = new twilio.twiml.MessagingResponse();

    // Customize what your bot responds with automatically right inside WhatsApp
    twiml.message(
      `Hello ${customerName}! Welcome to Amehlo automated queue infrastructure. \n\nWe received your text: "${messageText}". Your connection is active! 🚀`,
    );

    // 4. Return the response back to Twilio using their compliant XML content-type format standard
    res.type("text/xml").status(200).send(twiml.toString());
  } catch (error: any) {
    console.error("❌ WHATSAPP BOT WEBHOOK ENGINE CRASH:", error.message);
    res.status(500).send("Internal webhook validation fault.");
  }
});

export default router;
