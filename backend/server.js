const express = require('express');
const cors = require('cors');
const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

app.post('/api/grades', (req, res) => {
  const { groups } = req.body;
  console.log('Received grades:', groups);
  res.json({ message: 'Grades received successfully', data: groups });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});