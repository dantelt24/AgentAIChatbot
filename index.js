//requirements
const express = require('express');
const request = require('request');
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;
const mongoose = require('mongoose');
const Wit = require('node-wit').Wit;
const log = require('node-wit').log;
//---------------------------------------------------------------------------


//environment variables
const uri = process.env.MONGO_DB_URI;
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
app.post("/webhook", function (req, res) {
  // Make sure this is a page subscription
  if (req.body.object == "page") {
    // Iterate over each entry
    // There may be multiple entries if batched
    req.body.entry.forEach(function(entry) {
      // Iterate over each messaging event
      entry.messaging.forEach(function(event) {
        if (event.postback) {
          processPostback(event);
        }
      });
    });

    res.sendStatus(200);
  }
});

function processPostback(event) {
  var senderId = event.sender.id;
  var payload = event.postback.payload;

  if (payload === "Greeting") {
    // Get user's first name from the User Profile API
    // and include it in the greeting
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
      var message = greeting + "My name is AgentAI. I can tell you various details regarding your CIG policy. What can I help you with today?";
      sendMessage(senderId, {text: message});
    });
  }
}

// sends message to user
function sendMessage(recipientId, message) {
  request({
    url: "https://graph.facebook.com/v2.6/me/messages",
    qs: {access_token: process.env.VERIFICATION_TOKEN},
    method: "POST",
    json: {
      recipient: {id: recipientId},
      message: message,
    }
  }, function(error, response, body) {
    if (error) {
      console.log("Error sending message: " + response.error);
    }
  });
}
//Test MongoDBAtlas Connection
MongoClient.connect(uri, function(err, db) {
  if(err){
    throw err;
  }else{
    console.log("Successful database connection");
  }
  db.close();
});
