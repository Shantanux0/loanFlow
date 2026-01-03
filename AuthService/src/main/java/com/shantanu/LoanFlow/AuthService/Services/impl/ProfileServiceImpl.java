package com.shantanu.LoanFlow.AuthService.Services.impl;

import com.shantanu.LoanFlow.AuthService.Repository.UserRepo;
import com.shantanu.LoanFlow.AuthService.Services.ProfileService;
import com.shantanu.LoanFlow.AuthService.entities.Role;
import com.shantanu.LoanFlow.AuthService.entities.UserEntity;
import com.shantanu.LoanFlow.AuthService.io.ProfileRequest;
import com.shantanu.LoanFlow.AuthService.io.ProfileResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;
import java.util.concurrent.ThreadLocalRandom;

@Service
@RequiredArgsConstructor
public class ProfileServiceImpl implements ProfileService {

    private final UserRepo userRepo;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    // ================= USER METHODS =================

    @Override
    public ProfileResponse createProfile(ProfileRequest request) {

        if (userRepo.existsByEmail(request.getEmail())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Email already exists"
            );
        }

        UserEntity newUser = convertToUserEntity(request);
        userRepo.save(newUser);

        return mapToProfileResponse(newUser);
    }

    @Override
    public ProfileResponse getProfile(String email) {
        UserEntity user = userRepo.findByEmail(email)
                .orElseThrow(() ->
                        new UsernameNotFoundException("User not found: " + email));

        return mapToProfileResponse(user);
    }

    @Override
    public void sendResetOtp(String email) {
        UserEntity user = userRepo.findByEmail(email)
                .orElseThrow(() ->
                        new UsernameNotFoundException("User not found: " + email));

        String otp = String.valueOf(
                ThreadLocalRandom.current().nextInt(100000, 1000000)
        );

        user.setResetOtp(otp);
        user.setResetOtpExpireAt(System.currentTimeMillis() + (15 * 60 * 1000));

        userRepo.save(user);
        emailService.sendResetOtpEmail(user.getEmail(), otp);
    }

    @Override
    public void resetPassword(String email, String otp, String newPassword) {

        UserEntity user = userRepo.findByEmail(email)
                .orElseThrow(() ->
                        new UsernameNotFoundException("User not found: " + email));

        if (!otp.equals(user.getResetOtp())) {
            throw new RuntimeException("Invalid OTP");
        }

        if (user.getResetOtpExpireAt() < System.currentTimeMillis()) {
            throw new RuntimeException("OTP Expired");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        user.setResetOtp(null);
        user.setResetOtpExpireAt(0L);

        userRepo.save(user);
    }

    @Override
    public void sendOtp(String email) {
        UserEntity user = userRepo.findByEmail(email)
                .orElseThrow(() ->
                        new UsernameNotFoundException("User not found: " + email));

        if (Boolean.TRUE.equals(user.getIsAccountVerified())) {
            return;
        }

        String otp = String.valueOf(
                ThreadLocalRandom.current().nextInt(100000, 1000000)
        );

        user.setVerifyOtp(otp);
        user.setVerifyOtpExpireAt(System.currentTimeMillis() + (24 * 60 * 60 * 1000));

        userRepo.save(user);
        emailService.sendOtpEmail(user.getEmail(), otp);
    }

    @Override
    public void verifyOtp(String email, String otp) {

        UserEntity user = userRepo.findByEmail(email)
                .orElseThrow(() ->
                        new UsernameNotFoundException("User not found: " + email));

        if (!otp.equals(user.getVerifyOtp())) {
            throw new RuntimeException("Invalid OTP");
        }

        if (user.getVerifyOtpExpireAt() < System.currentTimeMillis()) {
            throw new RuntimeException("OTP Expired");
        }

        user.setIsAccountVerified(true);
        user.setVerifyOtp(null);
        user.setVerifyOtpExpireAt(0L);

        userRepo.save(user);
    }

    // ================= ADMIN METHODS =================

    @Override
    public List<ProfileResponse> getAllUsers() {
        return userRepo.findAll()
                .stream()
                .map(this::mapToProfileResponse)
                .toList();
    }

    @Override
    public void forceVerifyUser(String email) {
        UserEntity user = userRepo.findByEmail(email)
                .orElseThrow(() ->
                        new UsernameNotFoundException("User not found: " + email));

        user.setIsAccountVerified(true);
        user.setVerifyOtp(null);
        user.setVerifyOtpExpireAt(0L);

        userRepo.save(user);
    }

    // ================= MAPPERS =================

    private ProfileResponse mapToProfileResponse(UserEntity user) {
        return ProfileResponse.builder()
                .userId(user.getUserId())
                .name(user.getName())
                .email(user.getEmail())
                .isAccountVerified(user.getIsAccountVerified())
                .build();
    }

    private UserEntity convertToUserEntity(ProfileRequest request) {
        return UserEntity.builder()
                .userId(UUID.randomUUID().toString())
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.USER)
                .isAccountVerified(false)
                .resetOtp(null)
                .resetOtpExpireAt(0L)
                .verifyOtp(null)
                .verifyOtpExpireAt(0L)
                .build();
    }
}
