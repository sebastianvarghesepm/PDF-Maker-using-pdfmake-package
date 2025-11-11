import { validate as uuidValidate } from 'uuid';

export function validateHeaders(req, res, next) {
    const org = req.header('organizationId');
    const report = req.header('reportId');

    if (!org || !report) {
        return res.status(400).json({ status: 'error', message: 'Missing organizationId or reportId' });
    }

    if (!uuidValidate(org) || !uuidValidate(report)) {
        return res.status(400).json({ status: 'error', message: 'Invalid GUID format' });
    }

    next();
}
