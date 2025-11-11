import PdfPrinter from 'pdfmake';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { readTemplateJson, writePdfBuffer } from './fileHelper.js';
import { ImageHelper } from './imageHelper.js';
import fs from 'fs';

// Setup fonts (use ./fonts if available, otherwise fallback to pdfmake bundled fonts)
const __dirname = path.dirname(new URL(import.meta.url).pathname);
const fontsDir = path.join(process.cwd(), 'fonts');

function getFonts() {
    const roboto = {
        normal: path.join(fontsDir, 'Roboto-Regular.ttf'),
        bold: path.join(fontsDir, 'Roboto-Medium.ttf'),
        italics: path.join(fontsDir, 'Roboto-Italic.ttf'),
        bolditalics: path.join(fontsDir, 'Roboto-MediumItalic.ttf')
    };

    // if fonts exist, return them, else try pdfmake default path
    try {
        if (fs.existsSync(roboto.normal)) return { Roboto: roboto };
    } catch { }

    // fallback - node_modules path
    const fallback = {
        Roboto: {
            normal: path.join(process.cwd(), 'node_modules', 'pdfmake', 'fonts', 'Roboto', 'Roboto-Regular.ttf'),
            bold: path.join(process.cwd(), 'node_modules', 'pdfmake', 'fonts', 'Roboto', 'Roboto-Medium.ttf'),
            italics: path.join(process.cwd(), 'node_modules', 'pdfmake', 'fonts', 'Roboto', 'Roboto-Italic.ttf'),
            bolditalics: path.join(process.cwd(), 'node_modules', 'pdfmake', 'fonts', 'Roboto', 'Roboto-MediumItalic.ttf')
        }
    };
    return fallback;
}

const printer = new PdfPrinter(getFonts());

// Simple placeholder resolver: replaces strings like "{{path.to.value}}" with values from data
function resolvePlaceholders(obj, data) {
    if (obj == null) return obj;
    if (typeof obj === 'string') {
        return obj.replace(/{{\s*([^}]+)\s*}}/g, (_, expr) => {
            try {
                const parts = expr.split('.');
                let cur = data;
                for (const p of parts) {
                    if (cur == null) return '';
                    cur = cur[p];
                }
                return cur == null ? '' : String(cur);
            } catch {
                return '';
            }
        });
    }
    if (Array.isArray(obj)) return obj.map(i => resolvePlaceholders(i, data));
    if (typeof obj === 'object') {
        const out = {};
        for (const [k, v] of Object.entries(obj)) {
            out[k] = resolvePlaceholders(v, data);
        }
        return out;
    }
    return obj;
}

async function resolveImages(node) {
    if (!node || typeof node !== 'object') return node;
    if (Array.isArray(node)) {
        for (let i = 0; i < node.length; i++) node[i] = await resolveImages(node[i]);
        return node;
    }

    const result = {};
    for (const [k, v] of Object.entries(node)) {
        if (k === 'image' && typeof v === 'string' && v) {
            const dataUrl = await ImageHelper.getImageDataUrl(v);
            result[k] = dataUrl || v; // keep original if conversion failed (pdfmake can accept local path)
        } else {
            result[k] = await resolveImages(v);
        }
    }
    return result;
}

export async function generatePdf(organizationId, reportId, data) {
    // load template JSON
    const templateExistsPath = await (async () => {
        try {
            const tmpl = await readTemplateJson(organizationId, reportId);
            return tmpl;
        } catch (err) {
            if (err.code === 'ENOENT') {
                // distinguish not found
                throw new Error('Report not found');
            }
            throw err;
        }
    })();

    const templateJson = templateExistsPath;

    // resolve placeholders
    let docDefinition = resolvePlaceholders(templateJson, { data });

    // ensure styles and defaultStyle
    docDefinition.styles = docDefinition.styles || {};
    docDefinition.defaultStyle = docDefinition.defaultStyle || { font: 'Roboto' };

    // resolve images
    docDefinition = await resolveImages(docDefinition);

    // create pdf
    const pdfDoc = printer.createPdfKitDocument(docDefinition);
    const chunks = [];
    return new Promise((resolve, reject) => {
        pdfDoc.on('data', c => chunks.push(c));
        pdfDoc.on('end', async () => {
            const buffer = Buffer.concat(chunks);
            const pdfId = uuidv4();
            try {
                const outPath = await writePdfBuffer(organizationId, reportId, pdfId, buffer);
                resolve({ pdfId, pdfPath: outPath });
            } catch (err) {
                reject(err);
            }
        });
        pdfDoc.on('error', reject);
        pdfDoc.end();
    });
}
