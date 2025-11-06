export default function (data, styles) {
    return {
        content: [
            // Document Header
            {
                text: 'INVOICE',
                style: 'header',
                alignment: 'center'
            },
            {
                columns: [
                    // Company Information
                    {
                        stack: [
                            { text: 'Your Company Name', style: 'subheader' },
                            '123 Business Street',
                            'City, State 12345',
                            'Phone: (555) 555-5555',
                            'Email: contact@yourcompany.com'
                        ]
                    },
                    // Invoice Details
                    {
                        stack: [
                            { text: `Invoice #: ${data.invoiceNumber}`, alignment: 'right' },
                            { text: `Date: ${data.date}`, alignment: 'right' },
                            { text: `Due Date: ${data.dueDate}`, alignment: 'right' }
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