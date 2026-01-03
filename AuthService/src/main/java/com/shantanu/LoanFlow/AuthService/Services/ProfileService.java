package com.shantanu.LoanFlow.AuthService.Services;


import com.shantanu.LoanFlow.AuthService.io.ProfileRequest;
import com.shantanu.LoanFlow.AuthService.io.ProfileResponse;

import java.util.List;

public interface ProfileService {

    // USER APIs
    ProfileResponse createProfile(ProfileRequest request);
    ProfileResponse getProfile(String email);
    void sendResetOtp(String email);
    void resetPassword(String email, String otp, String newPassword);
    void sendOtp(String email);
    void verifyOtp(String email, String otp);

    // ADMIN APIs 🔥
    List<ProfileResponse> getAllUsers();
    void forceVerifyUser(String email);
}

