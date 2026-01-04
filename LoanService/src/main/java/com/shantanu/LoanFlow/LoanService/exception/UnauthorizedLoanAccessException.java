package com.shantanu.LoanFlow.LoanService.exception;

public class UnauthorizedLoanAccessException extends RuntimeException {
    public UnauthorizedLoanAccessException(String message) {
        super(message);
    }
}
