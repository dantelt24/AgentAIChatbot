//requirements
const MongoClient = require('mongodb').MongoClient;
//-------------------------------------------------

//environment variables
const uri = process.env.MONGO_DB_URI;
//-------------------------------------------------

//variables
const db_name = 'aiTestData';
//-------------------------------------------------

function PolicyWrapper(uri){
  this.db_uri = uri;
}

PolicyWrapper.prototype.getUserProfileInformation = function(callback){
  MongoClient.connect(this.db_uri, function(err, client){
    if(err){
      throw err;
    }else{
      console.log('Successful database connection');
    }

    var db = client.db(db_name);
    db.collection('aiData', function (err, collection){
      collection.find({}).project({'profile': 1}).toArray(function(err, docs){
        if(err){
          throw err;
        }else{
          console.log(docs);
          console.log(docs.length);
          for(var i = 0; i < docs.length; i++){
            var docObject = docs[i];
            var response = 'Thank you for checking in on your profile information. ';
            response += 'The name we have for your profile is ' + docObject.profile.firstName + ' ' + docObject.profile.lastName;
            response += ', and the email address on file is ' + docObject.profile.emailAddress;
            console.log(response);
            // return response;
            callback(null, response);
          }
        }
      });
      client.close();
    });
  });
}

PolicyWrapper.prototype.getHomeOwnerAgent = function(callback){
  MongoClient.connect(this.db_uri, function(err, client){
    if(err){
      throw err;
    }else{
      console.log('Successful database connection')
    }
    var db = client.db(db_name);
    db.collection('aiData', function(err, collection) {
      collection.find({}).project({'policies': 1}).toArray(function (err, docs){
        if(err){
          throw err;
        }else{
          var agentObject = {};
          for(var i  = 0; i < docs.length; i++){
            var docObject = docs[i];
            agentObject = docObject.policies['1-HOC-1-1394462794'].agent;
            var response = 'The agent that covers your policy is ' + agentObject.name + '.';
            response += ' They can be reached at ' + agentObject.phone + ' .';
            console.log(response);
            callback(null, response);
            // return response;
          }
        }
      });
      client.close();
    });
  });
}

PolicyWrapper.prototype.getHomePolicyEndDate = function(callback) {
  MongoClient.connect(this.db_uri, function(err, client){
    if(err){
      throw err;
    }else{
      console.log('Successful database connection')
    }
    var db = client.db(db_name);
    db.collection('aiData', function(err, collection) {
      collection.find({}).project({'policies': 1}).toArray(function (err, docs){
        if(err){
          throw err;
        }else{
          for(var i  = 0; i < docs.length; i++){
            var docObject = docs[i];
            var expDate = docObject.policies['1-HOC-1-1394462794'].expirationDate;
            var response = 'The end date for your policy is ' + expDate;
            console.log(response);
            // return response;
            callback(null, response);
          }
        }
      });
      client.close();
    });
  });
}

PolicyWrapper.prototype.getHomePolicyNameInsured = function(callback) {
  MongoClient.connect(this.db_uri, function(err, client){
    if(err){
      throw err;
    }else{
      console.log('Successful database connection')
    }
    var db = client.db(db_name);
    db.collection('aiData', function(err, collection) {
      collection.find({}).project({'policies': 1}).toArray(function (err, docs){
        if(err){
          throw err;
        }else{
          for(var i  = 0; i < docs.length; i++){
            var docObject = docs[i];
            var insuredName = docObject.policies['1-HOC-1-1394462794'].namedInsured;
            var response = 'The name of the person on the policy is ' + insuredName +'.';
            console.log(response);
            // return response;
            callback(null, response);
          }
        }
      });
      client.close();
    });
  });
}

