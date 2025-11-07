import path from "path";
import { fileURLToPath } from "url";
import { ImageHelper } from '../src/utils/imageHelper.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));


// Default logo path as fallback
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

    return {
        pageSize: "A4",
        pageMargins: [40, 60, 40, 90],

        header: (currentPage, pageCount) => {
            // Show logo only on first page
            if (currentPage === 1) {
                return {
                    stack: [
                        {
                            image: companyLogo,
                            width: 80,
                            alignment: "center",
                            margin: [0, 10, 0, 10],
                        },
                        {
                            text: data.companyInfo?.title || "",
                            alignment: "center",
                            style: "headerTitle",
                        },
                    ],
                };
            } else {
                // No header for other pages
                return null;
            }
        },


        footer: () => ([
            {
                columns: [
                    {
                        stack: [
                            { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 100, y2: 0, lineWidth: 0.4 }] },
                            { text: "Purchasing Manager", style: "footerRole", margin: [0, 0, 0, 0] }
                        ],
                        alignment: 'center'
                    },
                    {
                        stack: [
                            { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 100, y2: 0, lineWidth: 0.4 }] },
                            { text: "Finance Manager", style: "footerRole", margin: [0, 0, 0, 0] }
                        ],
                        alignment: 'center'
                    },
                    {
                        stack: [
                            { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 100, y2: 0, lineWidth: 0.4 }] },
                            { text: "General Manager", style: "footerRole", margin: [0, 0, 0, 0] }
                        ],
                        alignment: 'center'
                    },
                    {
                        stack: [
                            { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 120, y2: 0, lineWidth: 0.4 }] },
                            { text: "Cluster General Manager", style: "footerRole", margin: [0, 0, 0, 0] }
                        ],
                        alignment: 'center'
                    }
                ],
                margin: [40, 0, 40, 50], // space below the columns before the full-width line
            },
            {
                // Full-width line below all columns
                canvas: [
                    { type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 0.4 }
                ],
                margin: [40, 0, 40, 0] // space below the line
            }
        ]

        ),

        content: [
            // Supplier / Buyer Info
            {
                columns: [
                    // Left section - 35%
                    {
                        width: "35%",
                        stack: [
                            // Top half
                            {
                                stack: [
                                    { text: data.supplierInfo?.name || "Supplier Name", style: "infoTitle" },
                                    { text: data.supplierInfo?.address || "Supplier Address", style: "infoText" },
                                ],
                                margin: [0, 0, 0, 20],
                            },
                            // Bottom half
                            {
                                stack: [
                                    { text: `Tel: ${data.supplierInfo?.phone || ""}`, style: "infoText" },
                                ]
                            }
                        ]
                    },

                    // Center section - 30% (blank)
                    {
                        width: "30%",
                        stack: [
                            { text: "" }  // blank content
                        ]
                    },
                    // Right section - 35%
                    {
                        width: "35%",
                        stack: [
                            // Top half
                            {
                                stack: [
                                    { text: `Company Name: ${data.companyInfo?.name || ""}`, style: "infoText" },
                                    { text: `TRN: ${data.companyInfo?.trn || ""}`, style: "infoText" },
                                    { text: `Title: ${data.companyInfo?.title || ""}`, style: "infoText" },
                                ],
                                margin: [0, 0, 0, 10],
                            },
                            // Bottom half
                            {
                                stack: [
                                    { text: `Deliver To: ${data.companyInfo?.deliveryTo || ""}`, style: "infoText" },
                                    { text: `Phone: ${data.companyInfo?.phone || ""}`, style: "infoText" },
                                    { text: data.companyInfo?.website || "", link: data.companyInfo?.website },
                                ]
                            }
                        ]
                    }
                ],
                columnGap: 10,
                margin: [0, 20, 0, 20],
            },

            // Title

            {
                stack: [
                    {
                        text: 'PURCHASE ORDER',
                        style: 'documentTitle',
                        alignment: "center",
                        margin: [0, 0, 0, 0]
                    },
                    {
                        canvas: [
                            {
                                type: 'line',
                                x1: 0,
                                y1: 0,
                                x2: 520,  // full width
                                y2: 0,
                                lineWidth: 0.8,
                                lineColor: '#000' // solid underline
                            }
                        ]
                    }
                ]
            },
            // Order Information
            {
                columns: [
                    {
                        width: "40%",
                        stack: [
                            { text: `Order No: ${data.orderInfo?.number}`, style: "infoText" },
                            { text: `Order Date: ${data.orderInfo?.date}`, style: "infoText" },
                            { text: `Cost Centre: ${data.orderInfo?.costCentre}`, style: "infoText" },
                            { text: `Request No: ${data.orderInfo?.requestNo}`, style: "infoText" },
                            { text: `Delivery Date: ${data.orderInfo?.deliveryDate}`, style: "infoText" },
                        ],
                    },
                    {
                        width: "60%",
                        stack: [
                            { text: "1) Acceptance of this order indicates acceptance of all conditions herein.", style: "infoText" },
                            { text: "2) Invoice must accompany goods.", style: "infoText" },
                            { text: "3) Deliveries accepted subject to count, weight & quality.", style: "infoText" },
                            { text: "4) Receiving Time: 9AM - 4PM", style: "infoText" },
                            { text: "5) Payment Terms:", style: "infoText" },
                        ],
                    },
                ],
                columnGap: 10,
                margin: [0, 15, 0, 25],
            },

            // Items Table
            {
                stack: [
                    // Table
                    {
                        table: {
                            headerRows: 1,
                            widths: ["auto", "*", "auto", "auto", "auto", "auto", "auto", "auto"],
                            body: [
                                [
                                    { text: "No", style: "tableHeader" },
                                    { text: "Article", style: "tableHeader" },
                                    { text: "Unit", style: "tableHeader" },
                                    { text: "Qty", style: "tableHeader" },
                                    { text: "Unit Price", style: "tableHeader" },
                                    { text: "VAT %", style: "tableHeader" },
                                    { text: "VAT Value", style: "tableHeader" },
                                    { text: "Total", style: "tableHeader" },
                                ],
                                ...data.items.map((item, i) => [
                                    { text: i + 1, fontSize: 9 },
                                    { text: item.article, fontSize: 9 },
                                    { text: item.unit, fontSize: 9 },
                                    { text: item.qty, fontSize: 9 },
                                    { text: item.unitPrice.toFixed(2), fontSize: 9 },
                                    { text: item.vatPercent.toFixed(1), fontSize: 9 },
                                    { text: item.vatValue.toFixed(2), fontSize: 9 },
                                    { text: item.total.toFixed(2), fontSize: 9 },
                                ]),
                            ],
                        },
                        layout: {
                            hLineWidth: function (i, node) {
                                return 0.5; // thickness of horizontal lines
                            },
                            vLineWidth: function () {
                                return 0; // remove vertical lines
                            },
                            hLineColor: function () {
                                return 'black'; // line color
                            },
                        },
                        margin: [0, 0, 0, 0] // space below table
                    }
                ]
            },
            // Totals
            {
                margin: [0, 0, 0, 0],
                table: {
                    widths: ['*', 'auto'],
                    body: [
                        [
                            { text: "Order Total", alignment: 'center', fontSize: 9 },
                            { text: data.summary?.orderTotal.toFixed(2), alignment: 'right', fontSize: 9 }
                        ],
                        [
                            { text: "VAT Total", alignment: 'center', fontSize: 9 },
                            { text: data.summary?.vatTotal.toFixed(2), alignment: 'right', fontSize: 9 }
                        ],
                        [
                            { text: "Gross Total - AED", alignment: 'center', fontSize: 9 },
                            { text: data.summary?.grossTotal.toFixed(2), alignment: 'right', fontSize: 9 }
                        ]
                    ]
                },
                layout: {
                    hLineWidth: function (i, node) {
                        // Remove the first horizontal line (i = 0), keep the rest
                        if (i === 0) return 0;
                        return 0.5;
                    },
                    vLineWidth: function () {
                        return 0; // no vertical lines
                    },
                    hLineColor: function () {
                        return 'black'; // color of line
                    }
                }
            }





        ],

        styles,
    };
}
