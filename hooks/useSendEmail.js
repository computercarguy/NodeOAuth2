var nodemailer = require('nodemailer');
const useAwsSecrets = require('./useAwsSecrets');
const logoAttachment = {
    filename: 'EricsGearLogo.png',
    path: 'staticFiles/EricsGearLogo.png',
    cid: 'logo'
};

module.exports = async (email, subject, body, attachments, cbFunc) => {
    if (body.indexOf('src="cid:logo"') !== -1) {
        if (!attachments) {
            attachments = [];
        }

        attachments.push(logoAttachment);
    }

    const secrets = await useAwsSecrets();

    let transporter = nodemailer.createTransport({
        host: "smtppro.zoho.com",  
        secure: true,
        secureConnection: true,
        requireTLS: false,
        port: 465,
        debug: false,
        auth: {
            user: secrets.noreplyemail,
            pass: secrets.password
        }
    });

    let mailOptions = {
        from: secrets.noreplyemail,
        to: email,
        subject: subject,
        html: body,
        attachments: attachments
    };
      
    transporter.sendMail(mailOptions, function(error, info){
        if (cbFunc) {
            if (error) {
                cbFunc(null, "Something went wrong");
            } else {
                cbFunc(`Email sent to ${email}.`, null);
            }
        }
    });
}
