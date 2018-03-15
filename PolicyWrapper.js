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
            var response = 'Thank you for checking in on your profile information.';
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
          console.log(docs)
          console.log(docs.length);
        }
      });
      client.close();
    });
  });
}

module.exports = PolicyWrapper;