PolicyWrapper.prototype.checkHomeOptionalCoverages = function(callback) {
  MongoClient.connect(this.db_uri, function(err, client){
    if(err){
      throw err;
    }else{
      console.log('Successful database connection')
    }
    var db = client.db(db_name);
    db.collection('aiData', function(err, collection) {
      collection.find({}).project({'policies': 1}).toArray(function (err, docs){
        if(err){
          throw err;
        }else{
          for(var i  = 0; i < docs.length; i++){
            var docObject = docs[i];
            var basicCoverageObject = docObject.policies['1-HOC-1-1394462794']['basic coverage'];
            // console.log(basicCoverageObject);
            var optionalCoverages = basicCoverageObject.basicCoverage.optionalCoverages;
            // console.log(optionalCoverages);
            // console.log(optionalCoverages === '$0.00');
            if(optionalCoverages === '$0.00'){
              var response = 'There are no optional coverages under this policy';
              console.log(response);
              // return response;
              callback(null, response);
            }else{
              var response = 'There are optional coverages under this policy.';
              console.log(response);
              // return response;
              callback(null, response);
            }
          }
        }
      });
      client.close();
    });
  });
}

PolicyWrapper.prototype.checkHomeSpecialtyProgram = function(callback) {
  MongoClient.connect(this.db_uri, function(err, client){
    if(err){
      throw err;
    }else{
      console.log('Successful database connection')
    }
    var db = client.db(db_name);
    db.collection('aiData', function(err, collection) {
      collection.find({}).project({'policies': 1}).toArray(function (err, docs){
        if(err){
          throw err;
        }else{
          for(var i  = 0; i < docs.length; i++){
            var docObject = docs[i];
            var specialtyProgramObject = docObject.policies['1-HOC-1-1394462794'].specialtyProgram;
            // console.log(specialtyProgramObject);
            if(specialtyProgramObject.programName === 'Not Applicable'){
              var response = 'Sorry. We have found no specialty programs under this policy. ';
              console.log(response);
              // return response;
              callback(null, response);
            }else{
              var response = 'We have you under our ' + specialtyProgramObject.programName;
              response += '. The premium under that plan is ' + specialtyProgramObject.premium;
              console.log(response);
              // return response;
              callback(null, response);
            }
          }
        }
      });
      client.close();
    });
  });
}

PolicyWrapper.prototype.checkHomeOwnerMedicalCoverage = function(callback) {
  MongoClient.connect(this.db_uri, function(err, client){
    if(err){
      throw err;
    }else{
      console.log('Successful database connection')
    }
    var db = client.db(db_name);
    db.collection('aiData', function(err, collection) {
      collection.find({}).project({'policies': 1}).toArray(function (err, docs){
        if(err){
          throw err;
        }else{
          for(var i  = 0; i < docs.length; i++){
            var docObject = docs[i];
            var medicalPaymentsObject = docObject.policies['1-HOC-1-1394462794']['basic coverage'].basicCoverage.medicalPayments;
            console.log(medicalPaymentsObject);
            if(medicalPaymentsObject.limit === '$0.00'){
              var response = 'Sorry this policy does not seem to have medical coverage. ';
              console.log(response);
              // return response;
              callback(null, response);
            }else{
              var response = 'This policy does have medical coverage. The limit that the medical payment will cover is ' + medicalPaymentsObject.limit + '.';
              console.log(response);
              // return response;
              callback(null, response);
            }
          }
        }
      });
      client.close();
    });
  });
}

//Deductible function
PolicyWrapper.prototype.getHomePolicyDeductible = function(callback){
  MongoClient.connect(this.db_uri, function(err, client){
    if(err){
      throw err;
    }else{
      console.log('Successful database connection');
    }
    var db = client.db(db_name);
    db.collection('aiData', function(err, collection){
      collection.find({}).project({'policies': 1}).toArray(function(err,docs){
        if(err){
          throw err;
        }else{
          for(var i = 0; i < docs.length; i++){
            var docObject = docs[i];
            var policyDeductible = docObject.policies['1-HOC-1-1394462794']['basic coverage'].basicCoverage.policyDeductible;
            var response = 'The deductible for this policy is ' + policyDeductible + '.';
            console.log(response);
            // return response;
            callback(null, response);
          }
        }
      });
      client.close();
    });
  });
}
//------------------------------------------------------------------------------

