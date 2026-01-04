package com.shantanu.LoanFlow.AuthService.Controller;

import com.shantanu.LoanFlow.AuthService.Services.ProfileService;
import com.shantanu.LoanFlow.AuthService.Services.impl.EmailService;
import com.shantanu.LoanFlow.AuthService.common.ApiResponse;
import com.shantanu.LoanFlow.AuthService.io.ProfileRequest;
import com.shantanu.LoanFlow.AuthService.io.ProfileResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.CurrentSecurityContext;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/auth")
public class ProfileController {

    private final ProfileService profileService;
    private final EmailService emailService;

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<ProfileResponse> register(@Valid @RequestBody ProfileRequest request) {
        ProfileResponse response = profileService.createProfile(request);
        emailService.sendWelcomeEmail(response.getEmail(), response.getName());
        return ApiResponse.success(response, "Registration successful");
    }

    @GetMapping("/profile")
    public ApiResponse<ProfileResponse> getProfile(
            @CurrentSecurityContext(expression = "authentication?.name") String email) {
        return ApiResponse.success(profileService.getProfile(email));
    }
}
