// Core
import express from 'express';
import dotenv from 'dotenv';

// For DB
import connectDB from './db.js';

// For middleware
import errorHandler from './middleware/error.js';
import logger from './middleware/logger.js';

// For routes
import authRoutes from './routes/authRoutes.js';

dotenv.config();

connectDB();

const app = express();
const PORT = process.env.PORT || 2000;

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Logger
app.use(logger);

// Routes
app.use('/api/auth', authRoutes);

// Error handler
app.use(errorHandler);

app.get('/', (req, res) => {
    res.send('Hello, World!');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});