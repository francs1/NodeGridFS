var MongoClient = require('mongodb').MongoClient;
var Server = require('mongodb').Server;
var GridStore = require('mongodb').GridStore;
var fs = require('fs');
var mongo = new MongoClient();
var myDB = null;
mongo.connect("mongodb://localhost/myFS", function(err, db) {
              myDB = db;
              console.log("\nFiles Before Put:");
              listGridFSFiles(db, putGridFSFile);
              });
function listGridFSFiles(db, callback){
    GridStore.list(db, function(err, items){
                   console.log(items);
                   callback(db);
                   });
}
function putGridFSFile(db){
    fs.writeFile("nodejs.txt", "Stored from Node.js", function(err) {
                 var myFS = new GridStore(db, "nodejs.txt", "w");
                 myFS.writeFile("nodejs.txt", function(err, fsObj){
                                console.log("\nFiles After Put:");
                                listGridFSFiles(db, getGridFSFile);
                                });
                 });
}
function getGridFSFile(db){
    GridStore.read(db, "nodejs.txt", function(err, data){
                   console.log("\nContents of Retrieve File:");
                   console.log(data.toString());
                   deleteGridFSFile(db, closeDB);
                   });
}
function deleteGridFSFile(db){
    GridStore.unlink(db, "nodejs.txt", function(err, gridStore){
                     console.log("\nFiles After Delete:");
                     listGridFSFiles(db, closeDB);
                     });
}
function closeDB(db){
    db.close();
}
