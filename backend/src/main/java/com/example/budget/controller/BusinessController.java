package com.example.budget.controller;

import com.example.budget.dto.BusinessDTOs.ManualSessionRequest;
import com.example.budget.dto.BusinessDTOs.StartRequest;
import com.example.budget.dto.BusinessDTOs.Summary;
import com.example.budget.dto.BusinessDTOs.WorkSessionDTO;
import com.example.budget.model.User;
import com.example.budget.service.BusinessService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/business")
@CrossOrigin
public class BusinessController {
    private final BusinessService businessService;

    public BusinessController(BusinessService businessService) {
        this.businessService = businessService;
    }

    /** The running or paused session, or 204 when none is open. */
    @GetMapping("/sessions/active")
    public ResponseEntity<WorkSessionDTO> active(Authentication authentication) {
        WorkSessionDTO active = businessService.active(userId(authentication));
        return active == null ? ResponseEntity.noContent().build() : ResponseEntity.ok(active);
    }

    @PostMapping("/sessions/start")
    public WorkSessionDTO start(@RequestBody(required = false) StartRequest request, Authentication authentication) {
        return businessService.start(userId(authentication), request == null ? null : request.workDate());
    }

    @PostMapping("/sessions/{id}/pause")
    public WorkSessionDTO pause(@PathVariable Long id, Authentication authentication) {
        return businessService.pause(userId(authentication), id);
    }

    @PostMapping("/sessions/{id}/resume")
    public WorkSessionDTO resume(@PathVariable Long id, Authentication authentication) {
        return businessService.resume(userId(authentication), id);
    }

    @PostMapping("/sessions/{id}/end")
    public WorkSessionDTO end(@PathVariable Long id, Authentication authentication) {
        return businessService.end(userId(authentication), id);
    }

    @PostMapping("/sessions")
    @ResponseStatus(HttpStatus.CREATED)
    public WorkSessionDTO create(@Valid @RequestBody ManualSessionRequest request, Authentication authentication) {
        return businessService.createManual(userId(authentication), request);
    }

    @PutMapping("/sessions/{id}")
    public WorkSessionDTO update(
            @PathVariable Long id,
            @Valid @RequestBody ManualSessionRequest request,
            Authentication authentication) {
        return businessService.update(userId(authentication), id, request);
    }

    @DeleteMapping("/sessions/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id, Authentication authentication) {
        businessService.delete(userId(authentication), id);
    }

    @GetMapping("/summary")
    public Summary summary(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            Authentication authentication) {
        return businessService.summary(userId(authentication), from, to);
    }

    private static Long userId(Authentication authentication) {
        return ((User) authentication.getPrincipal()).getId();
    }
}
