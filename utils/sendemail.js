const nodemailer = require("nodemailer");
require('dotenv').config();
const sendemail = async (to, message) => {
  try {
    let transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user:process.env.MAIL_USERNAME,
        clientId: process.env.OAUTH_CLIENTID,
        clientSecret: process.env.OAUTH_CLIENT_SECRET,
        refreshToken: process.env.REFRESH_URI // Use correct variable name
      }
    });
    console.log("to:", to);
    console.log("message:", message);
    console.log("MAIL_USERNAME:", process.env.MAIL_USERNAME);
    console.log("OAUTH_CLIENTID:", process.env.OAUTH_CLIENTID);
    let mailOptions = {
      from:process.env.MAIL_USERNAME,
      to: `${to}`,
      subject: 'Nodemailer Project',
      text: `${message}`
    };

    transporter.sendMail(mailOptions, function(err, data) {
      if (err) {
        console.log("Error " + err);
      } else {
        console.log("Email sent successfully");
      }
    });
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

module.exports = sendemail;
