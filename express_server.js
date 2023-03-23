const cookieParser = require('cookie-parser');
const express = require("express");
const app = express();
const PORT = 8080;

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

function generateShortUrl() {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;

  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return result;
}

const findUserByEmail = (email) => {
  for (let userId in users) {
    if (email === users[userId].email) {
      return users[userId];
    }
  }
  return null;
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};


app.get("/", (req, res) => {
  res.send("Hello!"); //eventually this needs to change
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase, username: req.cookies.user_id };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = { username: req.cookies.user_id };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const id = req.params.id;
  const templateVars = { id: id, longURL: urlDatabase[id], username: req.cookies.user_id };
  res.render("urls_show", templateVars);
});

app.get("/register", (req, res) => {
  const templateVars = { username: req.cookies.user_id };
  res.render('register', templateVars);
});

app.get("/login", (req, res) => {
  const templateVars = { username: req.cookies.user_id, password: req.cookies.password}
  res.render("login", templateVars)
})

app.post("/register", (req, res) => {
  let email = req.body.email;
  let password = req.body.password;

  if (email === "" || password === "") {
    return res.status(400).send(`You need to input an email and password!`);
  }

  const user = findUserByEmail(email);

  if (user) {
    return res.status(400).send('Sorry, that user already exists!');
  }

  const newId = generateShortUrl();

  users[newId] = {
    id: newId,
    email: email,
    password: password
  };

  res.cookie("user_id", newId);
  res.redirect('/urls');
});

app.post("/urls", (req, res) => {
  const shortUrl = generateShortUrl();
  // assign long url and connect to short url
  // add url to urldatabase
  urlDatabase[shortUrl] = req.body.longURL;
  res.redirect(`/urls/${shortUrl}`);
});

app.post('/urls/:id/delete', (req, res) => {
  const id = req.params.id;
  delete urlDatabase[id];
  res.redirect('/urls');
});

app.post('/urls/:id/edit', (req, res) => {
  const id = req.params.id;
  const newURL = req.body.longURL;
  urlDatabase[id] = newURL;
  res.redirect('/urls');
});

app.post('/login', (req, res) => {
  let email = req.body.email
  let password = req.body.password

  const user = findUserByEmail(email)

  if (user && user.email === email) {
    if (password === user.password){
      res.cookie("user_id", user.id)
    } else {
      return res.status(403).send("password does not match")
    }
  } else {
    return res.status(403).send("user does not exist")
  }

  res.redirect('/urls');
});

app.post('/logout', (req, res) => {
  res.clearCookie(`user_id`);
  res.redirect('/login');
});

app.get("/u/:id", (req, res) => {
  let id = req.params.id;
  const longURL = urlDatabase[id];
  res.redirect(longURL);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});