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
          // console.log(JSON.stringify(docs));
          // for(var i = 0; i < docs.length; i++){
          //   var docObject = docs[i];
          //   console.log(docObject);
          //   console.log(docObject.profile);
          //   console.log(docObject._id);
          // }
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
          // console.log(docs.policies);
        }
      });
      client.close();
    });
  });
}

module.exports = PolicyWrapper;

// MongoClient.connect(this.db_uri, function(err, client){
//   if(err){
//     throw err;
//   }else{
//     console.log('Successful database connection');
//   }
// db.collection('users', function(err, collection) {
//   collection.find({}, function(err, cursor) {
//     cursor.each(function(err, item) {
//       console.log(item);
//     });
//
//     // our collection has returned, now we can close the database
//     db.close();
//   });
// });
