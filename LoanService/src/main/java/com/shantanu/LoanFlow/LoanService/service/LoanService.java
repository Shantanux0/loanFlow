package com.shantanu.LoanFlow.LoanService.service;

import com.shantanu.LoanFlow.LoanService.dto.*;
import com.shantanu.LoanFlow.LoanService.entity.Loan;
import com.shantanu.LoanFlow.LoanService.entity.Repayment;
import com.shantanu.LoanFlow.LoanService.exception.*;
import com.shantanu.LoanFlow.LoanService.mapper.LoanMapper;
import com.shantanu.LoanFlow.LoanService.repository.LoanRepository;
import com.shantanu.LoanFlow.LoanService.repository.RepaymentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LoanService {

    private final LoanRepository loanRepository;
    private final RepaymentRepository repaymentRepository;
    private final LoanMapper loanMapper;

    @Transactional
    public LoanResponse applyLoan(LoanRequest request, String userId) {
        // Business Rule: One active loan per user per loan type
        boolean existingLoan = loanRepository.existsByUserIdAndLoanTypeAndStatusIn(
                userId,
                request.getLoanType(),
                Arrays.asList(Loan.LoanStatus.PENDING, Loan.LoanStatus.APPROVED, Loan.LoanStatus.ACTIVE));

        if (existingLoan) {
            throw new InvalidLoanStateException("You already have an active or pending loan of this type.");
        }

        Loan loan = loanMapper.toEntity(request, userId);
        Loan savedLoan = loanRepository.save(loan);
        return loanMapper.toResponse(savedLoan);
    }

    public List<LoanResponse> getLoansByUserId(String userId) {
        return loanRepository.findByUserId(userId).stream()
                .map(loanMapper::toResponse)
                .collect(Collectors.toList());
    }

    public List<LoanResponse> getAllLoans() {
        return loanRepository.findAll().stream()
                .map(loanMapper::toResponse)
                .collect(Collectors.toList());
    }

    public LoanResponse getLoanById(UUID loanId, String userId, boolean isAdmin) {
        Loan loan = loanRepository.findById(loanId)
                .orElseThrow(() -> new LoanNotFoundException("Loan not found with ID: " + loanId));

        if (!isAdmin && !loan.getUserId().equals(userId)) {
            throw new UnauthorizedLoanAccessException("You are not authorized to view this loan.");
        }

        return loanMapper.toResponse(loan);
    }

    @Transactional
    public LoanResponse approveLoan(UUID loanId) {
        Loan loan = loanRepository.findById(loanId)
                .orElseThrow(() -> new LoanNotFoundException("Loan not found"));

        if (loan.getStatus() != Loan.LoanStatus.PENDING) {
            throw new InvalidLoanStateException("Loan is not in PENDING state.");
        }

        loan.setStatus(Loan.LoanStatus.APPROVED);
        return loanMapper.toResponse(loanRepository.save(loan));
    }

    @Transactional
    public LoanResponse rejectLoan(UUID loanId) {
        Loan loan = loanRepository.findById(loanId)
                .orElseThrow(() -> new LoanNotFoundException("Loan not found"));

        if (loan.getStatus() != Loan.LoanStatus.PENDING) {
            throw new InvalidLoanStateException("Loan is not in PENDING state.");
        }

        loan.setStatus(Loan.LoanStatus.REJECTED);
        return loanMapper.toResponse(loanRepository.save(loan));
    }

    @Transactional
    public void repayLoan(UUID loanId, BigDecimal amount, String userId) {
        Loan loan = loanRepository.findById(loanId)
                .orElseThrow(() -> new LoanNotFoundException("Loan not found"));

        if (!loan.getUserId().equals(userId)) {
            throw new UnauthorizedLoanAccessException("You are not authorized to repay this loan.");
        }

        if (loan.getStatus() != Loan.LoanStatus.APPROVED && loan.getStatus() != Loan.LoanStatus.ACTIVE) {
            throw new InvalidLoanStateException("Loan must be APPROVED or ACTIVE to make repayments.");
        }

        // Activate loan on first payment if it was just APPROVED (Simplified logic:
        // actually loan becomes active on disbursement usually, but let's say repayment
        // triggers ACTIVE or keeps it ACTIVE)
        // Better logic: If Approved, user essentially accepts it by paying? Or maybe
        // Admin disburses it.
        // Let's assume APPROVED means disbursed for simplicity. Any payment moves it to
        // ACTIVE if not already.
        if (loan.getStatus() == Loan.LoanStatus.APPROVED) {
            loan.setStatus(Loan.LoanStatus.ACTIVE);
        }

        // Calculate total paid so far
        List<Repayment> repayments = repaymentRepository.findByLoanId(loanId);
        BigDecimal totalPaid = repayments.stream()
                .map(Repayment::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Simple interest calculation or just Principal + Interest?
        // Let's assume Principal is the total amount to be paid back for simplicity in
        // this MVP,
        // OR calculate Total Repayable = Principal + (Principal * Rate * Tenure / 1200)

        BigDecimal totalRepayable = loan.getPrincipalAmount()
                .add(loan.getPrincipalAmount()
                        .multiply(loan.getInterestRate())
                        .multiply(BigDecimal.valueOf(loan.getTenureMonths()))
                        .divide(BigDecimal.valueOf(1200), 2, java.math.RoundingMode.HALF_UP));

        BigDecimal pendingAmount = totalRepayable.subtract(totalPaid);

        if (amount.compareTo(pendingAmount) > 0) {
            throw new InvalidLoanStateException("Repayment amount exceeds pending amount: " + pendingAmount);
        }

        Repayment repayment = Repayment.builder()
                .loanId(loanId)
                .amount(amount)
                .dueDate(LocalDate.now()) // MVP: assume paying today
                .paidDate(LocalDate.now())
                .status(Repayment.RepaymentStatus.PAID)
                .build();

        repaymentRepository.save(repayment);

        // Check if fully paid
        if (amount.compareTo(pendingAmount) == 0) {
            loan.setStatus(Loan.LoanStatus.CLOSED);
            loanRepository.save(loan);
        } else {
            loanRepository.save(loan); // Update status to ACTIVE if it was APPROVED
        }
    }
}
