const express = require("express");
const app = express();
const PORT = 8080;

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

function generateShortUrl() {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;

  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return result;
}

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};



app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

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
  const id = req.params.id;
  const templateVars = { id: id, longURL: urlDatabase[id] };
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  // generate short url and assign to short url variable
  console.log(generateShortUrl()); // grab 6 character string
  const shortUrl = generateShortUrl();
  const longVer = req.body;
  // assign long url and connect to short url
  // add url to urldatabase
  urlDatabase[shortUrl] = longVer.longURL;
  res.redirect(`/urls/${shortUrl}`);
});

app.post('/urls/:id/delete', (req, res) => {
  const id = req.params.id
  delete urlDatabase[id]
  res.redirect('/urls')
})

app.post('/urls/:id/edit', (req, res) => {
  const id = req.params.id
  res.redirect(`/urls/${id}`)
})

app.post('/urls/:id', (req,res) => {
  const id = req.params.id
  const newURL = req.body.longURL
  urlDatabase[id] = newURL
  res.redirect('/urls')
})

app.post('/login', (req,res) => {
  const username = req.body.login
  res.cookie('username', username)
  res.redirect('/urls')
})
 
app.get("/u/:id", (req, res) => {
  let id = req.params.id
  const longURL = urlDatabase[id]
  res.redirect(longURL);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});