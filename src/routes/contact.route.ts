import express, { Request, Response } from "express";
import { sendMail } from "../services/mail.services";
import logger from "../logger";

const router = express.Router();

const clean = (v: unknown, max: number): string =>
  typeof v === "string" ? v.replace(/\r/g, "").trim().slice(0, max) : "";

// Public: "Contact us" form -> one email to MAIL_ADMIN_TO (nothing is stored)
router.post("/send-message", async (req: Request, res: Response) => {
  const b = req.body || {};

  // hidden "website" field: bots fill it, people don't
  if (clean(b.website, 200)) return res.status(201).json({ status: true, message: "Message sent." });

  const d = {
    name: clean(b.name, 100),
    email: clean(b.email, 254).toLowerCase(),
    company: clean(b.company, 150),
    subject: clean(b.subject, 150).replace(/\n+/g, " "),
    message: clean(b.message, 3000),
  };

  if (!d.name) return res.status(400).json({ status: false, message: "Please enter your name." });
  if (!/^[^\s@,;<>]+@[^\s@,;<>]+\.[^\s@,;<>]+$/.test(d.email))
    return res.status(400).json({ status: false, message: "Please enter a valid email address." });
  if (!d.message) return res.status(400).json({ status: false, message: "Please enter your message." });

  const text = [
    `Name: ${d.name}`,
    `Email: ${d.email}`,
    `Company: ${d.company || "-"}`,
    `Subject: ${d.subject || "-"}`,
    "",
    d.message,
  ].join("\n");

  try {
    await sendMail({
      subject: `Website enquiry: ${d.subject || "Contact form"} - ${d.name}`.replace(/[\r\n]+/g, " "),
      text,
      replyTo: d.email,
    });
    return res.status(201).json({ status: true, message: "Message sent." });
  } catch (err: any) {
    logger.error("Contact email failed", { error: err?.message });
    return res.status(500).json({ status: false, message: "Could not send your message. Please try again." });
  }
});

export const contactRouter = router;