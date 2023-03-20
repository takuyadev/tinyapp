const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

// Constants
const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

const chars =
  "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890".split("");

// Generates random number based on range
const getRandomNumber = (range) => Math.floor(Math.random() * range);

// Generates random string, dependent on getRandomNumber
const generateRandomString = (arr, length) => {
  return new Array(length).fill(0).reduce((acc) => {
    const randomIndex = getRandomNumber(arr.length);
    return (acc += arr[randomIndex]);
  }, "");
};

app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");

// @route /urls
// @desc Allow users to shorten their long URLs into shortened links

app.get("/", (req, res) => {
  res.send("<html>Go to <a href='urls'>/urls</a></html>\n");
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:id", (req, res) => {
  const templateVars = {
    longURL: urlDatabase[req.params.id],
    id: req.params.id,
  };
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
  const randomString = generateRandomString(chars, 6);
  urlDatabase[randomString] = req.body.longURL;
  console.log(urlDatabase);
  res.send("Ok"); // Respond with 'Ok' (we will replace this)
});

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
