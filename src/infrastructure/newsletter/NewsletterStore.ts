import { Redis } from '@upstash/redis';

const SUBSCRIBED_KEY = 'newsletter:subscribed';
const pendingKey = (token: string) => `newsletter:pending:${token}`;

function getRedisClient(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    return null;
  }

  return new Redis({ url, token });
}

export function isNewsletterStorageAvailable(): boolean {
  return getRedisClient() !== null;
}

export async function isNewsletterSubscribed(email: string): Promise<boolean> {
  const redis = getRedisClient();
  if (!redis) {
    throw new Error('Newsletter storage is not configured');
  }

  const result = await redis.sismember(SUBSCRIBED_KEY, email);
  return result === 1;
}

export async function savePendingNewsletterConfirmation(
  token: string,
  email: string,
  expiresInSeconds: number
): Promise<void> {
  const redis = getRedisClient();
  if (!redis) {
    throw new Error('Newsletter storage is not configured');
  }

  await redis.set(pendingKey(token), email, { ex: expiresInSeconds });
}

export async function confirmNewsletterSubscription(token: string): Promise<string | null> {
  const redis = getRedisClient();
  if (!redis) {
    throw new Error('Newsletter storage is not configured');
  }

  const email = await redis.get<string>(pendingKey(token));
  if (!email) {
    return null;
  }

  await redis.sadd(SUBSCRIBED_KEY, email);
  await redis.del(pendingKey(token));

  return email;
}

export async function removePendingNewsletterConfirmation(token: string): Promise<void> {
  const redis = getRedisClient();
  if (!redis) {
    return;
  }

  await redis.del(pendingKey(token));
}
