package com.lezzetdoner.backend.auth;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.List;

/**
 * Menu-only delegation: ask the authoritative cash/courier backend whether the
 * existing panel JWT currently has ADMIN rights. No shared JWT secret, no
 * password reuse, and no access to unrelated QR backend routes.
 * The remote endpoint must be an HTTPS GET /api/users restricted to ROLE_ADMIN.
 */
public final class RemotePanelAdminFilter extends OncePerRequestFilter {

    private final URI adminCheckUri;
    private final HttpClient client;

    public RemotePanelAdminFilter(String adminCheckUrl) {
        URI parsed = null;
        try {
            if (adminCheckUrl != null && !adminCheckUrl.isBlank()) {
                URI candidate = URI.create(adminCheckUrl.trim());
                if ("https".equalsIgnoreCase(candidate.getScheme())
                        && candidate.getHost() != null
                        && candidate.getUserInfo() == null
                        && "/api/users".equals(candidate.getPath())
                        && candidate.getQuery() == null
                        && candidate.getFragment() == null) {
                    parsed = candidate;
                }
            }
        } catch (IllegalArgumentException ignored) {
            // Fail closed if the server-only URL is not configured correctly.
        }
        this.adminCheckUri = parsed;
        this.client = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(3))
                .followRedirects(HttpClient.Redirect.NEVER)
                .build();
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        return !("/api/menu".equals(path) || path.startsWith("/api/menu/"));
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain chain
    ) throws ServletException, IOException {
        var existing = SecurityContextHolder.getContext().getAuthentication();
        if (existing != null && existing.isAuthenticated()) {
            // Preserve successful local QR-backend logins.
            chain.doFilter(request, response);
            return;
        }

        String authorization = request.getHeader(HttpHeaders.AUTHORIZATION);
        if (authorization == null || !authorization.startsWith("Bearer ")) {
            chain.doFilter(request, response); // Normal Spring authorization denies.
            return;
        }
        if (authorization.length() > 8200 || adminCheckUri == null) {
            response.sendError(HttpServletResponse.SC_SERVICE_UNAVAILABLE,
                    "Yönetici doğrulama bağlantısı kullanılamıyor.");
            return;
        }

        try {
            HttpRequest check = HttpRequest.newBuilder(adminCheckUri)
                    .timeout(Duration.ofSeconds(5))
                    .header(HttpHeaders.AUTHORIZATION, authorization)
                    .header(HttpHeaders.ACCEPT, "application/json")
                    .GET()
                    .build();
            HttpResponse<Void> result = client.send(
                    check, HttpResponse.BodyHandlers.discarding());
            if (result.statusCode() == 200) {
                var granted = new UsernamePasswordAuthenticationToken(
                        "panel-verified-admin", null,
                        List.of(new SimpleGrantedAuthority("ROLE_ADMIN")));
                SecurityContextHolder.getContext().setAuthentication(granted);
                chain.doFilter(request, response);
                return;
            }
            if (result.statusCode() == 401 || result.statusCode() == 403) {
                response.sendError(HttpServletResponse.SC_FORBIDDEN,
                        "Bu işlem için geçerli yönetici yetkisi gerekli.");
                return;
            }
            response.sendError(HttpServletResponse.SC_SERVICE_UNAVAILABLE,
                    "Yönetici doğrulama servisi yanıt vermedi.");
        } catch (InterruptedException interrupted) {
            Thread.currentThread().interrupt();
            response.sendError(HttpServletResponse.SC_SERVICE_UNAVAILABLE,
                    "Yönetici doğrulama isteği kesildi.");
        } catch (IOException | IllegalArgumentException failed) {
            response.sendError(HttpServletResponse.SC_SERVICE_UNAVAILABLE,
                    "Yönetici doğrulama servisine ulaşılamadı.");
        }
    }
}
