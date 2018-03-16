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
    var db = client.db('aiTestData');
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
    var db = client.db('aiTestData');
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
    var db = client.db('aiTestData');
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
    var db = client.db('aiTestData');
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
    var db = client.db('aiTestData');
    db.collection('aiData', function(err, collection) {
      collection.find({}).project({'policies': 1}).toArray(function (err, docs){
        if(err){
          throw err;
        }else{
          for(var i  = 0; i < docs.length; i++){
            var docObject = docs[i];
            var specialtyProgramObject = docObject.policies['1-HOC-1-1394462794'].specialtyProgram;
            console.log(specialtyProgramObject);
          }
        }
      });
      client.close();
    });
  });
}

module.exports = PolicyWrapper;
