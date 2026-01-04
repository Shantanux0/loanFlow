package com.shantanu.LoanFlow.ApiGateway.filter;

import com.shantanu.LoanFlow.ApiGateway.util.JwtUtil;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.http.HttpCookie;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

@Component
public class RoleFilter extends AbstractGatewayFilterFactory<RoleFilter.Config> {

    private final JwtUtil jwtUtil;

    public RoleFilter(JwtUtil jwtUtil) {
        super(Config.class);
        this.jwtUtil = jwtUtil;
    }

    @Override
    public GatewayFilter apply(Config config) {
        return (exchange, chain) -> {
            // 1. Get Token (Assumes AuthenticationFilter ran first OR we re-extract)
            // Ideally, AuthenticationFilter mutates request to add "X-Role" header
            // But for safety, let's re-extract or read header if present.

            // Let's rely on Cookie for now as header might be spoofed unless we sanitize.
            // In a real production system, the AuthFilter should strip user-supplied X-Role
            // headers
            // and add its own. Here we trust the cookie signature.

            String token = extractToken(exchange);

            if (token == null || !jwtUtil.validateToken(token)) {
                return onError(exchange, "Unauthorized", HttpStatus.UNAUTHORIZED);
            }

            String userRole = jwtUtil.extractRole(token);
            if (config.getRole() != null && !config.getRole().equals(userRole)) {
                return onError(exchange, "Forbidden: Required " + config.getRole(), HttpStatus.FORBIDDEN);
            }

            return chain.filter(exchange);
        };
    }

    private String extractToken(ServerWebExchange exchange) {
        HttpCookie cookie = exchange.getRequest().getCookies().getFirst("jwt");
        return cookie != null ? cookie.getValue() : null;
    }

    private Mono<Void> onError(ServerWebExchange exchange, String err, HttpStatus httpStatus) {
        exchange.getResponse().setStatusCode(httpStatus);
        return exchange.getResponse().setComplete();
    }

    public static class Config {
        private String role;

        public String getRole() {
            return role;
        }

        public void setRole(String role) {
            this.role = role;
        }
    }
}
