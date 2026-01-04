package com.shantanu.LoanFlow.LoanService.dto;

import com.shantanu.LoanFlow.LoanService.entity.Loan;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class LoanRequest {
    @NotNull(message = "Loan type is required")
    private Loan.LoanType loanType;

    @NotNull(message = "Principal amount is required")
    @DecimalMin(value = "1000.0", message = "Minimum loan amount is 1000")
    private BigDecimal principalAmount;

    @NotNull(message = "Interest rate is required")
    @DecimalMin(value = "1.0", message = "Minimum interest rate is 1%")
    private BigDecimal interestRate;

    @NotNull(message = "Tenure is required")
    private Integer tenureMonths;
}
