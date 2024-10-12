import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(bodyParser.json());

app.post('/api/chat', (req, res) => {
  // Implement chat functionality
  // This is a placeholder for the actual implementation
  res.json({ message: 'Chat endpoint reached' });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});