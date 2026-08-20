package com.lezzetdoner.backend.auth;

import com.lezzetdoner.backend.user.AppUser;
import com.lezzetdoner.backend.user.AppUserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
public class JwtAuthenticationFilter
        extends OncePerRequestFilter {

    private final JwtService jwtService;

    private final AppUserRepository userRepository;

    public JwtAuthenticationFilter(
            JwtService jwtService,
            AppUserRepository userRepository
    ) {

        this.jwtService =
                jwtService;

        this.userRepository =
                userRepository;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        String authorizationHeader =
                request.getHeader(
                        HttpHeaders.AUTHORIZATION
                );

        if (
                authorizationHeader == null
                        ||
                        !authorizationHeader.startsWith(
                                "Bearer "
                        )
        ) {

            filterChain.doFilter(
                    request,
                    response
            );

            return;
        }

        String token =
                authorizationHeader
                        .substring(7)
                        .trim();

        try {

            JwtService.JwtPrincipal principal =
                    jwtService.validateAndRead(
                            token
                    );

            AppUser user =
                    userRepository
                            .findByEmail(
                                    principal.email()
                            )
                            .orElse(null);

            boolean validUser =
                    user != null
                            &&
                            user.isActive()
                            &&
                            user.getId()
                                    .equals(
                                            principal.userId()
                                    )
                            &&
                            user.getRole()
                                    == principal.role()
                            &&
                            user.getTokenVersion()
                                    == principal.tokenVersion();

            if (validUser) {

                String authority =
                        "ROLE_"
                                + user
                                .getRole()
                                .name();

                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(
                                user.getEmail(),
                                null,
                                List.of(
                                        new SimpleGrantedAuthority(
                                                authority
                                        )
                                )
                        );

                SecurityContextHolder
                        .getContext()
                        .setAuthentication(
                                authentication
                        );
            } else {

                SecurityContextHolder
                        .clearContext();
            }

        } catch (IllegalArgumentException exception) {

            SecurityContextHolder
                    .clearContext();
        }

        filterChain.doFilter(
                request,
                response
        );
    }
}