const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3001;

app.use(cors());

// Load data from JSON file
const dataPath = path.join(__dirname, 'data', 'data.json');
const rawData = fs.readFileSync(dataPath);
const data = JSON.parse(rawData);

// Extract books data
const books = data.summaries.map((summary, index) => ({
  id: summary.id,
  title: data.titles[index],
  summary: summary.summary,
  author: data.authors.find(author => author.book_id === summary.id)?.author
}));

app.get('/api/search', (req, res) => {
  const { query } = req.query;
  
  if (!query) {
    return res.json([]);
  }

  const results = books
    .filter(book => 
      book.title.toLowerCase().includes(query.toLowerCase()) ||
      book.summary.toLowerCase().includes(query.toLowerCase()) ||
      book.author.toLowerCase().includes(query.toLowerCase())
    )
    .map(book => ({
      id: book.id,
      title: book.title,
      author: book.author,
      occurrences: (
        (book.title.toLowerCase().match(new RegExp(query.toLowerCase(), 'g')) || []).length +
        (book.summary.toLowerCase().match(new RegExp(query.toLowerCase(), 'g')) || []).length +
        (book.author.toLowerCase().match(new RegExp(query.toLowerCase(), 'g')) || []).length
      )
    }))
    .sort((a, b) => b.occurrences - a.occurrences);

  res.json(results);
});

app.get('/api/book/:id', (req, res) => {
  const { id } = req.params;
  const book = books.find(book => book.id === parseInt(id));
  
  if (book) {
    res.json(book);
  } else {
    res.status(404).json({ error: 'Book not found' });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});