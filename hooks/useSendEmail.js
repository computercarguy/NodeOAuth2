var nodemailer = require('nodemailer');
const logoAttachment = {
    filename: 'EricsGearLogo.png',
    path: 'staticFiles/EricsGearLogo.png',
    cid: 'logo'
};

module.exports = (email, subject, body, attachments, cbFunc) => {
    if (body.indexOf('src="cid:logo"') !== -1) {
        if (!attachments) {
            attachments = [];
        }

        attachments.push(logoAttachment);
    }

    let transporter = nodemailer.createTransport({
        host: "smtppro.zoho.com",  
        secure: true,
        secureConnection: true,
        requireTLS: false,
        port: 465,
        debug: false,
        auth: {
            user: 'no-reply@ericsgear.com',
            pass: 'nT#gzvr9'
        }
    });

    let mailOptions = {
        from: 'no-reply@ericsgear.com',
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
