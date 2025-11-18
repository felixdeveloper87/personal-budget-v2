package com.example.budget.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * REST controller for health check endpoint.
 * 
 * Provides a simple endpoint to verify that the application is running.
 * Used by monitoring systems and load balancers to check application availability.
 */
@RestController
public class HealthController {

    /**
     * Health check endpoint.
     * 
     * Returns a simple "OK" response to indicate the application is running.
     * This endpoint is typically used for health monitoring and load balancer checks.
     * 
     * @return "OK" string indicating the application is healthy
     */
    @GetMapping("/health")
    public String health() {
        return "OK";
    }
}
