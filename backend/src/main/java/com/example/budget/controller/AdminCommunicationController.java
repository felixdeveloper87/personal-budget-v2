package com.example.budget.controller;

import com.example.budget.dto.CommunicationEmailSendResponse;
import com.example.budget.dto.SendCommunicationEmailRequest;
import com.example.budget.model.User;
import com.example.budget.service.CommunicationEmailService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/communications")
@CrossOrigin
public class AdminCommunicationController {
    private final CommunicationEmailService communicationEmailService;

    public AdminCommunicationController(CommunicationEmailService communicationEmailService) {
        this.communicationEmailService = communicationEmailService;
    }

    @PostMapping("/email")
    public ResponseEntity<CommunicationEmailSendResponse> sendEmail(
            @Valid @RequestBody SendCommunicationEmailRequest request,
            Authentication authentication) {
        User admin = (User) authentication.getPrincipal();
        return ResponseEntity.ok(communicationEmailService.sendToConfiguredRecipients(request, admin));
    }
}
