const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'fullmovies9205@gmail.com',
      pass: 'yybu djqi koef tynx',
    },
  });

  const mailOptions = {
    from: 'fullmovies9205@gmail.com',
    to: options.to,
    subject: options.subject,
    text: options.text,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
