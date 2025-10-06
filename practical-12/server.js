const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;


app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Serve static files from public directoryz
app.use(express.static(path.join(__dirname, 'public')));

// Route to serve the calculator form
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Route to handle calculation
app.post('/calculate', (req, res) => {
  const { num1, num2, operation } = req.body;

  // Validate inputs
  if (!num1 || !num2 || isNaN(num1) || isNaN(num2)) {
    return res.json({ error: 'Please enter valid numbers' });
  }

  const n1 = parseFloat(num1);
  const n2 = parseFloat(num2);
  let result;

  switch (operation) {
    case 'add':
      result = n1 + n2;
      break;
    case 'subtract':
      result = n1 - n2;
      break;
    case 'multiply':
      result = n1 * n2;
      break;
    case 'divide':
      if (n2 === 0) {
        return res.json({ error: 'Division by zero' });
      }
      result = n1 / n2;
      break;
    default:
      return res.json({ error: 'Invalid operation' });
  }

  res.json({ result });
});

app.listen(PORT, () => {
  console.log(`Calculator app listening at http://localhost:${PORT}`);
});
