package com.example.budget.repository;

import com.example.budget.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

/**
 * Repository interface for User entity operations.
 * 
 * Provides data access methods for user management, including email-based queries
 * for authentication and registration validation.
 */
public interface UserRepository extends JpaRepository<User, Long> {
    
    /**
     * Finds a user by email address.
     * 
     * @param email Email address to search forr
     * @return Optional containing the user if found, empty otherwise
     */
    Optional<User> findByEmail(String email);

    Optional<User> findByEmailIgnoreCase(String email);
    /**
     * Checks if a user with the given email exists.
     * 
     * @param email Email address to check
     * @return true if a user with the email exists, false otherwise
     */
    boolean existsByEmail(String email);

    List<User> findAllByOrderByCreatedAtDesc();

    List<User> findAllByApprovedTrueAndCommunicationEmailIsNotNull();
}
