import path from 'path';
import { fileURLToPath } from 'url';
import { ImageHelper } from '../src/utils/imageHelper.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Default logo path as fallback
const DEFAULT_LOGO = path.join(__dirname, '../assets/default-logo.png');

export default async function (data, styles) {
    // Initialize logo variable outside try block
    let companyLogo = null;

    try {
        // Process company logo
        const logoPath = data.companyInfo?.logo || DEFAULT_LOGO;
        companyLogo = await ImageHelper.getImageDataUrl(logoPath);
        // if companyLogo is null or invalid, we'll fall back to text in the header
    } catch (err) {
        console.error('Failed to load company logo:', err?.message || err);
        companyLogo = null; // continue and let template use text fallback
    }
    return {
        pageSize: 'A4',
        pageMargins: [40, 80, 40, 80], // [left, top, right, bottom]
        header: (currentPage) => ({
            columns: [
                companyLogo ? {
                    image: companyLogo,
                    width: 100,
                    margin: [40, 20, 0, 20]
                } : {
                    text: data.companyInfo?.name || 'Company Name',
                    style: styles.companyDetails,
                    margin: [40, 20, 0, 20]
                },
                {
                    text: `Page ${currentPage}`,
                    style: styles.pageNumber,
                    alignment: 'right'
                }
            ]
        }),
        footer: (currentPage, pageCount) => ({
            columns: [
                {
                    stack: [
                        {
                            text: 'Authorized Signature:',
                            style: styles.signatureBox
                        },
                        {
                            canvas: [
                                {
                                    type: 'line',
                                    x1: 0, y1: 0,
                                    x2: 200, y2: 0,
                                    lineWidth: 1
                                }
                            ]
                        }
                    ],
                    width: '*'
                },
                {
                    stack: [
                        {
                            text: `Page ${currentPage} of ${pageCount}`,
                            style: styles.pageNumber
                        },
                        {
                            text: data.companyInfo?.footer || 'Thank you for your business',
                            style: styles.footerText
                        }
                    ],
                    width: 'auto'
                }
            ],
            margin: [40, 20, 40, 20]
        }),
        content: [
            // Document Header
            {
                text: 'INVOICE',
                style: styles.invoiceHeader,
                alignment: 'center'
            },
            {
                columns: [
                    // Company Information
                    {
                        stack: [
                            { text: data.companyInfo?.name || 'Your Company Name', style: styles.companyDetails },
                            { text: data.companyInfo?.address || '123 Business Street', style: styles.companyDetails },
                            { text: data.companyInfo?.city || 'City, State 12345', style: styles.companyDetails },
                            { text: `Phone: ${data.companyInfo?.phone || '(555) 555-5555'}`, style: styles.companyDetails },
                            { text: `Email: ${data.companyInfo?.email || 'contact@yourcompany.com'}`, style: styles.companyDetails }
                        ]
                    },
                    // Invoice Details
                    {
                        stack: [
                            { text: `Invoice #: ${data.invoiceNumber || 'N/A'}`, alignment: 'right', style: styles.invoiceDetails },
                            { text: `Date: ${data.date || new Date().toLocaleDateString()}`, alignment: 'right', style: styles.invoiceDetails },
                            { text: `Due Date: ${data.dueDate || 'N/A'}`, alignment: 'right', style: styles.invoiceDetails }
                        ]
                    }
                ],
                columnGap: 10,
                margin: [0, 20, 0, 20]
            },
            // Customer Information
            {
                text: 'Bill To:',
                style: 'subheader',
                margin: [0, 20, 0, 5]
            },
            {
                stack: [
                    data.customer.name,
                    data.customer.address,
                    data.customer.city,
                    data.customer.phone
                ],
                margin: [0, 0, 0, 20]
            },
            // Items Table
            {
                table: {
                    headerRows: 1,
                    widths: ['*', 'auto', 'auto', 'auto'],
                    body: [
                        [
                            { text: 'Description', style: 'tableHeader' },
                            { text: 'Quantity', style: 'tableHeader' },
                            { text: 'Unit Price', style: 'tableHeader' },
                            { text: 'Amount', style: 'tableHeader' }
                        ],
                        ...data.items.map(item => [
                            item.description,
                            item.quantity.toString(),
                            { text: `$${item.unitPrice.toFixed(2)}`, alignment: 'right' },
                            { text: `$${(item.quantity * item.unitPrice).toFixed(2)}`, alignment: 'right' }
                        ])
                    ]
                },
                layout: 'lightHorizontalLines'
            },
            // Totals
            {
                columns: [
                    { width: '*', text: '' },
                    {
                        width: 'auto',
                        stack: [
                            { text: 'Subtotal:', alignment: 'right', margin: [0, 10, 0, 5] },
                            { text: 'Tax:', alignment: 'right', margin: [0, 0, 0, 5] },
                            { text: 'Total:', alignment: 'right', bold: true }
                        ]
                    },
                    {
                        width: 'auto',
                        stack: [
                            { text: `$${data.subtotal.toFixed(2)}`, alignment: 'right', margin: [20, 10, 0, 5] },
                            { text: `$${data.tax.toFixed(2)}`, alignment: 'right', margin: [20, 0, 0, 5] },
                            { text: `$${data.total.toFixed(2)}`, alignment: 'right', bold: true, margin: [20, 0, 0, 0] }
                        ]
                    }
                ],
                margin: [0, 20, 0, 20]
            },
            // Notes
            {
                text: 'Notes:',
                style: 'subheader',
                margin: [0, 20, 0, 5]
            },
            {
                text: data.notes || 'Thank you for your business!',
                margin: [0, 0, 0, 20]
            }
        ],
        styles: styles
    };

}