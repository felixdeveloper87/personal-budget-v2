package com.example.budget.service;

import com.example.budget.dto.AdminUserResponse;
import com.example.budget.dto.UpdateUserPlanRequest;
import com.example.budget.dto.UpdateCommunicationEmailRequest;
import com.example.budget.exception.AccessDeniedException;
import com.example.budget.exception.EntityNotFoundException;
import com.example.budget.model.User;
import com.example.budget.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AdminUserService {

    private final UserRepository userRepository;

    public AdminUserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<AdminUserResponse> listAll(User principal) {
        requireAdmin(principal);
        return userRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public AdminUserResponse approve(Long userId, User principal) {
        requireAdmin(principal);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User", userId));
        user.setApproved(true);
        return toResponse(userRepository.save(user));
    }

    @Transactional
    public AdminUserResponse updatePlan(Long userId, UpdateUserPlanRequest request, User principal) {
        requireAdmin(principal);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User", userId));
        user.setPlan(request.getPlan());
        return toResponse(userRepository.save(user));
    }

    @Transactional
    public AdminUserResponse updateCommunicationEmail(Long userId, UpdateCommunicationEmailRequest request, User principal) {
        requireAdmin(principal);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User", userId));
        String email = request.getCommunicationEmail();
        user.setCommunicationEmail(email == null || email.isBlank() ? null : email.trim().toLowerCase());
        return toResponse(userRepository.save(user));
    }

    /**
     * Permanently removes a user (reject pending signups or delete an account). Not allowed on self.
     */
    @Transactional
    public void deleteUser(Long userId, User principal) {
        requireAdmin(principal);
        if (principal.getId().equals(userId)) {
            throw new IllegalArgumentException("You cannot delete your own account.");
        }
        User target = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User", userId));
        userRepository.delete(target);
    }

    private void requireAdmin(User principal) {
        if (principal == null || !principal.isAdmin()) {
            throw new AccessDeniedException("Administrator access required.");
        }
    }

    private AdminUserResponse toResponse(User u) {
        return new AdminUserResponse(
                u.getId(),
                u.getEmail(),
                u.getCommunicationEmail(),
                u.getName(),
                u.getCreatedAt(),
                u.isApproved(),
                u.isAdmin(),
                u.getPlan()
        );
    }
}
