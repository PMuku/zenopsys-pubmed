// Core
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

// For DB
import connectDB from './db.js';

// For middleware
import errorHandler from './middleware/error.js';
import logger from './middleware/logger.js';

// For routes
import authRoutes from './routes/authRoutes.js';
import chatRoutes from './routes/chatRoutes.js';

dotenv.config();

connectDB();

const app = express();
const PORT = process.env.PORT || 2000;

// CORS configuration
app.use(cors({
    origin: process.env.VITE_URL || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Logger
app.use(logger);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', chatRoutes);

// Error handler
app.use(errorHandler);

app.get('/', (req, res) => {
    res.send('Hello, World!');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});