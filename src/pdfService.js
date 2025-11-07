import PdfPrinter from 'pdfmake';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import winston from 'winston';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Ensure fonts directory exists
const fontsDir = path.join(__dirname, '../fonts');
if (!fs.existsSync(fontsDir)) {
    fs.mkdirSync(fontsDir, { recursive: true });
}

// Define and verify fonts
const fontFiles = {
    'Roboto-Regular.ttf': 'normal',
    'Roboto-Medium.ttf': 'bold',
    'Roboto-Italic.ttf': 'italics',
    'Roboto-MediumItalic.ttf': 'bolditalics'
};

// Copy fonts from pdfmake if they don't exist
for (const [fontFile, _] of Object.entries(fontFiles)) {
    const destPath = path.join(fontsDir, fontFile);
    if (!fs.existsSync(destPath)) {
        const sourcePath = path.join(__dirname, '../node_modules/pdfmake/fonts/Roboto', fontFile);
        if (fs.existsSync(sourcePath)) {
            fs.copyFileSync(sourcePath, destPath);
        }
    }
}

// Configure fonts
const fonts = {
    Roboto: Object.entries(fontFiles).reduce((acc, [file, style]) => {
        acc[style] = path.join(fontsDir, file);
        return acc;
    }, {})
};

// Create printer instance
const printer = new PdfPrinter(fonts);

export class PdfService {
    constructor(logger) {
        this.logger = logger || winston.createLogger({
            level: 'info',
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.json()
            ),
            transports: [
                new winston.transports.Console({
                    format: winston.format.simple()
                })
            ]
        });
    }

    async generatePdf(templateName, data) {
        try {
            this.logger.info('Starting PDF generation', { templateName });

            // Validate input
            if (!templateName || !data) {
                throw new Error('Template name and data are required');
            }

            // Dynamically import template and its styles
            let template, styles;
            try {
                [template, styles] = await Promise.all([
                    import(`../templates/${templateName}.js`),
                    import('../styles/templates.js')
                ]);
            } catch (error) {
                this.logger.error('Failed to load template or styles', { error: error.message });
                throw new Error(`Failed to load template: ${error.message}`);
            }

            // Get template-specific styles
            const templateStyles = styles[`${templateName}Styles`] || styles.baseStyles;

            // Process template function (it might be async)
            let docDefinition;
            try {
                // Check if the template function is async
                const templateResult = template.default(data, templateStyles);
                docDefinition = templateResult instanceof Promise
                    ? await templateResult
                    : templateResult;

                // Validate document definition
                if (!docDefinition || typeof docDefinition !== 'object') {
                    throw new Error('Invalid document definition returned from template');
                }

                // Ensure required properties exist
                docDefinition.content = docDefinition.content || [];
                docDefinition.styles = docDefinition.styles || templateStyles;
                docDefinition.defaultStyle = docDefinition.defaultStyle || {
                    font: 'Roboto'
                };
            } catch (error) {
                this.logger.error('Template processing failed', { error: error.message });
                throw new Error(`Template processing failed: ${error.message}`);
            }

            // Set default document properties if not specified
            docDefinition.pageSize = docDefinition.pageSize || 'A4';
            docDefinition.pageMargins = docDefinition.pageMargins || [40, 60, 40, 60];
            docDefinition.info = docDefinition.info || {
                title: `${templateName} - ${new Date().toISOString()}`,
                author: data.companyInfo?.name || 'PDF Generator',
                subject: `${templateName} Document`,
                keywords: templateName
            };

            // Create PDF document
            let pdfDoc;
            try {
                console.log('MY LOG', docDefinition)
                pdfDoc = printer.createPdfKitDocument(docDefinition);
            } catch (error) {
                this.logger.error('Failed to create PDF document', { error: error.message });
                throw new Error(`PDF creation failed: ${error.message}`);
            }

            // Setup output path and create directory if needed
            const outputPath = path.join(__dirname, '../output', `${data.documentNumber || 'document'}.pdf`);
            await fs.promises.mkdir(path.dirname(outputPath), { recursive: true });

            // Create write stream
            const writeStream = fs.createWriteStream(outputPath);
            writeStream.on('error', (error) => {
                this.logger.error('Write stream error', { error: error.message });
                pdfDoc.end();
            });

            return new Promise((resolve, reject) => {
                let chunks = [];

                pdfDoc.on('data', chunk => chunks.push(chunk));
                pdfDoc.on('end', () => {
                    const pdfBuffer = Buffer.concat(chunks);
                    const base64Pdf = pdfBuffer.toString('base64');
                    this.logger.info(`PDF generated successfully: ${outputPath}`);
                    resolve({
                        buffer: pdfBuffer,
                        base64: base64Pdf,
                        filePath: outputPath
                    });
                });
                pdfDoc.on('error', (err) => {
                    this.logger.error(`PDF generation failed: ${err.message}`);
                    reject(err);
                });

                pdfDoc.pipe(writeStream);
                pdfDoc.end();
            });
        } catch (error) {
            this.logger.error(`Failed to generate PDF: ${error.message}`, { templateName });
            throw new Error(`Failed to generate PDF: ${error.message}`);
        }
    }

    // (intentionally minimal) PdfService relies on templates to supply valid image values (data URLs or file paths).
}


