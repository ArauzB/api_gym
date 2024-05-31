const nodemailer = require('nodemailer');
require('dotenv').config();
const {EMAIL, PASS} = process.env;

const transporter =  nodemailer.createTransport({
    service: "Gmail",
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: EMAIL,
      pass: PASS,
    },
  });


transporter.verify().then(()=>{
    console.log('ready for send emails')
}).catch((error)=>{
    console.log(error);
});


module.exports = {transporter}