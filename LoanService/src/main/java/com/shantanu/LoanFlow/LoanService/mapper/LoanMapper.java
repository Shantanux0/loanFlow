package com.shantanu.LoanFlow.LoanService.mapper;

import com.shantanu.LoanFlow.LoanService.dto.LoanRequest;
import com.shantanu.LoanFlow.LoanService.dto.LoanResponse;
import com.shantanu.LoanFlow.LoanService.entity.Loan;
import org.springframework.stereotype.Component;

@Component
public class LoanMapper {

    public Loan toEntity(LoanRequest request, String userId) {
        return Loan.builder()
                .userId(userId)
                .loanType(request.getLoanType())
                .principalAmount(request.getPrincipalAmount())
                .interestRate(request.getInterestRate())
                .tenureMonths(request.getTenureMonths())
                .status(Loan.LoanStatus.PENDING) // Default status
                .build();
    }

    public LoanResponse toResponse(Loan loan) {
        return LoanResponse.builder()
                .id(loan.getId())
                .userId(loan.getUserId())
                .loanType(loan.getLoanType())
                .principalAmount(loan.getPrincipalAmount())
                .interestRate(loan.getInterestRate())
                .tenureMonths(loan.getTenureMonths())
                .status(loan.getStatus())
                .createdAt(loan.getCreatedAt())
                .updatedAt(loan.getUpdatedAt())
                .build();
    }
}
