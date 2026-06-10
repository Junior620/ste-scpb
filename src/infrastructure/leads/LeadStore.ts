import { Redis } from '@upstash/redis';

const LEADS_KEY = 'leads:submissions';

function getRedisClient(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    return null;
  }

  return new Redis({ url, token });
}

export interface StoredLead {
  id: string;
  source: string;
  email: string;
  name?: string;
  company?: string;
  submittedAt: string;
  metadata?: Record<string, string | number | boolean | undefined>;
}

export function isLeadStorageAvailable(): boolean {
  return getRedisClient() !== null;
}

export async function persistLead(lead: StoredLead): Promise<void> {
  const redis = getRedisClient();
  if (!redis) {
    if (process.env.NODE_ENV === 'development') {
      console.log('[DEV] Lead storage unavailable, lead:', JSON.stringify(lead));
    }
    return;
  }

  await redis.lpush(LEADS_KEY, JSON.stringify(lead));
  await redis.ltrim(LEADS_KEY, 0, 4999);
}
