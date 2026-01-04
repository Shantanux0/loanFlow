package com.shantanu.LoanFlow.LoanService.controller;

import com.shantanu.LoanFlow.LoanService.dto.LoanRequest;
import com.shantanu.LoanFlow.LoanService.dto.LoanResponse;
import com.shantanu.LoanFlow.LoanService.dto.RepaymentRequest;
import com.shantanu.LoanFlow.LoanService.service.LoanService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/loans")
@RequiredArgsConstructor
public class LoanController {

    private final LoanService loanService;

    @PostMapping("/apply")
    public ResponseEntity<LoanResponse> applyLoan(@RequestHeader("X-User-Id") String userId,
            @RequestBody @Valid LoanRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(loanService.applyLoan(request, userId));
    }

    @GetMapping("/my")
    public ResponseEntity<List<LoanResponse>> getMyLoans(@RequestHeader("X-User-Id") String userId) {
        return ResponseEntity.ok(loanService.getLoansByUserId(userId));
    }

    @GetMapping("/{loanId}")
    public ResponseEntity<LoanResponse> getLoanById(@RequestHeader("X-User-Id") String userId,
            @PathVariable UUID loanId) {
        return ResponseEntity.ok(loanService.getLoanById(loanId, userId, false)); // false = not admin
    }

    @PostMapping("/{loanId}/repay")
    public ResponseEntity<String> repayLoan(@RequestHeader("X-User-Id") String userId,
            @PathVariable UUID loanId,
            @RequestBody @Valid RepaymentRequest request) {
        loanService.repayLoan(loanId, request.getAmount(), userId);
        return ResponseEntity.ok("Repayment successful");
    }
}
