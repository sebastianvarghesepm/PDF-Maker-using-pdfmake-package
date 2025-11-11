import fs from 'fs/promises';
import path from 'path';

const TEMPLATES_ROOT = path.join(process.cwd(), 'templates');
const OUTPUT_ROOT = path.join(process.cwd(), 'output');

export async function templateExists(orgId, reportId) {
    const filePath = path.join(TEMPLATES_ROOT, orgId, `${reportId}.json`);
    try {
        await fs.access(filePath);
        return true;
    } catch {
        return false;
    }
}

export async function readTemplateJson(orgId, reportId) {
    const filePath = path.join(TEMPLATES_ROOT, orgId, `${reportId}.json`);
    try {
        const raw = await fs.readFile(filePath, 'utf8');
        return JSON.parse(raw);
    } catch (err) {
        throw err;
    }
}

export async function ensureOutputDir(orgId, reportId) {
    const dir = path.join(OUTPUT_ROOT, orgId, reportId);
    await fs.mkdir(dir, { recursive: true });
    return dir;
}

export function getOutputFilePath(orgId, reportId, pdfId) {
    return path.join('output', orgId, reportId, `${pdfId}.pdf`);
}

export async function writePdfBuffer(orgId, reportId, pdfId, buffer) {
    const dir = await ensureOutputDir(orgId, reportId);
    const filePath = path.join(dir, `${pdfId}.pdf`);
    await fs.writeFile(filePath, buffer);
    return filePath;
}
