const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors({ origin: 'http://localhost:3000' })); // Allow requests from React app
app.use(express.json());

// Test endpoint
app.post('/api/grades', (req, res) => {
    const gradesData = req.body; // Simulating saving grades
    res.json({
        message: 'Grades received successfully',
        data: gradesData
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});