package com.lezzetdoner.backend.error;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<ApiErrorResponse> handleResponseStatusException(
            ResponseStatusException exception,
            HttpServletRequest request
    ) {

        String message =
                exception.getReason() != null
                        && !exception.getReason().isBlank()
                        ? exception.getReason()
                        : "İşlem gerçekleştirilemedi.";

        ApiErrorResponse response =
                new ApiErrorResponse(
                        exception.getStatusCode().value(),
                        message,
                        request.getRequestURI(),
                        Instant.now()
                );

        return ResponseEntity
                .status(
                        exception.getStatusCode()
                )
                .body(
                        response
                );
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiErrorResponse> handleValidationException(
            MethodArgumentNotValidException exception,
            HttpServletRequest request
    ) {

        String message =
                exception
                        .getBindingResult()
                        .getFieldErrors()
                        .stream()
                        .findFirst()
                        .map(error ->
                                error.getDefaultMessage()
                        )
                        .orElse(
                                "Gönderilen bilgiler geçersiz."
                        );

        ApiErrorResponse response =
                new ApiErrorResponse(
                        HttpStatus.BAD_REQUEST.value(),
                        message,
                        request.getRequestURI(),
                        Instant.now()
                );

        return ResponseEntity
                .badRequest()
                .body(
                        response
                );
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiErrorResponse> handleUnexpectedException(
            Exception exception,
            HttpServletRequest request
    ) {

        ApiErrorResponse response =
                new ApiErrorResponse(
                        HttpStatus.INTERNAL_SERVER_ERROR.value(),
                        "Beklenmeyen bir sunucu hatası oluştu.",
                        request.getRequestURI(),
                        Instant.now()
                );

        return ResponseEntity
                .status(
                        HttpStatus.INTERNAL_SERVER_ERROR
                )
                .body(
                        response
                );
    }

    private record ApiErrorResponse(
            int status,
            String message,
            String path,
            Instant timestamp
    ) {
    }
}