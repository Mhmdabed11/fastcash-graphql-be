const sgMail = require("@sendgrid/mail");
const SENDGRID_API_KEY =
  "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";
sgMail.setApiKey(SENDGRID_API_KEY);

export const sendEmail = ({ to, from, subject, text, html }) => {
  const msg = {
    to,
    from,
    subject,
    text,
    html
  };
  sgMail.send(msg);
};
