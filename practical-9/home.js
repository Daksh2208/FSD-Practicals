
import express from 'express';

const router = express.Router();

router.get('/', (req, res) => {
  res.send('Welcome to our site');
});

export default router;