//Premium functions

//total Premium
PolicyWrapper.prototype.getHomeTotalPremium = function(callback){
  MongoClient.connect(this.db_uri, function(err, client){
    if(err){
      throw err;
    }else{
      console.log('Successful database connection');
    }
    var db = client.db(db_name);
    db.collection('aiData', function(err, collection){
      collection.find({}).project({'policies': 1}).toArray(function(err,docs){
        if(err){
          throw err;
        }else{
          for(var i = 0; i < docs.length; i++){
            var docObject = docs[i];
            var totPremium = docObject.policies['1-HOC-1-1394462794']['basic coverage'].basicCoverage.totalPremium;
            var response = 'The total Premium for this policy is ' + totPremium + '.';
            console.log(response);
            // return response;
            callback(null, response);
          }
        }
      });
      client.close();
    });
  });
}
//basic premium
PolicyWrapper.prototype.getHomeBasicPremium = function(callback){
  MongoClient.connect(this.db_uri, function(err, client){
    if(err){
      throw err;
    }else{
      console.log('Successful database connection');
    }
    var db = client.db(db_name);
    db.collection('aiData', function(err, collection){
      collection.find({}).project({'policies': 1}).toArray(function(err,docs){
        if(err){
          throw err;
        }else{
          for(var i = 0; i < docs.length; i++){
            var docObject = docs[i];
            var basicPremium = docObject.policies['1-HOC-1-1394462794']['basic coverage'].basicCoverage.basicPremium;
            var response = 'The basic Premium for this policy is ' + basicPremium + '.';
            console.log(response);
            // return response;
            callback(null, response);
          }
        }
      });
      client.close();
    });
  });
}
//------------------------------------------------------------------------------

