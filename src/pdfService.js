import PdfPrinter from 'pdfmake';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Define fonts
// const fonts = {
//     Roboto: {
//         normal: 'node_modules/pdfmake/fonts/Roboto/Roboto-Regular.ttf',
//         bold: 'node_modules/pdfmake/fonts/Roboto/Roboto-Medium.ttf',
//         italics: 'node_modules/pdfmake/fonts/Roboto/Roboto-Italic.ttf',
//         bolditalics: 'node_modules/pdfmake/fonts/Roboto/Roboto-MediumItalic.ttf'
//     }
// };
const fonts = {
    Roboto: {
        normal: path.join(__dirname, '../fonts/Roboto-Regular.ttf'),
        bold: path.join(__dirname, '../fonts/Roboto-Medium.ttf'),
        italics: path.join(__dirname, '../fonts/Roboto-Italic.ttf'),
        bolditalics: path.join(__dirname, '../fonts/Roboto-MediumItalic.ttf')
    }
};

const printer = new PdfPrinter(fonts);

export class PdfService {
    constructor() {
        this.defaultStyles = {
            header: {
                fontSize: 18,
                bold: true,
                margin: [0, 0, 0, 10]
            },
            subheader: {
                fontSize: 14,
                bold: true,
                margin: [0, 10, 0, 5]
            },
            tableHeader: {
                bold: true,
                fontSize: 12,
                color: 'black'
            }
        };
    }

    async generatePdf(templateName, data) {
        try {

            // Load template dynamically
            const template = await import(`../templates/${templateName}.js`);
            const docDefinition = template.default(data, this.defaultStyles);

            // Add common elements like logo and footer
            this.addCommonElements(docDefinition);

            const pdfDoc = printer.createPdfKitDocument(docDefinition);
            const outputPath = path.join(__dirname, '../output', `${data.documentNumber || 'document'}.pdf`);

            // Create write stream
            const writeStream = fs.createWriteStream(outputPath);

            return new Promise((resolve, reject) => {
                let chunks = [];

                pdfDoc.on('data', chunk => chunks.push(chunk));
                pdfDoc.on('end', () => {
                    const pdfBuffer = Buffer.concat(chunks);
                    const base64Pdf = pdfBuffer.toString('base64');
                    resolve({
                        buffer: pdfBuffer,
                        base64: base64Pdf,
                        filePath: outputPath
                    });
                });
                pdfDoc.on('error', reject);

                pdfDoc.pipe(writeStream);
                pdfDoc.end();
            });
        } catch (error) {
            throw new Error(`Failed to generate PDF: ${error.message}`);
        }
    }

    addCommonElements(docDefinition) {
        // Add logo
        docDefinition.header = (currentPage) => ({
            columns: [
                {
                    image: path.join(process.cwd(), 'assets', 'demo_logo.jpg'),
                    // TODO: Replace with actual logo path
                    width: 100,
                    margin: [40, 20, 0, 20]
                },
                {
                    text: `Page ${currentPage}`,
                    alignment: 'right',
                    margin: [0, 20, 40, 20]
                }
            ]
        });

        // Add footer with signature section
        docDefinition.footer = (currentPage, pageCount) => ({
            columns: [
                {
                    text: 'Authorized Signature: _________________',
                    alignment: 'left',
                    margin: [40, 20]
                },
                {
                    text: `Page ${currentPage} of ${pageCount}`,
                    alignment: 'right',
                    margin: [0, 20, 40, 20]
                }
            ]
        });

        // Set default page margins and size
        docDefinition.pageSize = 'A4';
        docDefinition.pageMargins = [40, 80, 40, 80]; // [left, top, right, bottom]
    }
}