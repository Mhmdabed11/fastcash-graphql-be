const MailGen = require("mailgen");
const { sendEmail } = require("./sendEmail");

export const sendVerificationEmail = (to, hash) => {
  const mailGenerator = new MailGen({
    theme: "salted",
    product: {
      name: "Awesome App",
      link: "http://example.com"
      // logo: your app logo url
    }
  });

  const email = {
    body: {
      name: "Jon Doe",
      intro: "Welcome to email verification",
      action: {
        instructions: "Please click the button below to verify your account",
        button: {
          color: "#33b5e5",
          text: "Verify account",
          link: `http://localhost:3000/verify/${to}/${hash}`
        }
      }
    }
  };

  const emailTemplate = mailGenerator.generate(email);

  sendEmail({
    to,
    from: "fastcash@fastcash.com",
    subject: "Activate your account",
    text: "Please Activate your account to start using FastCash",
    html: emailTemplate
  });
};
