import express from 'express';
import { validateHeaders } from '../src/middleware/validateHeaders.js';
import { generatePdf } from '../src/utils/pdfGenerator.js';

const router = express.Router();

// POST /api/generate
router.post('/generate', validateHeaders, async (req, res) => {
    const organizationId = req.header('organizationId');
    const reportId = req.header('reportId');
    const payload = req.body;

    if (!payload || typeof payload !== 'object') {
        return res.status(400).json({ status: 'error', message: 'invalid input' });
    }

    try {
        const result = await generatePdf(organizationId, reportId, payload.data || {});
        return res.json({ status: 'success', pdfId: result.pdfId, pdfPath: result.pdfPath });
    } catch (err) {
        // standardized error messages
        if (err.message === 'Organization not found') return res.status(404).json({ status: 'error', message: 'organization not found' });
        if (err.message === 'Report not found') return res.status(404).json({ status: 'error', message: 'report not found' });
        console.error('PDF generation error:', err);
        return res.status(500).json({ status: 'error', message: 'Failed to generate PDF' });
    }
});

export default router;
