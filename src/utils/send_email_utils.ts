let nodemailer = require("nodemailer");
import { Stream } from "stream";
import { createError } from "../common/error";
require("dotenv").config();

interface Attachment {
  filename: string;
  path: string | null;
  content: string | Buffer | Stream,
  contentType?: string;
}

interface MailOptions {
  from: string;
  to: string;
  subject: string;
  text: string;
  attachments?: Attachment[];
}

// ^ Function to send email service
const SendEmailUtils = async (
  EmailTo: string,
  EmailText: string,
  EmailSubject: string,
  attachments: Attachment[] = []
) => {
  try {
    const smtpHost = process.env.SMTP_HOST;
    const smtpEmail = process.env.SMTP_EMAIL;
    const smtpPassword = process.env.SMTP_PASSWORD;
    const name = process.env.NAME;

    if (!smtpHost || !smtpEmail || !smtpPassword || !name) {
      throw new Error('Missing SMTP configuration in environment variables');
    }

    let transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: 465,
      secure: true,
      logger: true,
      debug: true,
      auth: {
        user: smtpEmail,
        pass: smtpPassword,
      },
      tls: {
        rejectUnauthorized: true,
      },
    });

    let mailOptions: MailOptions = {
      from: `Team ${name} <${smtpEmail}>`,
      to: EmailTo,
      subject: EmailSubject,
      text: EmailText,
    };

    if (attachments.length > 0) {
      mailOptions.attachments = attachments;
    }

    return await transporter.sendMail(mailOptions);
  } catch (err) {
    throw createError(400, "Email could not be sent");
  }
};

export { SendEmailUtils };
