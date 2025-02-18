const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Check if a user with the given username already exists
const doesExist = (username) => {
    // Filter the users array for any user with the same username
    let userswithsamename = users.filter((user) => {
        return user.username === username;
    });
    // Return true if any user with the same username is found, otherwise false
    if (userswithsamename.length > 0) {
        return true;
    } else {
        return false;
    }
}

// For debugging!
public_users.get("/users", (req, res) => {
    res.send(users);
});

public_users.post("/register", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;

    // Check if both username and password are provided
    if (username && password) {
        // Check if the user does not already exist
        if (!doesExist(username)) {
            // Add the new user to the users array
            users.push({"username": username, "password": password});
            return res.status(200).json({message: "User successfully registered. Now you can login"});
        } else {
            return res.status(404).json({message: "User already exists!"});
        }
    }

    // Return error if username or password is missing
    return res.status(404).json({message: "Unable to register user."});
});

function bookListPromise()
{
    return new Promise((resolve, reject) => {resolve(books)});
}

// Get the book list available in the shop
public_users.get('/',function (req, res) {
    bookListPromise().then((bookList) => res.send(JSON.stringify(bookList)));
});

function getBookByISBNPromise(isbn)
{
    return new Promise((resolve, reject) => {resolve(books[isbn])});
}

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
    getBookByISBNPromise(req.params.isbn).then((book) => res.send(book));
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  const author = req.params.author;
  let foundBooks = {};

  Object.keys(books).forEach(key => {
    const book = books[key];
    if(book.author === author)
    {
        foundBooks[book.title] = book;
    }
  });

  res.send(foundBooks)

});


// Get all books based on title
public_users.get('/title/:title',function (req, res) {
    const title = req.params.title;
    let foundBooks = {};
  
    Object.keys(books).forEach(key => {
      const book = books[key];
      if(book.title === title)
      {
          foundBooks[book.author] = book;
      }
    });
  
    res.send(foundBooks)

});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];

  if(book)
  {
    res.send(book.reviews);
  }
  else
  {
    res.send("No book found for isbn "+isbn);
  }
});

module.exports.general = public_users;
