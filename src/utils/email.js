import nodemailer from "nodemailer";
import { createError } from "./error.js";

const sendEmail = async (email, subject, text, id, token) => {
  try {
    const transporter = nodemailer.createTransport({
      port: 587,
      host: process.env.EMAIL_HOST,
      secure: false,

      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: subject,
      html: `<p>Please reset your password with the link below \n 
           <b>please note that this link will expire in 10 minutes</b></p>
           </br>
           <a href="http://localhost:3000/resetPassword/${id}/${token}">${text}</a>`,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    createError("Error sending email", 500);
  }
};

export default sendEmail;
