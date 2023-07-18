const fs = require('fs');
const { google } = require('googleapis');

// Authenticate and create a service client
const SCOPES = ['https://www.googleapis.com/auth/calendar'];
const TOKEN_PATH = 'token.json';
const CREDENTIALS_PATH = 'credentials.json';

function authorize(callback) {
  const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH));
  const { client_secret, client_id, redirect_uris } = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
    client_id, client_secret, redirect_uris[0]);

  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) return getNewToken(oAuth2Client, callback);
    oAuth2Client.setCredentials(JSON.parse(token));
    callback(oAuth2Client);
  });
}

function getNewToken(oAuth2Client, callback) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  console.log('Authorize this app by visiting this url:', authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question('Enter the code from that page here: ', (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error('Error retrieving access token', err);
      oAuth2Client.setCredentials(token);
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) return console.error(err);
        console.log('Token stored to', TOKEN_PATH);
      });
      callback(oAuth2Client);
    });
  });
}

function main() {
  
    // Get the date value from the input element
    const startDateInput = document.getElementById('startDate');
    const startDateValue = startDateInput.value;
    const endDateInput = document.getElementById('endDate');
    const endDateValue = endDateInput.value;
  
    // Set the start and end dates of the event
    const startDate = new Date(startDateValue);
    const endDate = new Date(endDateValue);

    const emailInput = document.getElementById('email-input');
    const bodyTextInput = document.getElementById('body-text-input');
    const email = emailInput.value;
    const bodyText = bodyTextInput.value;
  
    // Iterate through email data and send invites
    const event = {
        summary: 'Event Summary',
        description: bodyText,
        start: {
          dateTime: startDate.toISOString(),
          timeZone: 'America/Bogota',
        },
        end: {
          dateTime: endDate.toISOString(),
          timeZone: 'America/Bogota',
        },
        attendees: [
          { email },
        ],
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 82 },
          ],
        },
        sendNotifications: true,
        guestsCanModify: true,
      };
    
      // Authenticate and create a service client
      authorize((auth) => {
        const calendar = google.calendar({ version: 'v3', auth });
  
        // Send the event invite
        calendar.events.insert({
          auth,
          calendarId: 'primary',
          resource: event,
          sendNotifications: true,
        }, (err, res) => {
          if (err) return console.error(`Invite not sent to ${email}. Error: ${err}`);
          console.log(`Invite sent to ${email}`);
        });
      });
    };

  

main();