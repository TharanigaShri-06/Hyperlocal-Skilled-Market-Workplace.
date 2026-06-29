package com.labor.workplace.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import com.labor.workplace.dto.ErrorResponse;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ErrorResponse> handleRuntimeException(
            RuntimeException ex) {

        ErrorResponse error = new ErrorResponse(ex.getMessage());

        return new ResponseEntity<>(
                error,
                HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(org.springframework.web.bind.MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationException(
            org.springframework.web.bind.MethodArgumentNotValidException ex) {

        String errors = ex.getBindingResult().getFieldErrors().stream()
                .map(org.springframework.validation.FieldError::getDefaultMessage)
                .collect(java.util.stream.Collectors.joining(", "));

        ErrorResponse error = new ErrorResponse(errors);

        return new ResponseEntity<>(
                error,
                HttpStatus.BAD_REQUEST);
    }
}