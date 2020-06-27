import { createTransport, Transporter } from 'nodemailer';
import { JSDOM } from 'jsdom';

import { Mailable, MailOptions, MailDriver } from './interface/mailer.interface';
import { getMailView } from '../view/view.service';
import { getOptions } from './drivers/ses.driver';


export const createMailable = (data: any): Mailable => {

    return {
        from: process.env.MAIL_USERNAME,
        to: data.to,
        subject: data.subject,
        html: createView(data.viewName, data.input)
    }
}

const createView = (viewName: string, inputData: any) => {

    const dom = new JSDOM(getMailView(viewName));

    Object.entries(inputData).forEach(([key, value]: [string, string]) => {
        dom.window.document.querySelector(`#${key}`).innerHTML = value;
    });

    return dom.serialize();
}

export const sendMail = async (data: MailOptions) => {
    const mail: Mailable = createMailable(data);
    const mailResponse = await createTransport(getOptions()).sendMail(mail).catch(e => {
        console.log(e);
    })
    return mailResponse;
}
