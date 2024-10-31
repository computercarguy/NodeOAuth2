var nodemailer = require("nodemailer");
const useSecrets = require("./useSecrets");
const logoAttachment = {
    filename: "EricsGearLogo.png",
    path: "staticFiles/EricsGearLogo.png",
    cid: "logo"
};

module.exports = async (email, subject, body, attachments, savelog, cbFunc) => {
    if (body.indexOf('src="cid:logo"') !== -1) {
        if (!attachments) {
            attachments = [];
        }

        attachments.push(logoAttachment);
    }

    const secrets = await useSecrets(savelog);

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

    if (!transporter) {
        savelog(
            "useSendEmail.js",
            "sendMail",
            "set up transporter",
            null,
            "transporter failed to connect"
        );

        if (cbFunc) {
            cbFunc(null, "Something went wrong");
            return;
        }
    }

    let mailOptions = {
        from: secrets.noreplyemail,
        to: email,
        subject: subject,
        html: body,
        attachments: attachments
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            savelog(
                "useSendEmail.js",
                "sendMail",
                "sending mail",
                null,
                response.error
            );
        }

        if (cbFunc) {
            if (error) {
                cbFunc(null, "Something went wrong");
            } else {
                cbFunc(`Email sent to ${email}.`, null);
            }
        }
    });
};
