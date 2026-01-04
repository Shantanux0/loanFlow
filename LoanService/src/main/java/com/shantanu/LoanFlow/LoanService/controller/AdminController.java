package com.shantanu.LoanFlow.LoanService.controller;

import com.shantanu.LoanFlow.LoanService.dto.LoanResponse;
import com.shantanu.LoanFlow.LoanService.service.LoanService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/admin/loans")
@RequiredArgsConstructor
public class AdminController {

    private final LoanService loanService;

    @GetMapping
    public ResponseEntity<List<LoanResponse>> getAllLoans() {
        return ResponseEntity.ok(loanService.getAllLoans());
    }

    @PutMapping("/{loanId}/approve")
    public ResponseEntity<LoanResponse> approveLoan(@PathVariable UUID loanId) {
        return ResponseEntity.ok(loanService.approveLoan(loanId));
    }

    @PutMapping("/{loanId}/reject")
    public ResponseEntity<LoanResponse> rejectLoan(@PathVariable UUID loanId) {
        return ResponseEntity.ok(loanService.rejectLoan(loanId));
    }
}
