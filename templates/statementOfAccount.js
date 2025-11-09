import path from "path";
import { fileURLToPath } from "url";
import { ImageHelper } from '../src/utils/imageHelper.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_LOGO = path.join(__dirname, '../assets/default-logo.png');

export default async function (data, styles) {
    let companyLogo = null;
    try {
        const logoPath = data.companyInfo?.logo || DEFAULT_LOGO;
        companyLogo = await ImageHelper.getImageDataUrl(logoPath);
    } catch (err) {
        console.error("Logo load failed:", err.message);
        companyLogo = null;
    }

    // Prepare items table body
    const itemRows = (data.items || []).map(item => ([
        { text: item.docNo || '', fontSize: 9 },
        { text: item.date || '', fontSize: 9 },
        { text: item.party || '', fontSize: 9 },
        { text: item.narration || '', fontSize: 9 },
        { text: item.po || '', fontSize: 9 },
        { text: item.remarks || '', fontSize: 9 },
        { text: (item.billAmt != null) ? item.billAmt.toFixed(2) : '', fontSize: 9, alignment: 'right' },
        { text: (item.vatAmt != null) ? item.vatAmt.toFixed(2) : '', fontSize: 9, alignment: 'right' },
        { text: (item.totalAmt != null) ? item.totalAmt.toFixed(2) : '', fontSize: 9, alignment: 'right' }
    ]));

    // Add totals as last row, spanning first 6 columns
    itemRows.push([
        { text: '', fontSize: 9, border: [true, true, true, true] },
        { text: '', fontSize: 9, border: [true, true, true, true] },
        { text: '', fontSize: 9, border: [true, true, true, true] },
        { text: '', fontSize: 9, border: [true, true, true, true] },
        { text: '', fontSize: 9, border: [true, true, true, true] },
        { text: '', fontSize: 9, border: [true, true, true, true] },
        { text: (data.summary?.billTotal ?? 0).toFixed(2), fontSize: 9, alignment: 'right', bold: true, border: [true, true, true, true] },
        { text: (data.summary?.vatTotal ?? 0).toFixed(2), fontSize: 9, alignment: 'right', bold: true, border: [true, true, true, true] },
        { text: (data.summary?.grossTotal ?? 0).toFixed(2), fontSize: 9, alignment: 'right', bold: true, border: [true, true, true, true] }
    ]);



    return {
        pageSize: 'A4',
        pageMargins: [30, 110, 30, 70],

        header: (currentPage, pageCount) => ({
            margin: [30, 20, 30, 0], // ⬅️ pushes header 20 pts down from top
            table: {
                widths: ['*'],
                body: [
                    [
                        {
                            columns: [
                                {
                                    width: '70%',
                                    height: 60,
                                    stack: [
                                        {
                                            text: (data.companyInfo?.name || "").toUpperCase(),
                                            style: 'companyName',
                                            margin: [0, 0, 0, 4]
                                        },
                                        {
                                            text: data.companyInfo?.address || '',
                                            style: 'companyAddress',
                                            margin: [0, 0, 0, 3]
                                        },
                                        {
                                            columns: [
                                                {
                                                    text: `Tel: ${data.companyInfo?.phone || ''}`,
                                                    style: 'companySmall',
                                                    width: 'auto'
                                                },
                                                {
                                                    text: `TRN: ${data.companyInfo?.trn || ''}`,
                                                    style: 'companySmall',
                                                    width: 'auto',
                                                    margin: [10, 0, 0, 0]
                                                }
                                            ]
                                        }
                                    ],
                                    alignment: 'left'
                                },
                                {
                                    width: '30%',
                                    alignment: 'right',
                                    stack: [
                                        companyLogo
                                            ? { image: companyLogo, width: 60, height: 60, alignment: 'right', margin: [0, 0, 0, 0] }
                                            : { text: '' }
                                    ]
                                }
                            ],
                            margin: [0, 5, 0, 5] // inner padding in the box
                        }
                    ]
                ]
            },
            layout: {
                hLineWidth: () => 1,
                vLineWidth: () => 1,
                hLineColor: () => 'black',
                vLineColor: () => 'black',
                paddingTop: () => 8,
                paddingBottom: () => 8,
                paddingLeft: () => 8,
                paddingRight: () => 8
            }
        }),

        footer: () => ([]), // footer blank

        content: [
            {
                table: {
                    headerRows: 1, // still counts the table header
                    widths: ['auto', 'auto', '*', '*', 'auto', 'auto', 'auto', 'auto', 'auto'],
                    body: [
                        // First row: Account name & Statement date (no borders)
                        [
                            {
                                text: `${data.accountName || ''}\nStatement of Account as on: ${data.statementDate || ''}`,
                                colSpan: 9,
                                border: [true, true, true, false],
                                alignment: 'left',
                                fontSize: 10
                            },
                            {}, {}, {}, {}, {}, {}, {}, {}
                        ],
                        // Table header
                        [
                            { text: 'Doc #', style: 'tableHeader' },
                            { text: 'Date', style: 'tableHeader' },
                            { text: 'Party', style: 'tableHeader' },
                            { text: 'Narration', style: 'tableHeader' },
                            { text: 'PO', style: 'tableHeader' },
                            { text: 'Remarks', style: 'tableHeader' },
                            { text: 'Bill Amt', style: 'tableHeader', alignment: 'right' },
                            { text: 'VAT Amt', style: 'tableHeader', alignment: 'right' },
                            { text: 'Total Amt', style: 'tableHeader', alignment: 'right' }
                        ],
                        // Item rows (including totals row)
                        ...itemRows
                    ]
                },
                layout: {
                    hLineWidth: (i, node) => 0.5,
                    vLineWidth: (i, node) => 0.5,
                    hLineColor: () => 'black',
                    vLineColor: () => 'black',
                    paddingLeft: () => 4,
                    paddingRight: () => 4,
                    paddingTop: () => 3,
                    paddingBottom: () => 3
                },
                margin: [0, 0, 0, 6]
            }
        ],


        styles
    };
};
