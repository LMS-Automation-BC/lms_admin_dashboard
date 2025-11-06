// pages/api/organization.ts
import { redis } from '@/lib/redis';
import type { NextApiRequest, NextApiResponse } from 'next';


const ORG_KEY = 'organization:data';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const data = await redis.get(ORG_KEY);
    if (!data) return res.status(404).json({ error: 'Organization not found' });
    return res.status(200).json(data);
  }

  if (req.method === 'POST' || req.method === 'PUT') {
    const { name,role, address, phone, email, website } = req.body;

    const orgData = {
      name,
      role,
      address,
      phone,
      email,
      website,
    };

    await redis.set(ORG_KEY, orgData);
    return res.status(200).json({ message: 'Organization saved', data: orgData });
  }

  if (req.method === 'DELETE') {
    await redis.del(ORG_KEY);
    return res.status(200).json({ message: 'Organization deleted' });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
