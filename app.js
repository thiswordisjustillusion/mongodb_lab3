
const express = require("express");
const MongoClient = require("mongodb").MongoClient;
const objectId = require("mongodb").ObjectID;
   
const app = express();
const jsonParser = express.json();
 
const mongoClient = new MongoClient("mongodb://localhost:27017/", { useNewUrlParser: true });
 
let dbClient;
 
app.use(express.static(__dirname + "/public"));
 
mongoClient.connect(function(err, client){
    if(err) return console.log(err);
    dbClient = client;
    app.locals.collection = client.db("moviesdb").collection("movies");
    app.listen(3000, function(){
        console.log("Сервер ожидает подключения...");
    });
});
 
app.get("/movies", function(req, res){
        
    const collection = req.app.locals.collection;
    collection.find({}).toArray(function(err, movies){
         
        if(err) return console.log(err);
        res.send(movies)
    });
     
});
app.get("/movies/:id", function(req, res){
        
    const id = new objectId(req.params.id);
    const collection = req.app.locals.collection;
    collection.findOne({_id: id}, function(err, movie){
               
        if(err) return console.log(err);
        res.send(movie);
    });
});
   
app.post("/movies", jsonParser, function (req, res) {
       
    if(!req.body) return res.sendStatus(400);
       
    const movieName = req.body.name;
    const movieAge = req.body.age;
    const movie = {name: movieName, age: movieAge};
       
    const collection = req.app.locals.collection;
    collection.insertOne(movie, function(err, result){
               
        if(err) return console.log(err);
        res.send(movie);
    });
});
    
app.delete("/movies/:id", function(req, res){
        
    const id = new objectId(req.params.id);
    const collection = req.app.locals.collection;
    collection.findOneAndDelete({_id: id}, function(err, result){
               
        if(err) return console.log(err);    
        let movie = result.value;
        res.send(movie);
    });
});
   
app.put("/movies", jsonParser, function(req, res){
        
    if(!req.body) return res.sendStatus(400);
    const id = new objectId(req.body.id);
    const movieName = req.body.name;
    const movieAge = req.body.age;
       
    const collection = req.app.locals.collection;
    collection.findOneAndUpdate({_id: id}, { $set: {age: movieAge, name: movieName}},
         {returnOriginal: false },function(err, result){
               
        if(err) return console.log(err);     
        const movie = result.value;
        res.send(movie);
    });
});
 
// прослушиваем прерывание работы программы (ctrl-c)
process.on("SIGINT", () => {
    dbClient.close();
    process.exit();
});