import path from "path";
import { fileURLToPath } from "url";
import { ImageHelper } from "../src/utils/imageHelper.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_LOGO = path.join(__dirname, "../assets/default-logo.png");

export default async function (data, styles) {
    let companyLogo = null;

    // ✅ Convert logo to data URL
    try {
        const logoPath = data.companyInfo?.logo || DEFAULT_LOGO;
        companyLogo = await ImageHelper.getImageDataUrl(logoPath);
    } catch (err) {
        console.error("Logo load failed:", err.message);
        companyLogo = null;
    }

    // ✅ Convert all item images to data URLs (safe for remote URLs or local paths)
    try {
        if (Array.isArray(data.items)) {
            const processedItems = await Promise.all(
                data.items.map(async (item) => ({
                    ...item,
                    image: item.image
                        ? await ImageHelper.getImageDataUrl(item.image)
                        : null,
                }))
            );
            data.items = processedItems;
        }
    } catch (err) {
        console.error("Item image load failed:", err.message);
    }

    return {
        pageSize: "A4",
        pageMargins: [40, 107.8, 40, 50],

        header: (currentPage) => {
            if (currentPage === 1) {
                return {
                    table: {
                        widths: ["70%", "30%"],
                        body: [
                            [
                                {
                                    stack: [
                                        { text: data.companyInfo?.name || "", style: "companyName" },
                                        { text: data.companyInfo?.address || "", style: "companyAddress" },
                                        { text: `Phone: ${data.companyInfo?.phone || ""}`, style: "companySmall" },
                                        { text: `Email: ${data.companyInfo?.email || ""}`, style: "companySmall" },
                                    ],
                                    border: [true, true, false, true],
                                },
                                {
                                    stack: [
                                        {
                                            image: companyLogo,
                                            width: 30,
                                            alignment: "center",
                                            margin: [0, 0, 0, 0],
                                        },
                                        // Spacer line
                                        { text: "", margin: [0, 6, 0, 6] },
                                        { text: `TRN ${data.companyInfo?.trn || ""}`, alignment: "right", style: "companySmall" },
                                    ],
                                    border: [false, true, true, true],
                                },
                            ],
                            [
                                {
                                    colSpan: 2,
                                    text: data.documentTitle || "QUOTATION",
                                    style: "documentTitle",
                                    alignment: "center",
                                    margin: [0, 0, 0, 0],
                                },
                                {},
                            ],
                        ],
                    },
                    layout: {
                        hLineWidth: (i, node) => (i === 0 || i === node.table.body.length ? 0.8 : 0.5),
                        vLineWidth: () => 0.8, // 🚫 No vertical separation
                        hLineColor: () => "#000",
                        paddingLeft: () => 8,
                        paddingRight: () => 8,
                        paddingTop: () => 4,
                        paddingBottom: () => 4,
                    },
                    margin: [40, 30, 40, 0],
                };
            }
            return null;
        },

        content: [

            // Client and Quotation Info (Boxed)
            {
                table: {
                    widths: ["50%", "50%"],
                    body: [
                        [
                            // Left side - Client Info (M/S)
                            {
                                stack: [
                                    { text: "M/S", style: "infoText" },
                                    { text: data.clientInfo?.name || "", style: "infoText" },
                                    { text: data.clientInfo?.address || "", style: "infoText" },
                                ],
                                border: [true, true, false, true],
                                margin: [6, 0, 6, 0],
                            },

                            // Right side - Quotation Info (aligned label-value pairs)
                            {
                                table: {
                                    widths: [60, "*"],
                                    body: [
                                        [{ text: "No:", style: "infoText" }, { text: data.quotationInfo?.number || "", style: "infoText" }],
                                        [{ text: "Date:", style: "infoText" }, { text: data.quotationInfo?.date || "", style: "infoText" }],
                                        [{ text: "Terms:", style: "infoText" }, { text: data.quotationInfo?.terms || "", style: "infoText" }],
                                        [{ text: "Currency:", style: "infoText" }, { text: data.quotationInfo?.currency || "AED", style: "infoText" }],
                                        [{ text: "S/Man:", style: "infoText" }, { text: data.quotationInfo?.salesman || "", style: "infoText" }],
                                    ],
                                },
                                layout: "noBorders",
                                border: [false, true, true, true],
                                margin: [6, 0, 6, 0],
                            },
                        ],
                    ],
                },
                layout: {
                    hLineWidth: () => 0.8,
                    vLineWidth: () => 0.8,
                    hLineColor: () => "#000",
                    vLineColor: () => "#000",
                    paddingLeft: () => 4,
                    paddingRight: () => 4,
                    paddingTop: () => 3,
                    paddingBottom: () => 3,
                },
                margin: [0, 0, 0, 0],
            },

            // Items Table
            {
                table: {
                    headerRows: 1,
                    widths: ["auto", "auto", "*", "auto", "auto", "auto"],
                    body: [
                        [
                            { text: "Sno", style: "tableHeader" },
                            { text: "Image", style: "tableHeader" },
                            { text: "Item", style: "tableHeader" },
                            { text: "Qty", style: "tableHeader" },
                            { text: "Price (AED)", style: "tableHeader" },
                            { text: "Amount", style: "tableHeader" },
                        ],
                        ...data.items.map((item, i) => [
                            { text: i + 1, fontSize: 9 },
                            item.image
                                ? { image: item.image, width: 40, height: 40 }
                                : { text: "", fontSize: 9 },
                            { text: item.description, fontSize: 9 },
                            { text: item.qty, fontSize: 9, alignment: "center" },
                            { text: item.price.toFixed(2), fontSize: 9, alignment: "right" },
                            { text: item.amount.toFixed(2), fontSize: 9, alignment: "right" },
                        ]),
                    ],
                },
                layout: {
                    hLineWidth: () => 0.5,
                    vLineWidth: () => 0.5,
                    hLineColor: () => "black",
                    vLineColor: () => "black",
                },
            },

            // Totals Section (Boxed Right-Aligned Values)
            {
                table: {
                    widths: ["*", "auto"],
                    body: [
                        [
                            {
                                text: "Total Amount in AED",
                                alignment: "right",
                                style: "totalsLabelBold",
                                border: [true, true, false, true] // top & bottom only
                            },
                            {
                                text: data.summary?.totalAmount.toFixed(2),
                                alignment: "right",
                                style: "totalsValue",
                                border: [true, true, true, true] // full box
                            },
                        ],
                        [
                            {
                                text: "VAT @ 5%",
                                alignment: "right",
                                style: "totalsLabel",
                                border: [true, false, false, true]
                            },
                            {
                                text: data.summary?.vatAmount.toFixed(2),
                                alignment: "right",
                                style: "totalsValue",
                                border: [true, true, true, true]
                            },
                        ],
                        [
                            {
                                text: "Net Amount",
                                alignment: "right",
                                style: "totalsLabelBold",
                                border: [true, false, false, true]
                            },
                            {
                                text: data.summary?.netAmount.toFixed(2),
                                alignment: "right",
                                style: "totalsValueBold",
                                border: [true, true, true, true]
                            },
                        ],
                    ],
                },
                layout: {
                    hLineWidth: () => 0.8,
                    vLineWidth: () => 0.8,
                    hLineColor: () => "#000",
                    vLineColor: () => "#000",
                },
                margin: [0, 0, 0, 0],
            },

            // Terms & Conditions + Footer (Combined Box)
            {
                table: {
                    widths: ["*"],
                    body: [
                        [
                            {
                                stack: [
                                    // Terms & Conditions
                                    { text: "Terms & Conditions:", style: "totalsLabelBold", margin: [0, 5, 0, 3], decoration: "underline" },
                                    ...data.terms.map((t) => ({ text: t, style: "infoText" })),

                                    // Spacer line
                                    { text: "", margin: [0, 8, 0, 8] },

                                    // Footer Contact
                                    { text: `For ${data.companyInfo?.name}`, style: "infoText", margin: [0, 5, 0, 2], bold: true },
                                    { text: data.footer?.contactPerson || "", style: "infoText", bold: true },
                                    { text: data.footer?.phone || "", style: "infoText", bold: true },
                                    { text: data.footer?.business || "Business Solutions", style: "infoText", bold: true },
                                ],
                                margin: [8, 6, 8, 6],
                            },
                        ],
                    ],
                },
                layout: {
                    hLineWidth: (i, node) => (i === 0 ? 0.8 : 0.8), // ❌ no top border
                    vLineWidth: () => 0.8,
                    hLineColor: () => "#000",
                    vLineColor: () => "#000",
                    paddingLeft: () => 6,
                    paddingRight: () => 6,
                    paddingTop: () => 4,
                    paddingBottom: () => 4,
                },
                margin: [0, 0, 0, 0],
            },


        ],


        styles,
    };
}
