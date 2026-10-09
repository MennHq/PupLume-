import type { VercelRequest, VercelResponse } from '@vercel/node';
import { processAIChat } from '../../src/server/geminiService';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const payload = req.body || {};
    const result = await processAIChat(payload);
    return res.status(200).json(result);
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || 'AI processing error' });
  }
}
