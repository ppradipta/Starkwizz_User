import axios from 'axios';
// @ts-ignore - require to avoid TS errors in workspace that doesn't include functions types
const functions = require('firebase-functions');

// Define the SMS sending function
const sendSms = async (phoneNumber: string, message: string): Promise<any> => {
  const apiKey = functions.config().trueconnect.api_key;

  const url = 'https://api.trueconnect.jio.com/sendSms'; // Example URL, check documentation
  const payload = {
    to: phoneNumber,
    message: message,
    sender_id: 'your_sender_id', // Replace with your sender ID
    // Any other required params
  };

  const config = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
  };

  try {
    const response = await axios.post(url, payload, config);
    return response.data;
  } catch (error) {
    throw new Error(error.response ? error.response.data : error.message);
  }
};

// Firebase Function to handle the request
export const sendSmsFunction = functions.https.onRequest(async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).send({ error: 'Method Not Allowed' });
  }

  const { phoneNumber, message } = req.body;

  if (!phoneNumber || !message) {
    return res.status(400).send({ error: 'Phone number and message are required' });
  }

  // Append SMS Retriever app hash so Android SMS Retriever can capture it automatically.
  // Configure your app hash using `firebase functions:config:set app.hash="YOUR_APP_HASH"`
  const appHash = functions.config().app && functions.config().app.hash ? functions.config().app.hash : (process.env.APP_HASH || '<APP_HASH_GOES_HERE>');

  // If the message already contains the hash, don't duplicate it.
  let messageToSend = message;
  if (!message.includes(appHash)) {
    // SMS Retriever messages must be in format: "<#> <message>\n<APP_HASH>"
    messageToSend = `<#> ${message}\n${appHash}`;
  }

  try {
    const result = await sendSms(phoneNumber, messageToSend);
    res.status(200).send({ success: 'SMS Sent Successfully', result });
  } catch (error) {
    res.status(500).send({ error: 'Failed to send SMS', details: error.message });
  }
});
