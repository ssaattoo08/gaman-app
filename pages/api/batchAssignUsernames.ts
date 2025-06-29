import type { NextApiRequest, NextApiResponse } from 'next';
import { batchAssignUsernames } from '../../lib/utils/generateNickname';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await batchAssignUsernames();
    res.status(200).json({ message: 'username一括付与が完了しました！' });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
} 