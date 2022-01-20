import twilio from "twilio";
import { createRequire } from "module";
const require = createRequire(import.meta.url); // construct the require method
const tkp = require("../etc/twiliojp.json")
const accountSid = tkp.sid;
const authToken = tkp.authToken;


export const clearLastLine = () => {
    process.stdout.moveCursor(0, -1) // up one line
    process.stdout.clearLine(1) // from cursor to end
}


export function sendText(body){
    const client = new twilio(accountSid, authToken);
    client.messages
        .create({
            body: body,
            messagingServiceSid: 'MGe3797d9c84c3016e9f0fd4f7d5949b15',
            to: '+17039801908'
        })
        .then(message => console.log(message.sid))
        .done();
}
