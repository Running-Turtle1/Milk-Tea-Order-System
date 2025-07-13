package com.cxy.milktea.common.security;

import com.cxy.milktea.admin.security.AdminDetailsServiceImpl;
import com.cxy.milktea.client.security.UserDetailsServiceImpl;
import com.cxy.milktea.common.service.TokenBlacklistService;
import com.cxy.milktea.common.util.JwtTokenProvider;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
@Slf4j
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenProvider tokenProvider;
    private final TokenBlacklistService tokenBlacklistService;
    private final AdminDetailsServiceImpl adminDetailsService;
    private final UserDetailsServiceImpl userDetailsService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        try {
            String jwt = getJwtFromRequest(request);

            if (StringUtils.hasText(jwt) && tokenProvider.validateToken(jwt)) {
                // 检查token是否在黑名单中
                if (tokenBlacklistService.isBlacklisted(jwt)) {
                    log.warn("Attempt to use blacklisted token");
                } else {
                    String username = tokenProvider.getUsernameFromToken(jwt);

                    // 根据请求路径决定使用哪个UserDetailsService
                    UserDetailsService service = getAppropriateUserDetailsService(request);
                    
                    UserDetails userDetails = service.loadUserByUsername(username);
                    UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                            userDetails, null, userDetails.getAuthorities());
                    authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                    SecurityContextHolder.getContext().setAuthentication(authentication);
                }
            }
        } catch (Exception e) {
            log.error("Could not set user authentication in security context", e);
        }

        filterChain.doFilter(request, response);
    }

    private String getJwtFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
    
    private UserDetailsService getAppropriateUserDetailsService(HttpServletRequest request) {
        String path = request.getRequestURI();
        
        // 考虑应用程序上下文路径/api
        if (path.contains("/admin")) {
            return adminDetailsService;
        } else {
            return userDetailsService;
        }
    }
} 