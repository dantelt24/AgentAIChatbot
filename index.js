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

//global variables
const fbConfirmationQuestion = 'Is there anything else I can help you with regarding your CIG policy(ies)?';

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
            // Create message issue object for chance of issuing customer
            var customerIssueObject = {};
            wit.message(text).then(({entities}) => {
              // You can customize your response to these entities
              //Assign object properties
              console.log(entities);
              var keys = Object.keys(entities), key = keys[0];
              customerIssueObject.id = sender;
              customerIssueObject.text = text;
              customerIssueObject.intents = keys.toString();
              if(keys.length === 1 && key === 'endConvoIntent'){
                //okay to delete the issue
                //Console.log(Able to end the conversation)
                fbMessage(sender, 'Glad we could help you with your questions today. Have a nice day.').catch(console.error);
                polWrapper.setIssueSolved(customerIssueObject, function(err, result){
                  if(err){
                    throw err;
                  }
                  if(result.matchedCount === 1 && result.modifiedCount === 1){
                    console.log('Successful modification of issue for customer');
                  }
                });
              }
              else if(keys.length === 1 && key === 'keepConvoIntent'){
                //keep issue, need to solve customer issue
                fbMessage(sender, 'What else could I help you with today?').catch(console.error);
              }
              else if(entities.hasOwnProperty('message_body')){
                console.log('Intents are not clear enough, need to ask for clarification.');
                fbMessage(sender, 'We couldn\'t quite understand what you asked. Could please repeat the question you need help with.').catch(console.error);
              }
              else if(entities.hasOwnProperty('agentIntent') && entities.hasOwnProperty('autoIntent')){
                console.log('Agent Intent and Auto Intent found');
                if(entities.agentIntent[0].confidence > .75 && entities.autoIntent[0].confidence > .75){
                  polWrapper.setCustomerIssue(customerIssueObject, function(err, result){
                    if(err){
                      throw err;
                    }else{
                      console.log('Set customer issue object');
                    }
                  });
                  console.log('High enough confidence to perform query.');
                  polWrapper.getAutoAgent(function(err, result){
                    if(err){
                      throw err;
                    }else{
                      console.log('getAutoAgent Result is ' + result);
                      fbMessage(sender, result).catch(console.error);
                      fbMessage(sender, fbConfirmationQuestion).catch(console.error);
                    }
                  });
                }
              }
              else if(entities.hasOwnProperty('agentIntent') && entities.hasOwnProperty('homeownersIntent')){
                console.log('Agent Intent and Home Intent found');
                if(entities.agentIntent[0].confidence > .75 && entities.homeownersIntent[0].confidence > .75){
                  console.log('High enough confidence to perform query.');
                  polWrapper.setCustomerIssue(customerIssueObject, function(err, result){
                    if(err){
                      throw err;
                    }else{
                      console.log('Set customer issue object');
                    }
                  });
                  polWrapper.getHomeOwnerAgent(function(err, result){
                    if(err){
                      throw err;
                    }else{
                      console.log('getHomeAgent Result is ' + result);
                      fbMessage(sender, result).catch(console.error);
                      fbMessage(sender, fbConfirmationQuestion).catch(console.error);
                    }
                  });
                }
              }
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
    //addUsertoCollections(senderId);
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
// polWrapper.getTotalPremium();
// polWrapper.getBasicPremium();
// polWrapper.getPolicyDeductible();
// polWrapper.getDwellingLimit();
// polWrapper.getOtherStructuresInfo();
// polWrapper.getPersonalLiabilityInfo();
// polWrapper.getPersonalPropertyInfo();
// polWrapper.getLossOfUseInfo();
// polWrapper.getAutoDrivers();
// polWrapper.getAutoAgent();
