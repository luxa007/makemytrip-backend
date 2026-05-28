package com.makemytrip.security;

import com.makemytrip.constants.AppConstants;
import jakarta.servlet.*;
import jakarta.servlet.http.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;
import java.util.List;

@Component
@RequiredArgsConstructor
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtTokenProvider tokenProvider;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain) throws ServletException, IOException {
        String header = request.getHeader(AppConstants.JWT_HEADER);
        if (header != null && header.startsWith(AppConstants.JWT_PREFIX)) {
            String token = header.substring(AppConstants.JWT_PREFIX.length());
            if (tokenProvider.validateToken(token)) {
                Long userId = tokenProvider.getUserIdFromToken(token);
                List<String> roles = tokenProvider.getRolesFromToken(token);
                List<String> effectiveRoles = roles != null ? roles : List.of("ROLE_USER");
                UserPrincipal principal = new UserPrincipal(userId, "", "", effectiveRoles);
                var auth = new UsernamePasswordAuthenticationToken(
                        principal, null,
                        effectiveRoles.stream().map(SimpleGrantedAuthority::new).toList());
                SecurityContextHolder.getContext().setAuthentication(auth);
            }
        }
        chain.doFilter(request, response);
    }
}
