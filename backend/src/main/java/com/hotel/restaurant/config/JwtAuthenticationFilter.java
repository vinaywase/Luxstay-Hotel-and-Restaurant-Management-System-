package com.hotel.restaurant.config;

import com.hotel.restaurant.util.JwtUtil;
import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;

    public JwtAuthenticationFilter(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain) throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            try {
                if (jwtUtil.validateToken(token)) {
                    Claims claims = jwtUtil.extractClaims(token);
                    String username = claims.getSubject();
                    String role = claims.get("role", String.class);

                    System.out.println("[JWT] ✅ Valid token for user: " + username + ", role: " + role
                            + ", authority: ROLE_" + role);

                    // Spring Security expects "ROLE_" prefix for hasRole() checks
                    SimpleGrantedAuthority authority = new SimpleGrantedAuthority("ROLE_" + role);

                    UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                            username, null, List.of(authority));

                    SecurityContextHolder.getContext().setAuthentication(authentication);
                } else {
                    System.out.println("[JWT] ❌ Token validation failed for: " + request.getRequestURI());
                }
            } catch (Exception e) {
                // Invalid token — proceed as anonymous
                System.out.println("[JWT] ❌ Token error for " + request.getRequestURI() + ": " + e.getMessage());
                SecurityContextHolder.clearContext();
            }
        } else {
            System.out.println("[JWT] ⚠️ No Bearer token for: " + request.getRequestURI());
        }

        filterChain.doFilter(request, response);
    }
}
