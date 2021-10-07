import { Router, Request, Response } from 'express';
import db from '../utils/db';

export async function getSettings(req: Request, res: Response) {
    res.json(db.settings);
}

const router = Router();

router.get('/', getSettings);

export default router;