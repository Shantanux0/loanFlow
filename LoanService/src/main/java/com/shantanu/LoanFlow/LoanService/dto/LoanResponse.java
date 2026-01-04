package com.shantanu.LoanFlow.LoanService.dto;

import com.shantanu.LoanFlow.LoanService.entity.Loan;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class LoanResponse {
    private UUID id;
    private String userId;
    private Loan.LoanType loanType;
    private BigDecimal principalAmount;
    private BigDecimal interestRate;
    private Integer tenureMonths;
    private Loan.LoanStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
