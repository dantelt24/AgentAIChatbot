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

PolicyWrapper.prototype.getUserProfileInformation = function(){
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
            return response;
          }
        }
      });
      client.close();
    });
  });
}

PolicyWrapper.prototype.getHomeOwnerAgent = function(){
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
          // console.log(docs)
          // console.log(docs.length);
          var agentObject = {};
          for(var i  = 0; i < docs.length; i++){
            var docObject = docs[i];
            // console.log(docObject);
            // console.log(docObject.policies);
            // 1-HOC-1-1394462794
            // console.log(docObject.policies.HOC-1-1-1394462794);
            agentObject = docObject.policies['1-HOC-1-1394462794'].agent;
            // console.log(agentObject);
            var response = 'The agent that covers your policy is ' + agentObject.name + '.';
            response += ' They can be reached at ' + agentObject.phone + ' .';
            console.log(response);
            return response;
          }
        }
      });
      client.close();
    });
  });
}

PolicyWrapper.prototype.getPolicyEndDate = function() {
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
            return response;
          }
        }
      });
      client.close();
    });
  });
}

PolicyWrapper.prototype.getPolicyNameInsured = function() {
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
            return response;
          }
        }
      });
      client.close();
    });
  });
}

PolicyWrapper.prototype.checkOptionalCoverages = function() {
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
              return response;
            }else{
              var response = 'There are optional coverages under this policy.';
              console.log(response);
              return response;
            }
          }
        }
      });
      client.close();
    });
  });
}

PolicyWrapper.prototype.checkSpecialtyProgram = function() {
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
              return response;
            }else{
              var response = 'We have you under our ' + specialtyProgramObject.programName;
              response += '. The premium under that plan is ' + specialtyProgramObject.premium;
              console.log(response);
              return response;
            }
          }
        }
      });
      client.close();
    });
  });
}

PolicyWrapper.prototype.checkHomeOwnerMedicalCoverage = function() {
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
              return response;
            }else{
              var response = 'This policy does have medical coverage with it. The limit that the medical payment will cover is ' + medicalPaymentsObject.limit + '.';
              console.log(response);
              return response;
            }
          }
        }
      });
      client.close();
    });
  });
}

//Deductible function
PolicyWrapper.prototype.getPolicyDeductible = function(){
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
            return response;
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
PolicyWrapper.prototype.getTotalPremium = function(){
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
            return response;
          }
        }
      });
      client.close();
    });
  });
}
//basic premium
PolicyWrapper.prototype.getBasicPremium = function(){
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
            return response;
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
PolicyWrapper.prototype.getDwellingLimit = function(){
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
            return response;
          }
        }
      });
      client.close();
    });
  });
}
//get otherPropertyInformation
PolicyWrapper.prototype.getOtherStructuresInfo = function(){
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
            return response;
          }
        }
      });
      client.close();
    });
  });
}
//get personalPropInfo
PolicyWrapper.prototype.getPersonalPropertyInfo = function(){
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
            return response;
          }
        }
      });
      client.close();
    });
  });
}
//get lossOfUse Info
PolicyWrapper.prototype.getLossOfUseInfo = function(){
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
            var response = 'The loss of use on this policy amounts to ' + lossOfUseObject.limit + '.';
            console.log(response);
            return response;
          }
        }
      });
      client.close();
    });
  });
}
//get personalLiability Info
PolicyWrapper.prototype.getPersonalLiabilityInfo = function(){
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
            return response;
          }
        }
      });
      client.close();
    });
  });
}
//------------------------------------------------------------------------------
//autodriver test
PolicyWrapper.prototype.getAutoDrivers = function() {
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
  return response;
  }
  }
  });
  client.close();
  });
  });
}

module.exports = PolicyWrapper;
