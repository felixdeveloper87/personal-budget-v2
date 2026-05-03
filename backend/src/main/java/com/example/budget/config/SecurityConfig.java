package com.example.budget.config;

import com.example.budget.security.JwtAuthenticationFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.http.HttpMethod;

/**
 * Security configuration class for Spring Security.
 * 
 * Configures authentication, authorization, CORS, and JWT token-based security.
 * This class sets up stateless authentication using JWT tokens and defines
 * which endpoints require authentication.
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    /**
     * Creates a PasswordEncoder bean using BCrypt hashing algorithm.
     * 
     * BCrypt is a strong, adaptive hashing function that automatically handles salt generation
     * and is designed to be slow enough to prevent brute-force attacks.
     * 
     * @return BCryptPasswordEncoder instance for password hashing
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /**
     * Configures CORS (Cross-Origin Resource Sharing) settings for the application.
     * 
     * Allows requests from:
     * - Production domains (personalbudget.co.uk)
     * - Staging/Vercel deployments (*.vercel.app)
     * - Local development (localhost with any port)
     * 
     * All HTTP methods and headers are allowed, and credentials are enabled for authenticated requests.
     * 
     * @return CorsConfigurationSource with configured CORS settings
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // Production domains
        configuration.addAllowedOrigin("https://www.personalbudget.co.uk");
        configuration.addAllowedOrigin("https://api.personalbudget.co.uk");

        // Staging / Vercel deployments (wildcard pattern)
        configuration.addAllowedOriginPattern("https://*.vercel.app");

        // Local development (any port)
        configuration.addAllowedOriginPattern("http://localhost:*");

        // Allow all HTTP methods (GET, POST, PUT, DELETE, etc.)
        configuration.addAllowedMethod("*");
        
        // Allow all headers
        configuration.addAllowedHeader("*");
        
        // Enable credentials (cookies, authorization headers) for cross-origin requests
        configuration.setAllowCredentials(true);
        
        // Cache preflight requests for 1 hour
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    /**
     * Configures the security filter chain with authentication and authorization rules.
     * 
     * Security settings:
     * - CORS: Enabled using the configured CORS source
     * - CSRF: Disabled (not needed for stateless JWT-based authentication)
     * - Session: Stateless (no server-side session storage)
     * - JWT Filter: Applied before username/password authentication
     * 
     * Public endpoints (no authentication required):
     * - /api/auth/** - Authentication endpoints (login, register)
     * - /health - Health check endpoint
     * - OPTIONS requests - CORS preflight requests
     * 
     * Protected endpoints (authentication required):
     * - /api/transactions/** - Transaction management
     * - /api/summary/** - Summary and reports
     * - /api/installment-plans/** - Installment plan management
     * - /api/recurring-transactions/** - Fixed (recurring) transaction management
     * - All other requests require authentication
     * 
     * @param http HttpSecurity builder for configuring security
     * @return Configured SecurityFilterChain
     * @throws Exception if configuration fails
     */
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            // Enable CORS using the configured CORS source
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            
            // Disable CSRF protection (not needed for stateless JWT authentication)
            .csrf(csrf -> csrf.disable())
            
            // Use stateless session management (no server-side session storage)
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            
            // Configure authorization rules
            .authorizeHttpRequests(auth -> auth
                // Public endpoints
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/health").permitAll()
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll() // CORS preflight requests
                
                // Protected endpoints (require authentication)
                .requestMatchers("/api/transactions/**").authenticated()
                .requestMatchers("/api/summary/**").authenticated()
                .requestMatchers("/api/installment-plans/**").authenticated()
                .requestMatchers("/api/recurring-transactions/**").authenticated()

                // All other requests require authentication
                .anyRequest().authenticated()
            )
            
            // Add JWT authentication filter before the default username/password filter
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
