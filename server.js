import express from 'express';
import cors from 'cors';
import winston from 'winston';
import dotenv from 'dotenv';
import pdfRoutes from './routes/pdfRoutes.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Configure logger
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.File({ filename: 'combined.log' })
    ]
});

if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.simple()
    }));
}

// Middleware
app.use(cors());
app.use(express.json());

// New API routes (primary endpoint for JSON-driven PDF generation)
app.use('/api', pdfRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'healthy' });
});

// Start server
app.listen(port, () => {
    logger.info(`PDF service listening at http://localhost:${port}`);
    console.log(`PDF service listening at http://localhost:${port}`);
});