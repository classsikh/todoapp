import express from "express";
import bodyparser from "body-parser";
import mongoose from "mongoose";
import _ from "lodash";
import "dotenv/config"

const port = process.env.PORT || 3000;

const pass = process.env.pass;

const date = new Date();

  let day = date.getDate();
  let month = date.getMonth() + 1;
  let year = date.getFullYear();

  // This arrangement can be altered based on how we want the date's format to appear.
  let currentDate = `${day}-${month}-${year}`;

const app = express();


app.use(bodyparser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect(`mongodb+srv://pc2june:${pass}@cluster0.e2bhz6q.mongodb.net/todolistDB`);

const itemsSchema = {
  name: { type: String, required: true },
};

const Item = mongoose.model("Item", itemsSchema);

const listSchema = {
  name: String,
  items: [itemsSchema],
};

const List = mongoose.model("List", listSchema);

const item1 = new Item({
  name: "Welcome to your todolist!",
});

const item2 = new Item({
  name: "Hit the + button to add a new item.",
});

const item3 = new Item({
  name: "<-- Hit this to delete an item.>",
});

const defaultItems = [item1, item2, item3];

app.get("/", (req, res) => {
  res.render("index.ejs");
});

app.get("/today", (req, res) => {
  const date = new Date();

  let day = date.getDate();
  let month = date.getMonth() + 1;
  let year = date.getFullYear();

  // This arrangement can be altered based on how we want the date's format to appear.
  let currentDate = `${day}-${month}-${year}`;

  Item.find({}).then(function (findItem) {
    if (findItem.length === 0) {
      // insert the items to DB

      Item.insertMany(defaultItems)
        .then(function () {
          console.log("Successfully saved items to DB");
          res.redirect("/today");
        })
        .catch(function (err) {
          console.log(err);
        });
    } else {
      res.render("today.ejs", { newListItems: findItem, title: currentDate });
    }
  });
});

app.get("/:customListName", (req, res) => {
  const name = req.params.customListName;
  const customListName = _.capitalize(name);
  List.findOne({ name: customListName })
    .then(function (foundList) {
      if (foundList === null) {
        console.log("do not exist!! Making a one for that.");

        const list = new List({
          name: customListName,
          items: defaultItems,
        });

        list.save();
        res.redirect("/" + customListName);
      } else {
        res.render("today.ejs", {
          newListItems: foundList.items,
          title: foundList.name,
        });
      }
    })
    .catch(function (err) {
      console.log(err);
    });
});

app.post("/delete", (req, res) => {
  const listName = req.body.listName;
  const checkedItemID = req.body.todocheck;
  
  if (listName === currentDate){
    Item.findByIdAndRemove({ _id: checkedItemID })
    .then(function () {
      console.log(" deleted"); // Success
    })
    .catch(function (error) {
      console.log(error); // Failure
    });
  res.redirect("/today");
  }
  
  else{
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id : checkedItemID}}})
    .then(function (foundList) {
      console.log(" deleted"); // Success
      res.redirect("/" + listName);
    })
    .catch(function (error) {
      console.log(error); // Failure
    });
  }
});


app.post("/add", (req, res) => {
  
  //console.log(defaultItems.name)
const listName = req.body.titleName;
const newItem = req.body.task;

const newTodo = new Item({
    name: newItem,
  });

  if (listName === currentDate){
    newTodo.save()
              .then(function () {
                console.log("Successfully saved items to DB");
              })
              .catch(function (err) {
                console.log(err);
              });
  res.redirect("/today");
  }

  else{
    List.findOne({ name: listName })
    .then(function (foundList) {
      foundList.items.push(newTodo);
      foundList.save();
      res.redirect("/" + listName);
    })
    .catch(function (err) {
      console.log(err);
    });
  }
  
});

app.listen(port, () => {
  console.log(`Server is running on ${port}.`);
});

