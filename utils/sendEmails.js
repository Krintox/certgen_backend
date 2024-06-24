const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'techsupport@yogasanabharat.com',
      pass: 'bhwe wvtd jrxm ijrx',
    },
  });

  const mailOptions = {
    from: 'techsupport@yogasanabharat.com',
    to: options.to,
    subject: options.subject,
    text: options.text,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
