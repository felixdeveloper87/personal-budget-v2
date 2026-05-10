package com.example.budget.cache;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cache.Cache;

/**
 * Isolates Redis (de)serialization failures so they never fail the HTTP request.
 */
public final class RedisCacheSafety {

    private static final Logger log = LoggerFactory.getLogger(RedisCacheSafety.class);

    private RedisCacheSafety() {
    }

    public static <T> T get(Cache cache, String key, Class<T> type) {
        try {
            return cache.get(key, type);
        } catch (RuntimeException ex) {
            log.warn("Redis cache get failed, evicting key [{}]: {}", key, ex.toString());
            try {
                cache.evict(key);
            } catch (RuntimeException evictEx) {
                log.debug("Redis cache evict after failed get: {}", evictEx.toString());
            }
            return null;
        }
    }

    public static void put(Cache cache, String key, Object value) {
        try {
            cache.put(key, value);
        } catch (RuntimeException ex) {
            log.warn("Redis cache put failed for key [{}]: {}", key, ex.toString());
        }
    }
}
