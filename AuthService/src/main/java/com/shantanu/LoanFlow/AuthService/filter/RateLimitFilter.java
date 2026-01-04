package com.shantanu.LoanFlow.AuthService.filter;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.shantanu.LoanFlow.AuthService.Services.impl.RateLimitingService;
import com.shantanu.LoanFlow.AuthService.common.ApiResponse;
import io.github.bucket4j.Bucket;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
@RequiredArgsConstructor
public class RateLimitFilter extends OncePerRequestFilter {

    private final RateLimitingService rateLimitingService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    {
        objectMapper.findAndRegisterModules();
        objectMapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
    }

    // List of endpoints to rate limit
    private final List<String> PROTECTED_ENDPOINTS = List.of(
            "/auth/login",
            "/auth/send-otp",
            "/auth/verify-otp",
            "/auth/send-reset-otp",
            "/auth/reset-password",
            "/auth/refresh-token");

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        // Check if request targets a protected endpoint
        String requestUri = request.getRequestURI();
        boolean isProtected = PROTECTED_ENDPOINTS.stream().anyMatch(requestUri::startsWith)
                && !"OPTIONS".equalsIgnoreCase(request.getMethod());

        if (isProtected) {
            String ip = getClientIP(request);
            Bucket bucket = rateLimitingService.resolveBucket(ip);

            if (!bucket.tryConsume(1)) {
                // Limit exceeded
                response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
                response.setContentType(MediaType.APPLICATION_JSON_VALUE);

                ApiResponse<Void> apiResponse = ApiResponse.error("Too many requests. Please try again later.",
                        "AUTH_429");
                response.getWriter().write(objectMapper.writeValueAsString(apiResponse));
                return;
            }
        }

        filterChain.doFilter(request, response);
    }

    private String getClientIP(HttpServletRequest request) {
        String xfHeader = request.getHeader("X-Forwarded-For");
        if (xfHeader == null) {
            return request.getRemoteAddr();
        }
        return xfHeader.split(",")[0];
    }
}
