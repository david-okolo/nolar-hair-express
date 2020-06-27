import AWS, { SES } from "aws-sdk";

export const getOptions = () => {
    return {SES: new AWS.SES()}
}
