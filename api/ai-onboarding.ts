import type { VercelRequest, VercelResponse } from '@vercel/node';
import { processAIOnboardingChat } from '../src/server/geminiService';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const payload = req.body || {};
    const result = await processAIOnboardingChat(payload);
    return res.status(200).json(result);
  } catch (error: any) {
    console.error('[API ai-onboarding] Error:', error);
    return res.status(500).json({ error: error?.message || 'AI onboarding failed' });
  }
}
