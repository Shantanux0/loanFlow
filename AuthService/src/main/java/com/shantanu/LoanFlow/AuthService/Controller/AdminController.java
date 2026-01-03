package com.shantanu.LoanFlow.AuthService.Controller;

import com.shantanu.LoanFlow.AuthService.Services.ProfileService;
import com.shantanu.LoanFlow.AuthService.io.ProfileResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final ProfileService profileService;

    // 🔹 Get all users (ADMIN only)
    @GetMapping("/users")
    public List<ProfileResponse> getAllUsers() {
        return profileService.getAllUsers();
    }

    // 🔹 Force verify a user (ADMIN only)
    @PatchMapping("/verify-user/{email}")
    public void verifyUser(@PathVariable String email) {
        profileService.forceVerifyUser(email);
    }
}
