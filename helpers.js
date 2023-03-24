const findUserByEmail = (email, users) => {
  for (let userId in users) {
    if (email === users[userId].email) {
      return users[userId];
    }
  }
  return null;
};

function generateShortUrl() {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;

  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return result;
}

const urlsForUser = (id, urlDatabase) => {
  const result = {};
  for (let urlId in urlDatabase) {
    if (urlDatabase[urlId].userID === id) {
      result[urlId] = urlDatabase[urlId].longURL;
    }
  }
  return result;
};

module.exports = {
  findUserByEmail,
  generateShortUrl,
  urlsForUser
};