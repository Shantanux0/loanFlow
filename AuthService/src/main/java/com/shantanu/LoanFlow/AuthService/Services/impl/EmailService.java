package com.shantanu.LoanFlow.AuthService.Services.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;


@Service
@RequiredArgsConstructor
public class EmailService {
    private final JavaMailSender javaMailSender;

    @Value("${spring.mail.properties.mail.smtp.from}")
    private String fromEmail;

    public void sendWelcomeEmail(String toEmail, String name) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(toEmail);
        message.setSubject("Welcome to Our Platform");
        message.setText("Hello "+name+",\n\nThanks for registering with us!\n\nRegards,\nCredSafe Team");
        javaMailSender.send(message);
    }

    public void sendResetOtpEmail(String toEmail, String otp) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(toEmail);
        message.setSubject("Password Reset OTP");
        message.setText("Your OTP for resetting your password is "+otp+". Use this OTP to proceed with resetting your password.");
        javaMailSender.send(message);
    }

    public void sendOtpEmail(String toEmail, String otp) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(toEmail);
        message.setSubject("Account Verification OTP");
        message.setText("Your OTP is "+otp+". Verify your account using this OTP.");
        javaMailSender.send(message);
    }


//    public void sendOtpEmail(String email, String otp) throws MessagingException {
//        Context context = new Context();
//        context.setVariable("email", email);
//        context.setVariable("otp", otp);
//
//        String process = templateEngine.process("verify-email", context);
//        MimeMessage mimeMessage =javaMailSender.createMimeMessage();
//        MimeMessageHelper helper = new MimeMessageHelper(mimeMessage);
//
//        helper.setFrom(fromEmail);
//        helper.setTo(email);
//        helper.setSubject("Account Verification OTP");
//        helper.setText(process, true);
//
//        javaMailSender.send(mimeMessage);
//    }
//
//    public void sendResetOtpEmail(String email, String otp) throws MessagingException {
//        Context context = new Context();
//        context.setVariable("email", email);
//        context.setVariable("otp", otp);
//
//        String process = templateEngine.process("password-reset-email", context);
//        MimeMessage mimeMessage =javaMailSender.createMimeMessage();
//        MimeMessageHelper helper = new MimeMessageHelper(mimeMessage);
//
//        helper.setFrom(fromEmail);
//        helper.setTo(email);
//        helper.setSubject("Forgot your password?");
//        helper.setText(process, true);
//
//        javaMailSender.send(mimeMessage);
//
//    }
}
