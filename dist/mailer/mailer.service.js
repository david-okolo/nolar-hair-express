"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendMail = exports.createMailable = void 0;
const nodemailer_1 = require("nodemailer");
const jsdom_1 = require("jsdom");
const view_service_1 = require("../view/view.service");
const ses_driver_1 = require("./drivers/ses.driver");
exports.createMailable = (data) => {
    return {
        from: process.env.MAIL_USERNAME,
        to: data.to,
        subject: data.subject,
        html: createView(data.viewName, data.input)
    };
};
const createView = (viewName, inputData) => {
    const dom = new jsdom_1.JSDOM(view_service_1.getMailView(viewName));
    Object.entries(inputData).forEach(([key, value]) => {
        dom.window.document.querySelector(`#${key}`).innerHTML = value;
    });
    return dom.serialize();
};
exports.sendMail = async (data) => {
    const mail = exports.createMailable(data);
    const mailResponse = await nodemailer_1.createTransport(ses_driver_1.getOptions()).sendMail(mail).catch(e => {
        console.log(e);
    });
    return mailResponse;
};
//# sourceMappingURL=mailer.service.js.map