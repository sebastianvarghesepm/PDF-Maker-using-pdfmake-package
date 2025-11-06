import express from 'express';
import cors from 'cors';
import winston from 'winston';
import dotenv from 'dotenv';
import { PdfService } from './src/pdfService.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const pdfService = new PdfService();

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

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'healthy' });
});

// Generate PDF endpoint
app.post('/generate-pdf', async (req, res) => {
    try {
        const { templateName, data } = req.body;

        if (!templateName || !data) {
            return res.status(400).json({
                error: 'Missing required fields: templateName and data are required'
            });
        }

        logger.info(`Generating PDF with template: ${templateName}`);
        const result = await pdfService.generatePdf(templateName, data);

        logger.info(`PDF generated successfully: ${result.filePath}`);
        res.json({
            success: true,
            filePath: result.filePath,
            base64: result.base64
        });
    } catch (error) {
        logger.error('PDF generation failed:', error);
        res.status(500).json({
            error: 'Failed to generate PDF',
            details: error.message
        });
    }
});

// Start server
app.listen(port, () => {
    logger.info(`PDF service listening at http://localhost:${port}`);
    console.log(`PDF service listening at http://localhost:${port}`);
});