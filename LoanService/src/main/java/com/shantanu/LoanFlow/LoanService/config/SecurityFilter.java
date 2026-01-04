package com.shantanu.LoanFlow.LoanService.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class SecurityFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        String userId = request.getHeader("X-User-Id");
        String userRole = request.getHeader("X-User-Role");

        // Allow ACTUATOR endpoints or public endpoints if any (none for now)
        // But strictly for business logic:

        if (userId == null || userId.isEmpty()) {
            // Allow Swagger & H2 (if used locally)
            if (request.getRequestURI().contains("swagger") || request.getRequestURI().contains("api-docs")) {
                filterChain.doFilter(request, response);
                return;
            }

            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Missing X-User-Id header");
            return;
        }

        // For Admin routes, enforce role
        String path = request.getRequestURI();
        if (path.startsWith("/admin") && !"ADMIN".equals(userRole)) {
            response.sendError(HttpServletResponse.SC_FORBIDDEN, "Access Denied: Requires ADMIN role");
            return;
        }

        filterChain.doFilter(request, response);
    }
}
