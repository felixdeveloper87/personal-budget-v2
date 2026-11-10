package com.example.budget.shared.exception;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpInputMessage;
import org.springframework.http.HttpStatus;
import org.springframework.http.converter.HttpMessageNotReadableException;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;

class GlobalExceptionHandlerTest {

    @Test
    void malformedRequestBodyReturnsBadRequest() {
        GlobalExceptionHandler handler = new GlobalExceptionHandler();
        HttpMessageNotReadableException exception = new HttpMessageNotReadableException(
                "JSON parse error",
                mock(HttpInputMessage.class));

        var response = handler.handleHttpMessageNotReadable(exception);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(response.getBody()).containsEntry("error", "Malformed request body");
    }

    @Test
    void unexpectedErrorDoesNotLeakItsInternalMessage() {
        GlobalExceptionHandler handler = new GlobalExceptionHandler();
        RuntimeException exception = new IllegalStateException(
                "could not execute statement; SQL [insert into users ...]; constraint [users_pkey]");

        var response = handler.handleRuntimeException(exception);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR);
        assertThat(response.getBody())
                .containsEntry("error", "An unexpected error occurred. Please try again.");
        assertThat(response.getBody().values()).noneMatch(value -> value.contains("SQL"));
    }
}