//basicCoverage functions, dwelling/otherStructures/personalProperty/lossOfUse/personalLiability
//get DwellingInformation
PolicyWrapper.prototype.getDwellingLimit = function(callback){
  MongoClient.connect(this.db_uri, function(err, client){
    if(err){
      throw err;
    }else{
      console.log('Successful database connection');
    }
    var db = client.db(db_name);
    db.collection('aiData', function(err, collection){
      collection.find({}).project({'policies': 1}).toArray(function(err,docs){
        if(err){
          throw err;
        }else{
          for(var i = 0; i < docs.length; i++){
            var docObject = docs[i];
            var dwellingObject = docObject.policies['1-HOC-1-1394462794']['basic coverage'].basicCoverage.dwelling;
            var response = 'The value of the dwelling on this policy is ' + dwellingObject.limit + '.';
            console.log(response);
            // return response;
            callback(null, response);
          }
        }
      });
      client.close();
    });
  });
}
//get otherPropertyInformation
PolicyWrapper.prototype.getOtherStructuresInfo = function(callback){
  MongoClient.connect(this.db_uri, function(err, client){
    if(err){
      throw err;
    }else{
      console.log('Successful database connection');
    }
    var db = client.db(db_name);
    db.collection('aiData', function(err, collection){
      collection.find({}).project({'policies': 1}).toArray(function(err,docs){
        if(err){
          throw err;
        }else{
          for(var i = 0; i < docs.length; i++){
            var docObject = docs[i];
            var otherStructuresObject = docObject.policies['1-HOC-1-1394462794']['basic coverage'].basicCoverage.otherStructures;
            var response = 'The value of all the other structures on this policy are valued at ' + otherStructuresObject.limit + '.';
            console.log(response);
            // return response;
            callback(null, response);
          }
        }
      });
      client.close();
    });
  });
}
//get personalPropInfo
PolicyWrapper.prototype.getPersonalPropertyInfo = function(callback){
  MongoClient.connect(this.db_uri, function(err, client){
    if(err){
      throw err;
    }else{
      console.log('Successful database connection');
    }
    var db = client.db(db_name);
    db.collection('aiData', function(err, collection){
      collection.find({}).project({'policies': 1}).toArray(function(err,docs){
        if(err){
          throw err;
        }else{
          for(var i = 0; i < docs.length; i++){
            var docObject = docs[i];
            var personalPropertyObject = docObject.policies['1-HOC-1-1394462794']['basic coverage'].basicCoverage.personalProperty;
            var response = 'The coverage provided by CIG for the personal property on this policy amounts to ' + personalPropertyObject.limit + '.';
            console.log(response);
            // return response;
            callback(null, response);
          }
        }
      });
      client.close();
    });
  });
}
//get lossOfUse Info
PolicyWrapper.prototype.getLossOfUseInfo = function(callback){
  MongoClient.connect(this.db_uri, function(err, client){
    if(err){
      throw err;
    }else{
      console.log('Successful database connection');
    }
    var db = client.db(db_name);
    db.collection('aiData', function(err, collection){
      collection.find({}).project({'policies': 1}).toArray(function(err,docs){
        if(err){
          throw err;
        }else{
          for(var i = 0; i < docs.length; i++){
            var docObject = docs[i];
            var lossOfUseObject = docObject.policies['1-HOC-1-1394462794']['basic coverage'].basicCoverage.lossOfUse;
            // var response = 'The loss of use on this policy amounts to ' + lossOfUseObject.limit + '.';
            // console.log(response);
            // // return response;
            // callback(null, response);
            if(lossOfUseObject.limit === ""){
              var response = 'Sorry you are not covered for loss of use on this policy.';
              console.log(response);
              callback(null, response);
            }else{
              var response = 'You are covered for loss of use on this policy. ';
              response += 'The loss of use on this policy amounts to ' + lossOfUseObject.limit + '.';
              console.log(response);
              // return response;
              callback(null, response);
            }
          }
        }
      });
      client.close();
    });
  });
}
//get personalLiability Info
PolicyWrapper.prototype.getPersonalLiabilityInfo = function(callback){
  MongoClient.connect(this.db_uri, function(err, client){
    if(err){
      throw err;
    }else{
      console.log('Successful database connection');
    }
    var db = client.db(db_name);
    db.collection('aiData', function(err, collection){
      collection.find({}).project({'policies': 1}).toArray(function(err,docs){
        if(err){
          throw err;
        }else{
          for(var i = 0; i < docs.length; i++){
            var docObject = docs[i];
            var personalLiabilityObject = docObject.policies['1-HOC-1-1394462794']['basic coverage'].basicCoverage.personalLiability;
            var response = 'The amount you are covered for in regards to personal liability is ' + personalLiabilityObject.limit + '.';
            console.log(response);
            // return response;
            callback(null, response);
          }
        }
      });
      client.close();
    });
  });
}
//------------------------------------------------------------------------------
//AUTO Intents

//get drivers on policy
PolicyWrapper.prototype.getCarsUnderPolicy = function(callback) {
  MongoClient.connect(this.db_uri, function(err, client){
    if(err){
      throw err;
    }else{
      console.log('Successful database connection')
    }
    var db = client.db(db_name);
    db.collection('aiData', function(err, collection) {
      collection.find({}).project({'policies': 1}).toArray(function (err, docs){
        if(err){
          throw err;
        }else{
          for(var i  = 0; i < docs.length; i++){
            var vehicles = docs[i].policies['1-PAC-1-200711458641'].vehicles;
            var response = '';
            if(vehicles.length > 0){
              response += 'The ' + vehicles[0].year + ' ' + vehicles[0].make + ' ' + vehicles[0].model;
              for(var j = 1; j < vehicles.length; j++) response += ', ' + vehicles[j].year + ' ' + vehicles[j].make + ' ' + vehicles[j].model + ' ';
              response += ' are under this policy';
            }
            else{
              response += 'There are no vehicles under this polcicy';
            }
            response += '.'
            console.log(response);
            callback(null,response);
          }
        }
      });
      client.close();
    });
  });
}

