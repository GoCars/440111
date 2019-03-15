const twilio = require('twilio');

const accountSid = process.env.TWILIO_ACCOUNT_SID; // Your Account SID from www.twilio.com/console
const authToken = process.env.TWILIO_AUTH_TOKEN;   // Your Auth Token from www.twilio.com/console

const client = new twilio(accountSid, authToken);
module.exports = ({to, body, from}) => {
	client.messages.create({
	    body,
	    to,
	    from // From a valid Twilio number
	})
	.then((message) => console.log('sent sms'));
}
