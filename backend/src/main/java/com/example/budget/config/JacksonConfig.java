package com.example.budget.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

/**
 * Configuration class for Jackson JSON serialization/deserialization.
 * 
 * Customizes the ObjectMapper used by Spring Boot to convert Java objects to/from JSON.
 * This ensures consistent and readable JSON formatting across the entire application.
 */
@Configuration
public class JacksonConfig {

    /**
     * Creates a custom ObjectMapper bean with optimized settings for REST APIs.
     * 
     * @Primary annotation ensures this bean is used instead of Spring Boot's default ObjectMapper.
     * 
     * Key configurations:
     * - JavaTimeModule: Enables proper serialization of Java 8+ time types (LocalDate, LocalDateTime, etc.)
     * - WRITE_DATES_AS_TIMESTAMPS disabled: Dates are serialized as ISO-8601 strings instead of timestamps
     * - FAIL_ON_EMPTY_BEANS disabled: Prevents errors when serializing empty objects
     * 
     * @return Configured ObjectMapper instance
     */
    @Bean
    @Primary
    public ObjectMapper objectMapper() {
        ObjectMapper mapper = new ObjectMapper();
        
        // Register Java 8+ time module for LocalDate, LocalDateTime, etc.
        mapper.registerModule(new JavaTimeModule());
        
        // Serialize dates as ISO-8601 strings (e.g., "2024-01-01T12:00:00") instead of timestamps
        mapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
        
        // Allow serialization of empty beans without throwing exceptions
        mapper.disable(SerializationFeature.FAIL_ON_EMPTY_BEANS);
        
        return mapper;
    }
}
