package com.shantanu.LoanFlow.LoanService.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class RepaymentRequest {
    @NotNull(message = "Amount is required")
    @DecimalMin(value = "1.0", message = "Minimum repayment amount is 1")
    private BigDecimal amount;
}
