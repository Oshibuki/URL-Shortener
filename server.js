'use strict';

var express = require('express');
var mongoose = require('mongoose');
var Schema = mongoose.Schema,
    autoIncrement = require('mongoose-auto-increment');
var bodyParser = require("body-parser")
var validUrl = require('valid-url');

var cors = require('cors');

var app = express();

// Basic Configuration 
var port = process.env.PORT || 3000;

/** this project needs a db !! **/ 
// mongoose.connect(process.env.MONGOLAB_URI);

app.use(cors());
app.use(bodyParser.urlencoded({extended: false}))

//init db schema
var connection = mongoose.createConnection(process.env.MONGODB);
autoIncrement.initialize(connection);

var urlSchema = new Schema({
  "original_url":String
});

urlSchema.plugin(autoIncrement.plugin, { model: 'Url', field: 'short_url' });
var Url = connection.model('Url', urlSchema);

/** this project needs to parse POST bodies **/
// you should mount the body-parser here

app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function(req, res){
  res.sendFile(process.cwd() + '/views/index.html');
});

  
// your first API endpoint... 
app.post("/api/shorturl/new", function (req, res) {
  let url = req.body.url
  if(validUrl.isUri(url)){
    Url.create({"original_url":url},function(err,result){
      if(err){
        res.json({"error": "No short url found for given input"})
      }else{
        res.json({
          "original_url":result["original_url"],
          "short_url":result["short_url"]
        })
      }
    })
  }else {
    res.json({"error":"invalid URL"})
  }
  
});

app.get("/api/shorturl/:id",function(req,res){
  let id = req.params.id;
  Url.findOne({"short_url":id},function(err,result){
      if(err){
        console.log(err)
      }
      if(result){
        res.redirect(result["original_url"])
      }else{
        res.json({"error": "No short url found for given input"})
      }
  })
})


app.listen(port, function () {
  console.log('Node.js listening ...');
});