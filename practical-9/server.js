import express from 'express';
import home from './home.js';

const app = express();
const PORT = 5000;

app.use('/', home);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
