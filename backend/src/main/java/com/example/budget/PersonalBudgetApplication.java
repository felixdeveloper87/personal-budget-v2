package com.example.budget;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * Main entry point for the Personal Budget application.
 * 
 * Spring Boot application that provides RESTful API endpoints for managing
 * personal financial transactions, installment plans, and user authentication.
 */
@SpringBootApplication
@EnableScheduling
public class PersonalBudgetApplication {
    
    /**
     * Main method to start the Spring Boot application.
     * 
     * @param args Command line arguments
     */
    public static void main(String[] args) {
        SpringApplication.run(PersonalBudgetApplication.class, args);
    }
}
