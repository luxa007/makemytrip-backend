package com.makemytrip.config;
import com.makemytrip.constants.AppConstants;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.*;
import org.springframework.data.redis.cache.*;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.serializer.*;
import java.time.Duration;
import java.util.Map;

@Configuration @EnableCaching
public class RedisConfig {
    @Bean
    public CacheManager cacheManager(RedisConnectionFactory factory) {
        RedisCacheConfiguration defaults = RedisCacheConfiguration.defaultCacheConfig()
                .serializeValuesWith(RedisSerializationContext.SerializationPair
                        .fromSerializer(new GenericJackson2JsonRedisSerializer()));
        Map<String, RedisCacheConfiguration> configs = Map.of(
                AppConstants.CACHE_FLIGHTS,          defaults.entryTtl(Duration.ofMinutes(5)),
                AppConstants.CACHE_HOTELS,           defaults.entryTtl(Duration.ofMinutes(5)),
                AppConstants.CACHE_FLIGHT_STATUS,    defaults.entryTtl(Duration.ofSeconds(60)),
                AppConstants.CACHE_PRICING,          defaults.entryTtl(Duration.ofMinutes(2)),
                AppConstants.CACHE_RECOMMENDATIONS,  defaults.entryTtl(Duration.ofMinutes(10))
        );
        return RedisCacheManager.builder(factory).cacheDefaults(defaults).withInitialCacheConfigurations(configs).build();
    }
}
