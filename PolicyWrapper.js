//requirements
const MongoClient = require('mongodb').MongoClient;
//-------------------------------------------------

//environment variables
const uri = process.env.MONGO_DB_URI;
//-------------------------------------------------

class PolicyWrapper{
  //constructor
  constructor(){
    this.db_uri = process.env.MONGO_DB_URI;
  }

  //class function
  //function to get user profile information
  this.getUserProfileInformation = function(){
    MongoClient.connect(db_uri, function(err, client){
      if(err){
        throw err;
      }else{
        console.log("Successful database connection");
      }
      var db = client.db('aiTestData');
      db.collection('aiData').find({profile}, function(err, result){
        if(err){
          throw err;
        }else{
          console.log(result);
          client.close();
          return result;
        }
      });
    });
  }
}

module.exports = PolicyWrapper;
