const express = require('express');
const { ObjectId } = require('mongodb');
const cors = require('cors');

const { connectToDb, getDb } = require('./db');

const PORT = process.env.PORT;

// init app & middleware
const app = express();
app.use(cors());
app.use(express.json());
// database connection
let db;

connectToDb((error) => {
  if (error) {
    console.log(error);
    return;
  }

  app.listen(PORT, () => {
    console.log('app listening on port', PORT);
  });

  db = getDb();
});

// routes
app.get('/meetups', (req, res) => {
  // current page
  const page = req.query.page - 1 || 0;
  const booksPerPage = 6;

  let books = [];

  db.collection('meetups')
    .find() // cursor
    .sort({ author: 1 })
    .skip(page * booksPerPage) // pagination
    .limit(booksPerPage)
    .forEach((book) => books.push(book))
    .then(() => {
      res.status(200).json(books);
    })
    .catch(() => {
      res.status(500).json({ error: 'Could not fetch the documents' });
    });
});

app.get('/meetups/size', (req, res) => {
  // current page

  db.collection('meetups')
    .countDocuments()
    .then((size) => {
      res.status(200).json({ size: size });
    })
    .catch(() => {
      res.status(500).json({ error: 'Could not fetch the documents' });
    });
});

app.get('/meetups/:id', (req, res) => {
  if (!ObjectId.isValid(req.params.id)) {
    res.status(500).json({
      error: `Document id:${req.params.id} is not valid`,
    });

    return;
  }

  db.collection('meetups')
    .findOne({ _id: ObjectId(req.params.id) })
    .then((doc) => {
      res.status(200).json(doc);
    })
    .catch(() => {
      res.status(500).json({ error: 'Could not fetch the documents' });
    });
});

app.post('/meetups', (req, res) => {
  const book = req.body;

  db.collection('meetups')
    .insertOne(book)
    .then((result) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.status(201).json(result);
    })
    .catch(() => {
      res.status(500).json({ error: 'Could not create a new document' });
    });
});

app.delete('/meetups/:id', (req, res) => {
  if (!ObjectId.isValid(req.params.id)) {
    res.status(500).json({
      error: `Document id:${req.params.id} is not valid`,
    });
    return;
  }

  db.collection('meetups')
    .deleteOne({ _id: ObjectId(req.params.id) })
    .then((result) => {
      res.status(200).json(result);
    })
    .catch(() => {
      res.status(500).json({ error: 'Could not delete the documents' });
    });
});

app.patch('/meetups/:id', (req, res) => {
  const updates = req.body;

  if (!ObjectId.isValid(req.params.id)) {
    res.status(500).json({
      error: `Document id:${req.params.id} is not valid`,
    });
    return;
  }

  db.collection('meetups')
    .updateOne({ _id: ObjectId(req.params.id) }, { $set: updates })
    .then((result) => {
      res.status(200).json(result);
    })
    .catch(() => {
      res.status(500).json({ error: 'Could not update the documents' });
    });
});