PolicyWrapper.prototype.getAutoDrivers = function(callback) {
  MongoClient.connect(this.db_uri, function(err, client){
    if(err){
      throw err;
    }else{
      console.log('Successful database connection')
  }
  var db = client.db(db_name);
  db.collection('aiData', function(err, collection) {
    collection.find({}).project({'policies': 1}).toArray(function (err, docs){
      if(err){
        throw err;
      }else{
        for(var i = 0; i < docs.length; i++){
          var drivers = docs[i].policies['1-PAC-1-200711458641'].drivers;
          var response = '';
          if(drivers.length > 0){
            response += 'The names of the drivers on this policy are ' + drivers[0].name;
            for(var j = 1; j < drivers.length; j++) response += ', ' + drivers[j].name;
          }
          else{
            response += 'There are no drivers for your policy'
          }
          response += '.'
          console.log(response);
          // return response;
          callback(null, response);
          }
        }
      });
      client.close();
    });
  });
}

//get autoAgent
PolicyWrapper.prototype.getAutoAgent = function(callback){
  MongoClient.connect(this.db_uri, function(err, client){
    if(err){
      throw err;
    }else{
      console.log('Successful database connection')
    }
    var db = client.db(db_name);
    db.collection('aiData', function(err, collection) {
      collection.find({}).project({'policies': 1}).toArray(function (err, docs){
        if(err){
          throw err;
        }else{
          var agentObject = {};
          for(var i  = 0; i < docs.length; i++){
            var docObject = docs[i];
            agentObject = docObject.policies['1-PAC-1-200711458641'].agent;
            var response = 'The agent that covers your policy is ' + agentObject.name + '.';
            response += ' They can be reached at ' + agentObject.phone + ' .';
            console.log(response);
            callback(null, response);
          }
        }
      });
      client.close();
    });
  });
}

//Auto policy Premium function
PolicyWrapper.prototype.getAutoPremium = function(callback) {
  MongoClient.connect(this.db_uri, function(err, client){
    if(err){
      throw err;
    }else{
      console.log('Successful database connection')
    }
    var db = client.db(db_name);
    db.collection('aiData', function(err, collection) {
      collection.find({}).project({'policies': 1}).toArray(function (err, docs){
        if(err){
          throw err;
        }else{
          for(var i  = 0; i < docs.length; i++){
            var premium = docs[i].policies['1-PAC-1-200711458641'].totalTermPremium;
            var response = 'The premium on this policy is ' + premium + '.'
            console.log(response);
            // return response;
            callback(null, response);
          }
        }
      });
      client.close();
    });
  });
}

//get AutoCoverageTypes
PolicyWrapper.prototype.getAutoCoverageTypes = function(callback) {
  MongoClient.connect(this.db_uri, function(err, client){
    if(err){
      throw err;
    }else{
      console.log('Successful database connection')
    }
    var db = client.db(db_name);
    db.collection('aiData', function(err, collection) {
      collection.find({}).project({'policies': 1}).toArray(function (err, docs){
        if(err){
          throw err;
        }else{
          for(var i  = 0; i < docs.length; i++){
            var coverages = docs[i].policies['1-PAC-1-200711458641'].policyGenericCoverages;
            var response = '';
            if(coverages.length > 0){
              response += 'The types of the drivers on this policy are ' + coverages[0].label;
              for(var j = 1; j < coverages.length; j++) response += ', ' + coverages[j].name;
            }
            else{
              response += 'There is no coverage your policy'
            }
            response += '.'
            console.log(response);
            // return response;
            callback(null, response);
          }
        }
      });
      client.close();
    });
  });
}

