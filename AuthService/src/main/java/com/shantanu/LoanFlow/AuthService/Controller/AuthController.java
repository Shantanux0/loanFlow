package com.shantanu.LoanFlow.AuthService.Controller;

import com.shantanu.LoanFlow.AuthService.Services.ProfileService;
import com.shantanu.LoanFlow.AuthService.Services.impl.AppUserDetailsService;
import com.shantanu.LoanFlow.AuthService.Utils.JwtUtil;
import com.shantanu.LoanFlow.AuthService.common.ApiResponse;
import com.shantanu.LoanFlow.AuthService.io.AuthRequest;
import com.shantanu.LoanFlow.AuthService.io.AuthResponse;
import com.shantanu.LoanFlow.AuthService.io.ProfileRequest;
import com.shantanu.LoanFlow.AuthService.io.ProfileResponse;
import com.shantanu.LoanFlow.AuthService.io.ResetPasswordRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.annotation.CurrentSecurityContext;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.Duration;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final AppUserDetailsService appUserDetailsService;

    private final JwtUtil jwtUtil;

    private final ProfileService profileService;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@RequestBody AuthRequest request) {
        authenticate(request.getEmail(), request.getPassword());

        // Update last login
        profileService.updateLastLogin(request.getEmail());

        final UserDetails userDetails = appUserDetailsService.loadUserByUsername(request.getEmail());
        final String accessToken = jwtUtil.generateToken(userDetails);
        final String refreshToken = jwtUtil.generateRefreshToken(userDetails);

        // Access Token Cookie (Short-lived)
        ResponseCookie accessCookie = ResponseCookie.from("jwt", accessToken)
                .httpOnly(true)
                .path("/")
                .maxAge(Duration.ofMinutes(15)) // 15 mins
                .sameSite("Lax")
                .build();

        // Refresh Token Cookie (Long-lived, path restricted)
        ResponseCookie refreshCookie = ResponseCookie.from("refresh_jwt", refreshToken)
                .httpOnly(true)
                .path("/auth/refresh-token") // Only sent to refresh endpoint
                .maxAge(Duration.ofDays(7)) // 7 days
                .sameSite("Lax")
                .build();

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, accessCookie.toString())
                .header(HttpHeaders.SET_COOKIE, refreshCookie.toString())
                .body(ApiResponse.success(new AuthResponse(request.getEmail(), accessToken), "Login successful"));
    }

    @PostMapping("/refresh-token")
    public ResponseEntity<ApiResponse<AuthResponse>> refreshToken(
            @CookieValue(name = "refresh_jwt", required = false) String refreshToken) {

        if (refreshToken == null || !jwtUtil.isTokenValid(refreshToken)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Invalid or expired refresh token", "AUTH_401"));
        }

        String email = jwtUtil.extractEmail(refreshToken);
        final UserDetails userDetails = appUserDetailsService.loadUserByUsername(email);
        final String newAccessToken = jwtUtil.generateToken(userDetails);

        // New Access Token Cookie
        ResponseCookie accessCookie = ResponseCookie.from("jwt", newAccessToken)
                .httpOnly(true)
                .path("/")
                .maxAge(Duration.ofMinutes(15))
                .sameSite("Lax")
                .build();

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, accessCookie.toString())
                .body(ApiResponse.success(new AuthResponse(email, newAccessToken), "Token refreshed"));
    }

    private void authenticate(String email, String password) {
        if (profileService.isAccountLocked(email)) {
            throw new ResponseStatusException(HttpStatus.LOCKED,
                    "Account is locked due to too many failed attempts. Try again in 15 minutes.");
        }

        try {
            authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(email, password));
            profileService.resetFailedAttempts(email);
        } catch (BadCredentialsException e) {
            profileService.increaseFailedAttempts(email);
            throw e;
        }
    }

    @GetMapping("/is-authenticated")
    public ResponseEntity<ApiResponse<Boolean>> isAuthenticated(
            @CurrentSecurityContext(expression = "authentication?.name") String email) {
        return ResponseEntity.ok(ApiResponse.success(email != null));
    }

    @PostMapping("/send-reset-otp")
    public ResponseEntity<ApiResponse<Void>> sendResetOtp(@RequestParam String email) {
        profileService.sendResetOtp(email);
        return ResponseEntity.ok(ApiResponse.success(null, "Reset OTP sent"));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<Void>> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        profileService.resetPassword(request.getEmail(), request.getOtp(), request.getNewPassword());
        return ResponseEntity.ok(ApiResponse.success(null, "Password reset successfully"));
    }

    @PostMapping("/send-otp")
    public ResponseEntity<ApiResponse<Void>> sendVerifyOtp(@RequestParam String email) {
        profileService.sendOtp(email);
        return ResponseEntity.ok(ApiResponse.success(null, "Verification OTP sent"));
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<ApiResponse<Void>> verifyEmail(@RequestBody Map<String, Object> request) {
        if (request.get("otp") == null || request.get("email") == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Missing OTP or Email");
        }

        profileService.verifyOtp(request.get("email").toString(), request.get("otp").toString());
        return ResponseEntity.ok(ApiResponse.success(null, "Email verified successfully"));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<String>> logout(HttpServletResponse response) {
        ResponseCookie jwtCookie = ResponseCookie.from("jwt", "")
                .httpOnly(true)
                .secure(false)
                .path("/")
                .maxAge(0)
                .sameSite("Lax")
                .build();

        ResponseCookie refreshCookie = ResponseCookie.from("refresh_jwt", "")
                .httpOnly(true)
                .secure(false)
                .path("/auth/refresh-token")
                .maxAge(0)
                .sameSite("Lax")
                .build();

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, jwtCookie.toString())
                .header(HttpHeaders.SET_COOKIE, refreshCookie.toString())
                .body(ApiResponse.success("Logged out successfully!"));
    }

    @PostMapping("/register-admin")
    public ResponseEntity<ApiResponse<ProfileResponse>> registerAdmin(@Valid @RequestBody ProfileRequest request) {
        ProfileResponse response = profileService.createAdminProfile(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Admin account created"));
    }

}
