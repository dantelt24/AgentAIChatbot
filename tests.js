//requirements
const express = require('express');
const request = require('request');
const bodyParser = require('body-parser');
// const MongoClient = require('mongodb').MongoClient;
const mongoose = require('mongoose');
const Wit = require('node-wit').Wit;
const log = require('node-wit').log;
const Fiber = require('fibers');
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
const BotTester = require('messenger-bot-tester');

describe('bot test', function() {
  // webHookURL points to where yout bot is currently listening
  // choose a port for the test framework to listen on
  const testingPort = 3100;
  const webHookURL = 'http://localhost:' + 3000 + '/webhook';
  const tester = new BotTester.default(testingPort, webHookURL);

  before(function(){
    // start your own bot here or having it running already in the background
    // redirect all Facebook Requests to http://localhost:3100/v2.6 and not https://graph.facebook.com/v2.6
    //THIS IS WHERE I AM PUTTING IN THE BOT CODE
    //{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}

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
                wit.message(text).then(({entities}) => {
                  // You can customize your response to these entities
                  //process the entities with wit
                  processEntities(sender, entities, text);
                  // For now, let's reply with another automatic message
                  // fbMessage(sender, `We've received your message: ${text}.`);
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

    //{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}
    return tester.startListening();
  });

  it('hi', function(){
    const theScript = new BotTester.Script('132', '20');
    theScript.sendTextMessage('hi');  //mock user sending "hi"
    theScript.expectTextResponses([   //either response is valid
      'Hey!',
      'Welcome',
    ]);
    return tester.runScript(theScript);
  });
})

//FB Message Typing Action - Using Messenger API
const typingBubble = (id, text) => {
  const body = JSON.stringify({
      recipient: { id },
      "sender_action":"typing_on"
  });

  const qs = 'access_token=' + encodeURIComponent(fb_page_token);
  return fetch('http://localhost:3100/me/messages?' + qs, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body,
  })
  .then(rsp => rsp.json())
  .then(json => {
    if (json.error && json.error.message) {
      throw new Error(json.error.message);
    }
    return json;
  });
};


//FB Messenger Message - Using Messenger API
const fbMessage = (id, text) => {
    const body = JSON.stringify({
      messaging_type: 'RESPONSE',
      recipient: {id},
      message: {text},
    });
    const qs = 'access_token=' + encodeURIComponent(fb_page_token);
    return fetch('http://localhost:3100/v2.6/me/messages?' + qs, {
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



//User functions
//sleep function for setting timeout to send order of fb messages in node js
function sleep(ms) {
    var fiber = Fiber.current;
    setTimeout(function() {
        fiber.run();
    }, ms);
    Fiber.yield();
}

function processPostback(event) {
  var senderId = event.sender.id;
  var payload = event.postback.payload;

  if (payload === "Greeting") {
    // Get user's first name from the User Profile API
    // and include it in the greeting
    //addUsertoCollections(senderId);
    request({
      url: "http://localhost:3100/v2.6" + senderId,
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
      var message = greeting + "My name is AgentAI. I can tell you various details regarding your CIG policies. What questions about your policy can I help you with today?";
      fbMessage(senderId, message).catch(console.error);
    });
  }
}




//{{{{{{{{{{{{{{{{{{{{{{}}}}}}}}}}}}}}}}}}}}}}



function processEntities(sender,entities, text){
  var customerIssueObject = {};
  console.log(entities);
  var keys = Object.keys(entities), key = keys[0];
  customerIssueObject["issues"] = {};
  customerIssueObject.id = sender;
  customerIssueObject.issues.text = text;
  customerIssueObject.issues.intents = keys.toString();
  // customerIssueObject.id = sender;
  // customerIssueObject.text = text;
  // customerIssueObject.intents = keys.toString();
  if(keys.length === 1 && key === 'endConvoIntent'){
    //okay to delete the issue
    fbMessage(sender, 'Glad we could help you with your questions today. Have a nice day.').catch(console.error);
    polWrapper.setIssueSolved(customerIssueObject, function(err, result){
      if(err){
        throw err;
      }
      if(result.matchedCount === 1 && result.modifiedCount === 1){
        console.log('Successful modification of issue for customer, can now delete issue from db as conversation is resolved.');
        polWrapper.deleteIssue(customerIssueObject, function(err, result){
          if(err){
            throw err;
          }
          if(result.deletedCount === 1){
            console.log('Successfully deleted issue');
          }else{
            console.log('Issue wasn\'t deleted successfully');
          }
        });
      }else{
        console.log('Issue not found or updated');
      }
    });
  }
  else if(keys.length === 1 && key === 'keepConvoIntent'){
    //keep issue, need to solve customer issue
    Fiber(function() {
      typingBubble(sender, text).catch(console.error);
      sleep(1000);
      fbMessage(sender, 'What else could I help you with today?').catch(console.error);
    }).run();
  }
  else if(entities.hasOwnProperty('message_body') && keys.length === 1){
    console.log('Intents are not clear enough, need to ask for clarification.');
    Fiber(function() {
      typingBubble(sender, text).catch(console.error);
      sleep(1000);
      fbMessage(sender, 'We couldn\'t quite understand what you asked. Could please rephrase the question you need help with.').catch(console.error);
      sleep(1000);
      // fbMessage(sender, 'This should be sent after the response.').catch(console.error);
    }).run();
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
          Fiber(function() {
            typingBubble(sender, text).catch(console.error);
            sleep(1000);
            fbMessage(sender, result).catch(console.error);
            sleep(1000);
            fbMessage(sender, fbConfirmationQuestion).catch(console.error);
          }).run();
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
          Fiber(function() {
            typingBubble(sender, text).catch(console.error);
            sleep(1000);
            fbMessage(sender, result).catch(console.error);
            sleep(1000);
            fbMessage(sender, fbConfirmationQuestion).catch(console.error);
          }).run();
        }
      });
    }
  }
  else if(entities.hasOwnProperty('policyEndDate') && enitities.hasOwnProperty('autoIntent')){
    console.log('End date and auto intent found');
    if(entities.policyEndDate[0].confidence > .50 && entities.autoIntent[0].confidence > .50){
      console.log('High Enough confidence to perform query');
      polWrapper.setCustomerIssue(customerIssueObject, function(err, result){
        if(err){
          throw err;
        }else{
          console.log('Set customer issue object');
        }
      });
      polWrapper.getExpirationDate(function(err, result){
        if(err){
          throw err;
        }
        Fiber(function() {
          typingBubble(sender, text).catch(console.error);
          sleep(1000);
          fbMessage(sender, result).catch(console.error);
          sleep(1000);
          fbMessage(sender, fbConfirmationQuestion).catch(console.error);
        }).run();
      });
    }
  }
  else if(entities.hasOwnProperty('policyEndDate') && enitities.hasOwnProperty('homeownersIntent')){
    console.log('End date and home intent found');
    if(entities.policyEndDate[0].confidence > .50 && entities.homeownersIntent[0].confidence > .50){
      console.log('High Enough confidence to perform query');
      polWrapper.setCustomerIssue(customerIssueObject, function(err, result){
        if(err){
          throw err;
        }else{
          console.log('Set customer issue object');
        }
      });
      polWrapper.getHomePolicyEndDate(function(err, result){
        if(err){
          throw err;
        }
        Fiber(function() {
          typingBubble(sender, text).catch(console.error);
          sleep(1000);
          fbMessage(sender, result).catch(console.error);
          sleep(1000);
          fbMessage(sender, fbConfirmationQuestion).catch(console.error);
        }).run();
      });
    }
  }
  else if(entities.hasOwnProperty('lossOfUseIntent')){
    console.log('Loss of Use intent found');
    if(entities.lossOfUseIntent[0].confidence > .50){
      console.log('High enough confidence to perform query');
      polWrapper.setCustomerIssue(customerIssueObject, function(err, result){
        if(err){
          throw err;
        }else{
          console.log('Set customer issue object');
        }
      });
      polWrapper.getLossOfUseInfo(function(err, result){
        if(err){
          throw err;
        }
        Fiber(function() {
          typingBubble(sender, text).catch(console.error);
          sleep(1000);
          fbMessage(sender, result).catch(console.error);
          sleep(1000);
          fbMessage(sender, fbConfirmationQuestion).catch(console.error);
        }).run();
      });
    }
  }
  else if(entities.hasOwnProperty('homeMedicalCovIntent')){
    console.log('Home Medical Coverage Intent found');
    if(entities.homeMedicalCovIntent[0].confidence > .50){
      console.log('High enough confidence to perform query');
      polWrapper.setCustomerIssue(customerIssueObject, function(err, result){
        if(err){
          throw err;
        }else{
          console.log('Set customer issue object');
        }
      });
      polWrapper.checkHomeOwnerMedicalCoverage(function(err, result){
        if(err){
          throw err;
        }
        Fiber(function() {
          typingBubble(sender, text).catch(console.error);
          sleep(1000);
          fbMessage(sender, result).catch(console.error);
          sleep(1000);
          fbMessage(sender, fbConfirmationQuestion).catch(console.error);
        }).run();
      });
    }
  }
  else if(entities.hasOwnProperty('dwellingIntent')){
    console.log('Dwelling Intent found');
    if(entities.dwellingIntent[0].confidence > .50){
      console.log('High enough confidence to perform query');
      polWrapper.setCustomerIssue(customerIssueObject, function(err, result){
        if(err){
          throw err;
        }else{
          console.log('Set customer issue object');
        }
      });
      polWrapper.getDwellingLimit(function(err, result){
        if(err){
          throw err;
        }
        Fiber(function() {
          typingBubble(sender, text).catch(console.error);
          sleep(1000);
          fbMessage(sender, result).catch(console.error);
          sleep(1000);
          fbMessage(sender, fbConfirmationQuestion).catch(console.error);
        }).run();
      });
    }
  }
  else if(entities.hasOwnProperty('numCarsIntent')){
    console.log('# of cars Intent found');
    if(entities.numCarsIntent[0].confidence > .50){
      console.log('High enough confidence to perform query');
      polWrapper.setCustomerIssue(customerIssueObject, function(err, result){
        if(err){
          throw err;
        }else{
          console.log('Set customer issue object');
        }
      });
      polWrapper.getNumberOfCars(function(err, result){
        if(err){
          throw err;
        }
        Fiber(function() {
          typingBubble(sender, text).catch(console.error);
          sleep(1000);
          fbMessage(sender, result).catch(console.error);
          sleep(1000);
          fbMessage(sender, fbConfirmationQuestion).catch(console.error);
        }).run();
      });
    }
  }
  else if(entities.hasOwnProperty('autoDiscountIntent')){
    console.log('autoDiscount Intent found');
    if(entities.autoDiscountIntent[0].confidence > .50){
      console.log('High enough confidence to perform query');
      polWrapper.setCustomerIssue(customerIssueObject, function(err, result){
        if(err){
          throw err;
        }else{
          console.log('Set customer issue object');
        }
      });
      polWrapper.getAutoDiscounts(function(err, result){
        if(err){
          throw err;
        }
        Fiber(function() {
          typingBubble(sender, text).catch(console.error);
          sleep(1000);
          fbMessage(sender, result).catch(console.error);
          sleep(1000);
          fbMessage(sender, fbConfirmationQuestion).catch(console.error);
        }).run();
      });
    }
  }
  else if(entities.hasOwnProperty('SpecialtyProgramsIntent')){
    console.log('Specialty Discount Intent found');
    if(entities.SpecialtyProgramsIntent[0].confidence > .50){
      console.log('High enough confidence to perform query');
      polWrapper.setCustomerIssue(customerIssueObject, function(err, result){
        if(err){
          throw err;
        }else{
          console.log('Set customer issue object');
        }
      });
      polWrapper.checkHomeSpecialtyProgram(function(err, result){
        if(err){
          throw err;
        }
        Fiber(function() {
          typingBubble(sender, text).catch(console.error);
          sleep(1000);
          fbMessage(sender, result).catch(console.error);
          sleep(1000);
          fbMessage(sender, fbConfirmationQuestion).catch(console.error);
        }).run();
      });
    }
  }
  else if(entities.hasOwnProperty('personalLiabilityIntent')){
    console.log('Personal liability Intent found');
    if(entities.personalLiabilityIntent[0].confidence > .50){
      console.log('High enough confidence to perform query');
      polWrapper.setCustomerIssue(customerIssueObject, function(err, result){
        if(err){
          throw err;
        }else{
          console.log('Set customer issue object');
        }
      });
      polWrapper.getPersonalLiabilityInfo(function(err, result){
        if(err){
          throw err;
        }
        Fiber(function() {
          typingBubble(sender, text).catch(console.error);
          sleep(1000);
          fbMessage(sender, result).catch(console.error);
          sleep(1000);
          fbMessage(sender, fbConfirmationQuestion).catch(console.error);
        }).run();
      });
    }
  }
  else if(entities.hasOwnProperty('personalPropertyIntent')){
    console.log('Personal Property Intent found');
    if(entities.personalPropertyIntent[0].confidence > .50){
      console.log('High enough confidence to perform query');
      polWrapper.setCustomerIssue(customerIssueObject, function(err, result){
        if(err){
          throw err;
        }else{
          console.log('Set customer issue object');
        }
      });
      polWrapper.getPersonalPropertyInfo(function(err, result){
        if(err){
          throw err;
        }
        Fiber(function() {
          typingBubble(sender, text).catch(console.error);
          sleep(1000);
          fbMessage(sender, result).catch(console.error);
          sleep(1000);
          fbMessage(sender, fbConfirmationQuestion).catch(console.error);
        }).run();
      });
    }
  }
  else if(entities.hasOwnProperty('policyDeductibleIntent')){
    console.log('Policy Deductible Intent found');
    if(entities.policyDeductibleIntent[0].confidence > .50){
      console.log('High enough confidence to perform query');
      polWrapper.setCustomerIssue(customerIssueObject, function(err, result){
        if(err){
          throw err;
        }else{
          console.log('Set customer issue object');
        }
      });
      polWrapper.getHomePolicyDeductible(function(err, result){
        if(err){
          throw err;
        }
        Fiber(function() {
          typingBubble(sender, text).catch(console.error);
          sleep(1000);
          fbMessage(sender, result).catch(console.error);
          sleep(1000);
          fbMessage(sender, fbConfirmationQuestion).catch(console.error);
        }).run();
      });
    }
  }
  else if(entities.hasOwnProperty('driverIntent')){
    console.log('Driver Intent found');
    if(entities.driverIntent[0].confidence > .50){
      console.log('High enough confidence to perform query');
      polWrapper.setCustomerIssue(customerIssueObject, function(err, result){
        if(err){
          throw err;
        }else{
          console.log('Set customer issue object');
        }
      });
      polWrapper.getAutoDrivers(function(err, result){
        if(err){
          throw err;
        }
        Fiber(function() {
          typingBubble(sender, text).catch(console.error);
          sleep(1000);
          fbMessage(sender, result).catch(console.error);
          sleep(1000);
          fbMessage(sender, fbConfirmationQuestion).catch(console.error);
        }).run();
      });
    }
  }
  else if(entities.hasOwnProperty('getCarsIntent')){
    console.log('Get Cars Intent found');
    if(entities.getCarsIntent[0].confidence > .50){
      console.log('High enough confidence to perform query');
      polWrapper.setCustomerIssue(customerIssueObject, function(err, result){
        if(err){
          throw err;
        }else{
          console.log('Set customer issue object');
        }
      });
      polWrapper.getCarsUnderPolicy(function(err, result){
        if(err){
          throw err;
        }
        Fiber(function() {
          typingBubble(sender, text).catch(console.error);
          sleep(1000);
          fbMessage(sender, result).catch(console.error);
          sleep(1000);
          fbMessage(sender, fbConfirmationQuestion).catch(console.error);
        }).run();
      });
    }
  }
}
