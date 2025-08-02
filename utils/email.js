const nodemailer=require('nodemailer');
const sendEmail=async option=>{
    //1) create a transporter
    const transporter=nodemailer.createTransport({
        host:process.env.EMAIL_HOST,
        port:process.env.EMAIL_PORT,
        auth:{

            user:process.env.EMAIL_USERNAME,
            pass:process.env.EMAIL_PASSWORD
        }
    });
    //2) define the email option

    const mailOption={
        from:'Aditya bhatnagar<aditya@gmail.com>',
        to:option.email,
        subject:option.subject,
        text:option.message
        //html:
    }
    //3)actually send the email

   await transporter.sendMail(mailOption);
}
module.exports=sendEmail;