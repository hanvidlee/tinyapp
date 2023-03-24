const cookieParser = require('cookie-parser');
const express = require("express");
const bcrypt = require("bcryptjs");
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
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};

const urlsForUser = (id) => {
  const result = {}
  for(let urlId in urlDatabase) {
    if(urlDatabase[urlId].userID === id){
      result[urlId] = urlDatabase[urlId].longURL 
    }
  }
  return result
} 

// landing page
app.get("/", (req, res) => {
  res.send("Hello!"); //eventually this needs to change
});

// list of urls
app.get("/urls", (req, res) => {
  const cookieUserID = req.cookies["user_id"]
  if(!cookieUserID){
    const errorTemplateVars =  {
      message: "You cannot shorten URLs until you login",
      user: users[cookieUserID]
    }
    return res.status(403).render("error", errorTemplateVars)
  }
  
  const templateVars = { urls: urlsForUser(cookieUserID), user: users[cookieUserID] };
  res.render("urls_index", templateVars);
});

// page to create a new url
app.get("/urls/new", (req, res) => {
  const cookieUserID = req.cookies["user_id"]
  const templateVars = { user: users[cookieUserID] };
  res.render("urls_new", templateVars);
});

// page to edit url
app.get("/urls/:id", (req, res) => {
  const cookieUserID = req.cookies["user_id"]
  const id = req.params.id;
  if (!cookieUserID){
    return res.status(403).send("user is not logged in")
  }
  if (!urlDatabase[id]){
    return res.status(400).send("id does not exist")
  }
  if (cookieUserID !== urlDatabase[id].userID){
    return res.status(403).send("user does not own URL")
  }
  const templateVars = { id: id, longURL: urlDatabase[id].longURL, user: users[cookieUserID] };
  res.render("urls_show", templateVars);
});

// links to corresponding longurl
app.get("/u/:id", (req, res) => {
  let id = req.params.id;
  const longURL = urlDatabase[id].longURL;
  if (!urlDatabase[id]){
    return res.status(403).send("short URL does not exist")
  }
  res.redirect(longURL);
});

// create a new url
app.post("/urls", (req, res) => {
  const cookieUserID = req.cookies["user_id"]
  if(!cookieUserID){
    return res.status(400).send("you cannot shorten URLs until you login")
  }
  const shortUrl = generateShortUrl();
  urlDatabase[shortUrl] = {
    longURL: req.body.longURL,
    userID: cookieUserID
  };
  
  res.redirect(`/urls/${shortUrl}`);
});

// delete url
app.post('/urls/:id/delete', (req, res) => {
  const id = req.params.id;
  const cookieUserID = req.cookies["user_id"]
  if (!cookieUserID){
    return res.status(403).send("user is not logged in")
  }
  if (!urlDatabase[id]){
    return res.status(400).send("id does not exist")
  }
  if (cookieUserID !== urlDatabase[id].userID){
    return res.status(403).send("user does not own URL")
  }
  delete urlDatabase[id];
  res.redirect('/urls');
});

// edit url
app.post('/urls/:id/edit', (req, res) => {
  const id = req.params.id;
  const cookieUserID = req.cookies["user_id"]
  if (!cookieUserID){
    return res.status(403).send("user is not logged in")
  }
  if (!urlDatabase[id]){
    return res.status(400).send("id does not exist")
  }
  if (cookieUserID !== urlDatabase[id].userID){
    return res.status(403).send("user does not own URL")
  }
  const newURL = req.body.longURL;
  urlDatabase[id].longURL = newURL;
  res.redirect('/urls');
});


app.get("/register", (req, res) => {
  const cookieUserID = req.cookies["user_id"]
  const templateVars = { user: users[cookieUserID] };
  
  if(cookieUserID){
    return res.redirect('/urls')
  }
  res.render('register', templateVars);
});

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
    password: bcrypt.hashSync(password, 10)
  };

  res.cookie("user_id", newId);
  res.redirect('/urls');
});

app.get("/login", (req, res) => {
  const cookieUserID = req.cookies["user_id"]
  const templateVars = { user: users[cookieUserID], password: req.cookies.password}
  if(cookieUserID){
    return res.redirect('/urls')
  }

  res.render("login", templateVars)
})

app.post('/login', (req, res) => {
  let email = req.body.email
  let password = req.body.password

  const user = findUserByEmail(email)

  if (user && user.email === email) {
    if (bcrypt.compareSync(password, user.password)){
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

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});