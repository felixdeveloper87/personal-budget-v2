package com.example.budget.config;



import com.fasterxml.jackson.databind.ObjectMapper;

import com.fasterxml.jackson.databind.SerializationFeature;

import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;

import org.springframework.beans.factory.annotation.Value;

import org.springframework.cache.CacheManager;

import org.springframework.context.annotation.Bean;

import org.springframework.context.annotation.Configuration;

import org.springframework.data.redis.cache.RedisCacheConfiguration;

import org.springframework.data.redis.cache.RedisCacheManager;

import org.springframework.data.redis.connection.RedisConnectionFactory;

import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;

import org.springframework.data.redis.serializer.RedisSerializationContext;

import org.springframework.data.redis.serializer.StringRedisSerializer;



import java.time.Duration;



/**

 * Redis {@link CacheManager}; cache regions are invalidated programmatically (no {@code @Cacheable}).

 */

@Configuration

public class RedisCacheConfig {



    public static final String MONTHLY_SUMMARY_CACHE = "monthlySummary";

    public static final String TRANSACTIONS_LIST_CACHE = "transactionsList";

    public static final String INSTALLMENT_PLANS_LIST_CACHE = "installmentPlansList";

    public static final String RECURRING_LIST_CACHE = "recurringList";



    @Bean

    public CacheManager cacheManager(

            RedisConnectionFactory connectionFactory,

            @Value("${app.cache.monthly-summary-ttl-seconds:600}") int monthlySummaryTtlSeconds,

            @Value("${app.cache.user-list-ttl-seconds:600}") int userListTtlSeconds) {



        GenericJackson2JsonRedisSerializer jsonSerializer =

                new GenericJackson2JsonRedisSerializer(redisCacheObjectMapper());



        RedisCacheConfiguration listTtl = cacheConfiguration(Duration.ofSeconds(userListTtlSeconds), jsonSerializer);

        RedisCacheConfiguration summaryTtl = cacheConfiguration(Duration.ofSeconds(monthlySummaryTtlSeconds), jsonSerializer);



        return RedisCacheManager.builder(connectionFactory)

                .cacheDefaults(listTtl)

                .withCacheConfiguration(MONTHLY_SUMMARY_CACHE, summaryTtl)

                .withCacheConfiguration(TRANSACTIONS_LIST_CACHE, listTtl)

                .withCacheConfiguration(INSTALLMENT_PLANS_LIST_CACHE, listTtl)

                .withCacheConfiguration(RECURRING_LIST_CACHE, listTtl)

                .build();

    }



    private static RedisCacheConfiguration cacheConfiguration(

            Duration ttl,

            GenericJackson2JsonRedisSerializer valueSerializer) {

        return RedisCacheConfiguration.defaultCacheConfig()

                .entryTtl(ttl)

                .disableCachingNullValues()

                .serializeKeysWith(RedisSerializationContext.SerializationPair

                        .fromSerializer(new StringRedisSerializer()))

                .serializeValuesWith(RedisSerializationContext.SerializationPair

                        .fromSerializer(valueSerializer));

    }



    private static ObjectMapper redisCacheObjectMapper() {

        ObjectMapper mapper = new ObjectMapper();

        mapper.registerModule(new JavaTimeModule());

        mapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);

        return mapper;

    }

}

