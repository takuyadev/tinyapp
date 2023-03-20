const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

const chars =
  "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890".split("");

const generateRandomString = (arr, length) => {
  const getRandomIndex = (arr) => Math.floor(Math.random() * arr.length);
  let result = [];

  for (let i = 0; i < length; i++) {
    const randomIndex = getRandomIndex(arr);
    result.push(arr[randomIndex]);
  }

  return result.join("");
};

const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

app.use(express.urlencoded({ extended: true }));

app.set("view engine", "ejs");

app.get("/", (req, res) => {
  res.send("Hello!");
});

// app.get("/urls.json", (req, res) => {
//   res.json(urlDatabase);
// });

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
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
