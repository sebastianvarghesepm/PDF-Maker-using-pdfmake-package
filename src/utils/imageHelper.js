import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export class ImageHelper {
    // Minimal, efficient image loader: accepts data URLs, http(s) URLs, or local paths.
    static async getImageDataUrl(imagePath) {
        if (!imagePath) return null;

        // Return early if already a data URL
        if (typeof imagePath === 'string' && imagePath.startsWith('data:image/')) return imagePath;

        try {
            if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
                const res = await fetch(imagePath);
                if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
                const buffer = Buffer.from(await res.arrayBuffer());
                const contentType = res.headers.get('content-type') || 'image/png';
                return `data:${contentType};base64,${buffer.toString('base64')}`;
            }

            // Local file: make absolute relative to project root if needed
            const absolutePath = path.isAbsolute(imagePath) ? imagePath : path.join(__dirname, '../../', imagePath);
            const fileBuffer = await fs.readFile(absolutePath);
            // Infer mime-type from extension (very small mapping)
            const ext = path.extname(absolutePath).toLowerCase();
            const mime = ext === '.png' ? 'image/png' : ext === '.gif' ? 'image/gif' : 'image/jpeg';
            return `data:${mime};base64,${fileBuffer.toString('base64')}`;
        } catch (err) {
            // On any error, return null and let template or caller decide fallback
            return null;
        }
    }

    // Convenience: convert multiple paths
    static async processImages(paths = []) {
        const entries = await Promise.all(paths.map(async p => [p, await this.getImageDataUrl(p)]));
        return Object.fromEntries(entries);
    }
}