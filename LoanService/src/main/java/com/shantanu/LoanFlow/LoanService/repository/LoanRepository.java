package com.shantanu.LoanFlow.LoanService.repository;

import com.shantanu.LoanFlow.LoanService.entity.Loan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface LoanRepository extends JpaRepository<Loan, UUID> {
    List<Loan> findByUserId(String userId);

    boolean existsByUserIdAndLoanTypeAndStatusIn(String userId, Loan.LoanType loanType, List<Loan.LoanStatus> statuses);
}
