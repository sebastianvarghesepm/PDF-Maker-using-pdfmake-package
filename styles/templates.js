import { baseStyles } from './base.js';

export const invoiceStyles = {
    ...baseStyles,
    invoiceHeader: {
        ...baseStyles.header,
        color: '#2c3e50'
    },
    invoiceSubheader: {
        ...baseStyles.subheader,
        color: '#34495e'
    },
    customerInfo: {
        fontSize: 11,
        margin: [0, 5, 0, 5]
    },
    totalsTable: {
        fontSize: 11,
        bold: true,
        alignment: 'right'
    }
};
export const purchaseOrderStyles = {
    ...baseStyles,
    headerTitle: { fontSize: 14, bold: true, margin: [0, 5, 0, 0] },
    infoTitle: { fontSize: 10, bold: true },
    infoText: { fontSize: 9, margin: [0, 1, 0, 1] },
    documentTitle: { fontSize: 12, bold: true },
    tableHeader: { fontSize: 9 },
    footerRole: { fontSize: 9, alignment: "center", margin: [0, 5, 0, 0] }
};
export const statementOfAccountStyles = {
    ...baseStyles,
    companyName: { fontSize: 11, bold: true, margin: [0, 0, 0, 2] },
    companyAddress: { fontSize: 9 },
    companySmall: { fontSize: 8 },
    documentTitle: { fontSize: 12, bold: true, margin: [0, 4, 0, 4] },
    infoText: { fontSize: 9, margin: [0, 2, 0, 2] },
    tableHeader: { fontSize: 9, bold: true, fillColor: null },
    totalsLabel: { fontSize: 9 },
    totalsLabelBold: { fontSize: 9, bold: true },
    totalsValue: { fontSize: 9 },
    totalsValueBold: { fontSize: 10, bold: true },
    footerTotals: { fontSize: 9, margin: [0, 2, 0, 0] },
    footerTotalsBold: { fontSize: 10, bold: true, margin: [0, 4, 0, 0] }
};