//autoPolicyDiscounts
PolicyWrapper.prototype.getAutoDiscounts = function(callback) {
  MongoClient.connect(this.db_uri, function(err, client){
    if(err){
      throw err;
    }else{
      console.log('Successful database connection')
    }
    var db = client.db(db_name);
    db.collection('aiData', function(err, collection) {
      collection.find({}).project({'policies': 1}).toArray(function (err, docs){
        if(err){
          throw err;
        }else{
          var response = '';
          for(var i  = 0; i < docs.length; i++){
            var discounts = docs[i].policies['1-PAC-1-200711458641'].policyDiscounts;
            if(discounts == ""){
              response = 'There are no discounts on this policy';
            }
            else{
              response = 'The discount on this policy is $' + discounts;
            }
            response += '.';
            console.log(response);
            // return response;
            callback(null, response);
          }
        }
      });
      client.close();
    });
  });
}

// # Of Cars on my policy
PolicyWrapper.prototype.getNumberOfCars = function(callback) {
  MongoClient.connect(this.db_uri, function(err, client){
    if(err){
      throw err;
    }else{
      console.log('Successful database connection')
    }
    var db = client.db(db_name);
    db.collection('aiData', function(err, collection) {
      collection.find({}).project({'policies': 1}).toArray(function (err, docs){
        if(err){
          throw err;
        }else{
          for(var i  = 0; i < docs.length; i++){
            var num = docs[i].policies['1-PAC-1-200711458641'].vehicles.length;
            var response = 'The are ' + num + ' cars on this policy.'
            console.log(response);
            // return response;
            callback(null, response);
          }
        }
      });
      client.close();
    });
  });
}


//AutoPolicy Expiration date
PolicyWrapper.prototype.getExpirationDate = function(callback) {
  MongoClient.connect(this.db_uri, function(err, client){
    if(err){
      throw err;
    }else{
      console.log('Successful database connection')
    }
    var db = client.db(db_name);
    db.collection('aiData', function(err, collection) {
      collection.find({}).project({'policies': 1}).toArray(function (err, docs){
        if(err){
          throw err;
        }else{
          for(var i  = 0; i < docs.length; i++){
            var expirationDate = docs[i].policies['1-PAC-1-200711458641'].expirationDate;
            var response = 'Your policy is valid until ' + expirationDate + '.'
            console.log(response);
            // return response;
            callback(null, response);
          }
        }
      });
      client.close();
    });
  });
}


//messages Collection functions

//set Issues for conversation flow
// PolicyWrapper.prototype.setCustomerIssue = function(senderInfo, callback){
//   MongoClient.connect(this.db_uri, function(err, client){
//     if(err){
//       throw err;
//     }
//     var db = client.db(db_name);
//     db.collection('messages', function(err, collection){
//       collection.updateOne({id: senderInfo.id},
//         {$set: {id: senderInfo.id, 'issue.text': senderInfo.text, 'issue.context': senderInfo.intents, 'issue.solveFlag': false}},
//         {upsert: true}, function(err, result){
//           if(err){
//             throw err;
//           }else{
//             console.log(result);
//             callback(null, result);
//           }
//         });
//     });
//   });
// }

PolicyWrapper.prototype.setCustomerIssue = function(senderInfo, callback){
  MongoClient.connect(this.db_uri, function(err, client){
    if(err){
      throw(err);
    }
    var db = client.db(db_name);
    db.collection('messages', function(err, collection){
      collection.insertOne({id: senderInfo.id, issue: {text: senderInfo.issues.text, context: senderInfo.issues.intents, solveFlag: false}}, function(err, result){
        if(err){
          throw err;
        }
        console.log(result);
        callback(null, result);
      });
    });
  });
}

PolicyWrapper.prototype.setIssueSolved = function(senderInfo, callback){
  MongoClient.connect(this.db_uri, function(err, client){
    if(err){
      throw err;
    }
    var db = client.db(db_name);
    db.collection('messages', function(err, collection){
      collection.updateOne({id: senderInfo.id},
        {$set: {'issue.solveFlag': true}},
        {upsert: true}, function(err, result){
          if(err){
            throw err;
          }
          console.log('Matched Count: ' + result.matchedCount);
          console.log('Modified Count: ' + result.modifiedCount);
          callback(null, result);
        });
    });
  });
}

module.exports = PolicyWrapper;
