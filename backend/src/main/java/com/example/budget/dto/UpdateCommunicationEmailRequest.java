package com.example.budget.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;

/** The separate address used by administrators for non-authentication email. */
public class UpdateCommunicationEmailRequest {

    @Email(message = "Invalid communication email format")
    @Size(max = 255, message = "Communication email must not exceed 255 characters")
    private String communicationEmail;

    public String getCommunicationEmail() {
        return communicationEmail;
    }

    public void setCommunicationEmail(String communicationEmail) {
        this.communicationEmail = communicationEmail;
    }
}
