//requirements
const express = require('express');
const request = require('request');
const bodyParser = require('body-parser');
// const MongoClient = require('mongodb').MongoClient;
const mongoose = require('mongoose');
const Wit = require('node-wit').Wit;
const log = require('node-wit').log;
const policyWrapper = require('./PolicyWrapper.js');
const polWrapper = new policyWrapper(process.env.MONGO_DB_URI);
// const polWrapper = new policyWrapper();
//---------------------------------------------------------------------------


//environment variables
// const uri = process.env.MONGO_DB_URI;
const wit_token = process.env.WIT_TOKEN;
const fb_ver_token = process.env.VERIFICATION_TOKEN;
const fb_page_token = process.env.FB_PAGE_TOKEN;
//---------------------------------------------------------------------------

//setting up wit bot
const wit = new Wit ({
  accessToken: wit_token,
  logger: new log.Logger(log.DEBUG)
});
//--------------------------------------------------------------------------


//setting up user sessions to create sessions and use fb id to uniquely identify them
//sessionID -> {fbid: facebookUserID, context: sessionState}
const sessions = {};

const findOrCreateSession = (fbid) => {
  let sessionID;
  Object.keys(sessions).forEach(k => {
    if(sessions[k].fbid === fbid){
      sessionID = k;
    }
  });
  if(!sessionID){
    sessionID = new Date().toISOString();
    sessions[sessionID] = {fbid: fbid, context: {}};
  }
  return sessionID;
};
//-------------------------------------------------------------------------

//FB Messenger Message - Using Messenger API
const fbMessage = (id, text) => {
    const body = JSON.stringify({
      messaging_type: 'RESPONSE',
      recipient: {id},
      message: {text},
    });
    const qs = 'access_token=' + encodeURIComponent(fb_page_token);
    return fetch('https://graph.facebook.com/v2.6/me/messages?' + qs, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body,
    })
    .then(rsp => rsp.json())
    .then(json=> {
      if(json.error && json.error.message){
        throw new Error(json.error.message);
      }
      return json;
    });
};
//-------------------------------------------------------------------------


//App Functionality
var app = express();
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.listen((process.env.PORT || 5000));

// Server index page
app.get("/", function (req, res) {
  res.send("Deployed!");
});

// Facebook Webhook
// Used for verification
app.get("/webhook", function (req, res) {
  if (req.query["hub.verify_token"] === fb_ver_token){
    console.log("Verified webhook");
    res.status(200).send(req.query["hub.challenge"]);
  } else {
    console.error("Verification failed. The tokens do not match.");
    res.sendStatus(403);
  }
});

// All callbacks for Messenger will be POST-ed here
app.post('/webhook', (req, res) => {
  // Parse the Messenger payload
  // See the Webhook reference
  const data = req.body;

  if (data.object === 'page') {
    data.entry.forEach(entry => {
      entry.messaging.forEach(event => {
        //Check if get started button is pressed for conversation starter
        if (event.postback) {
          processPostback(event);
        }
        //Check for message and process message
        if (event.message && !event.message.is_echo) {
          // We got a message
          // We retrieve the Facebook user ID of the sender
          const sender = event.sender.id;

          // We could retrieve the user's current session, or create one if it doesn't exist
          // This is useful if we want our bot to figure out the conversation history
          // const sessionId = findOrCreateSession(sender);
          //Use this sessionId as a key for a coversation id/key in mongodb to track user conversations
          const sessionId = findOrCreateSession(sender);

          // We retrieve the message content
          const {text, attachments} = event.message;

          if (attachments) {
            // We received an attachment
            // Let's reply with an automatic message
            fbMessage(sender, 'Sorry I can only process text messages for now.')
            .catch(console.error);
          } else if (text) {
            // We received a text message
            // Let's run /message on the text to extract some entities
            wit.message(text).then(({entities}) => {
              // You can customize your response to these entities
              console.log(entities);
              // For now, let's reply with another automatic message
              fbMessage(sender, `We've received your message: ${text}.`);
            })
            .catch((err) => {
              console.error('Oops! Got an error from Wit: ', err.stack || err);
            })
          }
        } else {
          console.log('received event', JSON.stringify(event));
        }
      });
    });
  }
  res.sendStatus(200);
});
//-----------------------------------------------------------------------

//User functions
function processPostback(event) {
  var senderId = event.sender.id;
  var payload = event.postback.payload;

  if (payload === "Greeting") {
    // Get user's first name from the User Profile API
    // and include it in the greeting
    addUsertoCollections(senderId);
    request({
      url: "https://graph.facebook.com/v2.6/" + senderId,
      qs: {
        access_token: process.env.VERIFICATION_TOKEN,
        fields: "first_name"
      },
      method: "GET"
    }, function(error, response, body) {
      var greeting = "";
      if (error) {
        console.log("Error getting user's name: " +  error);
      } else {
        var bodyObj = JSON.parse(body);
        name = bodyObj.first_name;
        greeting = "Hi " + name + ". ";
      }
      var message = greeting + "My name is AgentAI. I can tell you various details regarding your CIG policies. What policy can I help you with today?";
      fbMessage(senderId, message).catch(console.error);
    });
  }
}
//test wrapper compatibility
// polWrapper.getUserProfileInformation();
// polWrapper.getHomeOwnerAgent();
// polWrapper.getPolicyEndDate();
// polWrapper.getPolicyNameInsured();
// polWrapper.checkOptionalCoverages();
// polWrapper.checkSpecialtyProgram();
// polWrapper.checkHomeOwnerMedicalCoverage();
polWrapper.getTotalPremium();
