//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const _ = require('lodash');

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://todoasad:Asad123@cluster0.crmzgba.mongodb.net/todolistDB", {
  useNewUrlParser: true
});

mongoose.set('strictQuery', true);

const itemSchema = new mongoose.Schema({
  name: String,
});

const Item = new mongoose.model("item", itemSchema);

// const items = ["Buy Food", "Cook Food", "Eat Food"];
// const workItems = [];

const item1 = new Item({
  name: "Buy Milk"
});

const item2 = new Item({
  name: "Dont Buy Milk"
});

const item3 = new Item({
  name: "Kick Chiku Ass"
});

const defaultItem = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemSchema]
};

const List = new mongoose.model("list", listSchema);


app.get("/", function(req, res) {
  Item.find({}, (err, foundItems) => {
    if (foundItems.length === 0) {
      Item.insertMany(defaultItem, function(err) {
        if (err) {
          console.log(err);
        } else res.redirect("/");
      });
    } else {
      res.render("list", {
        listTitle: "Today",
        newListItems: foundItems
      });
    }
  });
});

app.post("/", function(req, res) {

  const itemName = req.body.newItem
  const listName = req.body.customListName

  const item = new Item({
    name: itemName
  });

  if (listName === "Today") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({
      name: listName
    }, (err, foundList) => {
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName)
    })
  }



  // if (req.body.list === "Work") {
  //   workItems.push(item);
  //   res.redirect("/work");
  // } else {
  //   items.push(item);
  //   res.redirect("/");
  //}
});

app.post("/delete", async (req, res) => {

  listName = req.body.listName;
  itemName = req.body.checkbox;

    if (listName === "Today") {
      await Item.deleteOne({
        _id: itemName
      })
      res.redirect("/")
    } else {
  List.findOneAndUpdate({ name: listName }, {$pull: {items: {_id: itemName}}}, async (err, foundList) => {
    res.redirect("/"+listName);
  })
}



})


// app.get("/work", function(req, res) {
//   res.render("list", {
//     listTitle: "Work List",
//     newListItems: workItems
//   });
// });

app.get("/:id", (req, res) => {
  customListName = (req.params.id).toLowerCase();

  List.findOne({ name: customListName}, (err, foundList) => {
    if(foundList) {
      res.render("list", {listTitle: foundList.name, newListItems: foundList.items})
    } else {
      const list = new List({
            name: customListName,
            items: defaultItem
          });
          list.save();
          res.redirect("/" + customListName)
    }
  })

  // List.find({ name: customListName }, (err, foundItems) => {
  //   if (foundItems.length && foundItems[0].name === customListName) {
  //     res.render("list", {
  //       listTitle: foundItems[0].name,
  //       newListItems: foundItems[0].items
  //     });
  //   } else {
  //     const list = new List({
  //       name: customListName,
  //       items: defaultItem
  //     });
  //
  //     list.save();
  //     res.redirect("/" + customListName)
  //   }
  // });
})

app.get("/about", function(req, res) {
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
