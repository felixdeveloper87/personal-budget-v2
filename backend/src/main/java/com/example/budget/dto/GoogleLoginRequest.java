package com.example.budget.dto;

import com.fasterxml.jackson.annotation.JsonAlias;

import jakarta.validation.constraints.NotBlank;

/**
 * Google Identity Services credential (JWT ID token) sent after the user signs in in the browser.
 */
public class GoogleLoginRequest {

    @NotBlank(message = "Google credential is required")
    @JsonAlias({ "idToken", "credential" })
    private String idToken;

    public String getIdToken() {
        return idToken;
    }

    public void setIdToken(String idToken) {
        this.idToken = idToken;
    }
}
