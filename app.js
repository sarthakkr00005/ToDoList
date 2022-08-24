//jshint esversion:6

const express = require("express");
const _ = require("lodash");
const mongoose = require("mongoose");
const date = require(__dirname + "/date.js");

const app = express();

app.set('view engine', 'ejs');

app.use(express.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb-Atlas-Link",{useNewUrlParser: true});

const itemSchema={
  name: String
};

const listSchema={
  name: String,
  items: [itemSchema]
};

const item = mongoose.model("item",itemSchema);
const list = mongoose.model("list",listSchema);

const item1 = new item({
  name: "Welcome to ToDo List"
});

const item2 = new item({
  name: "Hit + to add new task"
});

const item3 = new item({
  name: "<-- check this to delete task"
});

const defaultArray = [item1, item2, item3];

app.get("/", function(req, res) {
  
  const day = date.getDate();
  item.find({},(err,foundItem)=>{
    if (foundItem.length === 0) {
      item.insertMany(defaultArray,(err)=>{
        if(err){
          console.log(err);
        }
        else{
          console.log("Success");
        }
      });
      res.redirect("/");
    }
    else{
      res.render("list", {listTitle: day, newListItems: foundItem});
    }
  });


});

app.post("/", function(req, res){

  const day = date.getDate();
  const nw_task = req.body.newItem;
  const title = req.body.list;
  
  const nw_item = new item({
    name: nw_task
  });

  if (title === day) {
    nw_item.save();
    res.redirect("/");
  } else {
    list.findOne({name: title}, (err, fond)=>{
      fond.items.push(nw_item);
      fond.save();
      res.redirect("/"+title);
    });
  }
});

app.post("/delete",(req, res)=>{
  const day = date.getDate();
  const checked = req.body.checkbox;
  const listName = req.body.listName;

  if(listName === day){
    item.findByIdAndRemove(checked, (err)=>{
      if (err){
        console.log(err);
      }else{
        console.log("Deleted");
      }
    });
    res.redirect("/");
  }else{
    list.findOneAndUpdate({name: listName},{$pull: {items: {_id: checked}}},(err, result)=>{
      if (!err) {
        res.redirect("/"+listName);
      }
    });
  }
});

app.get("/:custom", function(req,res){
  const customName = _.capitalize(req.params.custom);
  list.findOne({name: customName}, (err, fond)=>{
    if(err){
      console.log(err);
    }else{
      if(!fond){
        const nw_list = new list({
          name: customName,
          items: defaultArray
        });
        nw_list.save();
        res.redirect("/"+customName);
      }else{
        res.render("list", {listTitle: fond.name, newListItems: fond.items});
      }
    }
  });
});

app.get("/about", function(req, res){
  res.render("about");
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
app.listen(port, function() {
  console.log("Server started on port 3000");
});
