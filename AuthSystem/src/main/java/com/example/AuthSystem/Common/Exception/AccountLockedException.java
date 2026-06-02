package com.example.AuthSystem.Common.Exception;

import org.springframework.web.bind.annotation.ExceptionHandler;

public class AccountLockedException extends RuntimeException{

    public AccountLockedException(String msg) { super(msg); }
}

// Handled in your @RestControllerAdvice
@ExceptionHandler(AccountLockedException.class)
public ResponseEntity<ErrorResponse> handleLocked(AccountLockedException ex) {
    return ResponseEntity
            .status(HttpStatus.LOCKED)                          // 423
            .body(new ErrorResponse(ex.getMessage()));
}
