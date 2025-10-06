const express = require('express');
const path = require('path');

const app = express();
const port = process.env.PORT || 5173;

app.use(express.static(__dirname));

// Serve index.html at root; other files are served by express.static
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});


