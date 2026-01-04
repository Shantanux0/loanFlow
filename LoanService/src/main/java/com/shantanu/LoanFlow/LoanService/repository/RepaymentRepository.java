package com.shantanu.LoanFlow.LoanService.repository;

import com.shantanu.LoanFlow.LoanService.entity.Repayment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface RepaymentRepository extends JpaRepository<Repayment, UUID> {
    List<Repayment> findByLoanId(UUID loanId);
}
