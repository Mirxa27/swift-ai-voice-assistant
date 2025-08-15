import Redis from 'ioredis'

const getRedisUrl = () => {
  if (process.env.REDIS_URL) {
    return process.env.REDIS_URL
  }
  throw new Error('REDIS_URL is not defined')
}

export const redis = new Redis(getRedisUrl(), {
  maxRetriesPerRequest: 3,
  retryStrategy(times) {
    const delay = Math.min(times * 50, 2000)
    return delay
  },
  reconnectOnError(err) {
    const targetError = 'READONLY'
    if (err.message.includes(targetError)) {
      return true
    }
    return false
  },
})

redis.on('error', (error) => {
  console.error('Redis Client Error:', error)
})

redis.on('connect', () => {
  console.log('Redis Client Connected')
})

// Cache utility functions
export const cache = {
  async get<T>(key: string): Promise<T | null> {
    const value = await redis.get(key)
    if (value) {
      try {
        return JSON.parse(value) as T
      } catch {
        return value as T
      }
    }
    return null
  },

  async set(key: string, value: any, ttl?: number): Promise<void> {
    const serialized = typeof value === 'string' ? value : JSON.stringify(value)
    if (ttl) {
      await redis.set(key, serialized, 'EX', ttl)
    } else {
      await redis.set(key, serialized)
    }
  },

  async del(key: string): Promise<void> {
    await redis.del(key)
  },

  async exists(key: string): Promise<boolean> {
    const result = await redis.exists(key)
    return result === 1
  },

  async expire(key: string, ttl: number): Promise<void> {
    await redis.expire(key, ttl)
  },

  async keys(pattern: string): Promise<string[]> {
    return await redis.keys(pattern)
  },

  async flush(): Promise<void> {
    await redis.flushdb()
  },
}

// Session management
export const sessions = {
  async create(userId: string, token: string, ttl = 86400): Promise<void> {
    await cache.set(`session:${token}`, { userId, createdAt: new Date() }, ttl)
  },

  async get(token: string): Promise<{ userId: string; createdAt: Date } | null> {
    return await cache.get(`session:${token}`)
  },

  async destroy(token: string): Promise<void> {
    await cache.del(`session:${token}`)
  },

  async refresh(token: string, ttl = 86400): Promise<void> {
    await cache.expire(`session:${token}`, ttl)
  },
}

export default redis