const { faker } = require('@faker-js/faker');
const mysql=require("mysql2");
const express=require("express");
const app=express();
const path=require("path");
const methodOverride=require("method-override");
const { v4: uuidv4 } = require("uuid");

app.use(methodOverride("_method"));
app.use(express.urlencoded({extended:true}));
app.set("view engine","ejs");
app.set("views",path.join(__dirname,"/views"));

const connection = mysql.createConnection({
  host: 'host_name',
  user: 'user_name',
  database: 'database_name',
  password: 'database_password'
});

let getRandomUser = () => {
  return [
    faker.string.uuid(),
    faker.internet.username(),
    faker.internet.email(),
    faker.internet.password(),
  ]  
};
//HOME ROUTE
app.get("/",(req,res)=>{
  let q=`select count(*) from user`;
  try{
    connection.query(q,(err,result)=>{
      if(err) throw err; 
      let count=result[0]["count(*)"];
      res.render("home.ejs",{count});
    });
  }
  catch(err){
    console.log(err);
    res.send("some error in Database");
  };
});
//SHOW ROUTE
app.get("/user",(req,res)=>{
  let q=`select * from user`;
  try{
    connection.query(q,(err,result)=>{
      if(err) throw err; 
      let users=result;
      res.render("users.ejs",{users});
    });
  }
  catch(err){
    console.log(err);
    res.send("some error in Database");
  };
});
//EDIT ROUTE
app.get("/user/:id/edit",(req,res)=>{
  let {id}=req.params;
  let q=`select * from user where id="${id}"`;
  try{
    connection.query(q,(err,result)=>{
      if(err) throw err; 
      let user=result[0];
      res.render("edit.ejs",{user});
    });
  }
  catch(err){
    console.log(err);
    res.send("some error in Database");
  };
});
//UPADTE ROUTE
app.patch("/user/:id",(req,res)=>{
  let {id}=req.params;
  let {password:formPass,username:newUsername}=req.body;
  let q=`select * from user where id="${id}"`;
  try{
    connection.query(q,(err,result)=>{
      if(err) throw err; 
      let user=result[0];
      if(formPass!=user.password){
        res.send("WRONG PASSWORD");
      }
      else{
        let q=`update user set username="${newUsername}" where id="${id}"`;
        connection.query(q,(err,result)=>{
          if(err) throw err; 
          res.redirect("/user");
        });
      }
    });
  }
  catch(err){
    console.log(err);
    res.send("some error in Database");
  };
});
//ADD ROUTE
app.get("/user/new", (req, res) => {
  res.render("new.ejs");
});
//UPLOAD ROUTE
app.post("/user/new", (req, res) => {
  let { username, email, password } = req.body;
  let id = uuidv4();
  let q = `INSERT INTO user (id, username, email, password) VALUES ('${id}','${username}','${email}','${password}') `;
  try {
    connection.query(q, (err, result) => {
      if (err) throw err;
      console.log("added new user");
      res.redirect("/user");
    });
  } 
  catch (err) {
    res.send("some error occurred");
  }
});
//DELETE ROUTE
app.get("/user/:id/delete", (req, res) => {
  let { id } = req.params;
  let q = `SELECT * FROM user WHERE id='${id}'`;

  try {
    connection.query(q, (err, result) => {
      if (err) throw err;
      let user = result[0];
      res.render("delete.ejs", { user });
    });
  } catch (err) {
    res.send("some error with DB");
  }
});
//REMOVE ROUTE
app.delete("/user/:id/", (req, res) => {
  let { id } = req.params;
  let { password } = req.body;
  let q = `SELECT * FROM user WHERE id='${id}'`;
  try {
    connection.query(q, (err, result) => {
      if (err) throw err;
      let user = result[0];

      if (user.password != password) {
        res.send("WRONG Password entered!");
      } else {
        let q2 = `DELETE FROM user WHERE id='${id}'`;
        connection.query(q2, (err, result) => {
          if (err) throw err;
          else {
            console.log(result);
            console.log("deleted!");
            res.redirect("/user");
          }
        });
      }
    });
  } catch (err) {
    res.send("some error with DB");
  }
});

app.listen(8080,()=>{
  console.log("server is listening to 8080");
});