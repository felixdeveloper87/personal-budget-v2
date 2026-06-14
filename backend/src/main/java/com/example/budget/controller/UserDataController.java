package com.example.budget.controller;

import com.example.budget.model.User;
import com.example.budget.service.UserDataExportService;
import com.example.budget.service.UserDataService;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.nio.charset.StandardCharsets;

/**
 * Self-service endpoints for the authenticated user to manage their own data.
 */
@RestController
@RequestMapping("/api/user")
@CrossOrigin
public class UserDataController {

    private final UserDataService userDataService;
    private final UserDataExportService exportService;

    public UserDataController(UserDataService userDataService, UserDataExportService exportService) {
        this.userDataService = userDataService;
        this.exportService = exportService;
    }

    @GetMapping(value = "/data/export", produces = "text/csv")
    public ResponseEntity<byte[]> exportAllData(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        String filename = "personal-budget-data-" + LocalDate.now() + ".csv";
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType("text/csv"))
                .header(HttpHeaders.CONTENT_DISPOSITION, ContentDisposition.attachment()
                        .filename(filename)
                        .build()
                        .toString())
                .body(exportService.exportAll(user).getBytes(StandardCharsets.UTF_8));
    }

    /**
     * Permanently deletes all financial data owned by the authenticated user
     * (transactions, installment plans, fixed payments, payment methods, accounts,
     * transfers, goals and budgets). The user account itself is kept.
     */
    @DeleteMapping("/data")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteAllData(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        userDataService.deleteAllData(user);
    }
}
