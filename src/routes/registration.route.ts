import express, { Request, Response } from "express";
import { sendMail } from "../services/mail.services";
import logger from "../logger";
import { EventRegistration } from "../entity/common/event-registration";

const router = express.Router();

const clean = (v: unknown, max = 500): string =>
    typeof v === "string" ? v.replace(/\r/g, "").trim().slice(0, max) : "";

router.post("/create-registration", async (req: Request, res: Response) => {
    const b = req.body || {};

    if (clean(b.website)) return res.status(201).json({ status: true, message: "Registration received." });

    const d = {
        eventId: clean(b.eventId, 120),
        fullName: clean(b.fullName, 100),
        email: clean(b.email, 254).toLowerCase(),
        phone: clean(b.phone, 30),
        organisation: clean(b.organisation, 150),
        designation: clean(b.designation, 100),
        city: clean(b.city, 100),
        participants: Number(b.participants),
        additionalParticipants: clean(b.additionalParticipants, 2000),
        notes: clean(b.notes, 2000),
    };

    if (!d.fullName) return res.status(400).json({ status: false, message: "Full name is required." });
    if (!/^[^\s@,;<>]+@[^\s@,;<>]+\.[^\s@,;<>]+$/.test(d.email))
        return res.status(400).json({ status: false, message: "Please enter a valid email address." });
    if (d.phone.replace(/\D/g, "").length < 7)
        return res.status(400).json({ status: false, message: "Please enter a valid phone number." });
    if (!d.city) return res.status(400).json({ status: false, message: "City is required." });
    if (!Number.isInteger(d.participants) || d.participants < 1 || d.participants > 50)
        return res.status(400).json({ status: false, message: "Participants must be between 1 and 50." });
    if (b.acceptedTerms !== true)
        return res.status(400).json({ status: false, message: "Please accept the terms to continue." });

    const db = res.locals.dbConnection;
    if (!db) return res.status(500).json({ status: false, message: "Database connection failed." });
    const repo = db.getRepository(EventRegistration);
    let saved: EventRegistration;
    try {
        saved = await repo.save(
            repo.create({
                eventId: d.eventId,
                fullName: d.fullName,
                email: d.email,
                phone: d.phone,
                organisation: d.organisation || null,
                designation: d.designation || null,
                city: d.city,
                participants: d.participants,
                additionalParticipants: d.additionalParticipants || null,
                notes: d.notes || null,
                acceptedTerms: true,
                emailStatus: "pending",
                createdOn: new Date(),
            }),
        );
    } catch (err: any) {
        logger.error("Registration save failed", { error: err?.message });
        return res.status(500).json({ status: false, message: "Could not save your registration. Please try again." });
    }

    const text = [
        `Reference: NYMPH-${String(saved.id).padStart(5, "0")}`,
        `Seminar: ${d.eventId || "-"}`,
        `Name: ${d.fullName}`,
        `Email: ${d.email}`,
        `Phone: ${d.phone}`,
        `Organisation: ${d.organisation || "-"}`,
        `Designation: ${d.designation || "-"}`,
        `City: ${d.city}`,
        `Participants: ${d.participants}`,
        `Additional participants: ${d.additionalParticipants || "-"}`,
        `Notes: ${d.notes || "-"}`,
        `Terms accepted: Yes`,
    ].join("\n");

    let emailStatus = "sent";
    try {
        await sendMail({
            subject: `New registration: ${d.eventId || "seminar"} - ${d.fullName}`.replace(/[\r\n]+/g, " "),
            text,
            replyTo: d.email,
        });
    } catch (err: any) {
        emailStatus = "failed";
        logger.error("Registration email failed", { id: saved.id, error: err?.message });
    }
    await repo.update(saved.id, { emailStatus }).catch(() => undefined);

    return res.status(201).json({
        status: true,
        message: "Registration received.",
        data: { id: saved.id, referenceCode: `NYMPH-${String(saved.id).padStart(5, "0")}` },
    });
});

export const registrationRouter = router;