package com.lezzetdoner.backend.auth;

import com.lezzetdoner.backend.auth.dto.AuthUserResponse;
import com.lezzetdoner.backend.auth.dto.LoginRequest;
import com.lezzetdoner.backend.auth.dto.LoginResponse;
import com.lezzetdoner.backend.user.AppUser;
import com.lezzetdoner.backend.user.AppUserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.Locale;

@Service
public class AuthService {

    private final AppUserRepository userRepository;

    private final PasswordEncoder passwordEncoder;

    private final JwtService jwtService;

    private final LoginAttemptService loginAttemptService;

    public AuthService(
            AppUserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            LoginAttemptService loginAttemptService
    ) {

        this.userRepository =
                userRepository;

        this.passwordEncoder =
                passwordEncoder;

        this.jwtService =
                jwtService;

        this.loginAttemptService =
                loginAttemptService;
    }

    @Transactional(readOnly = true)
    public LoginResponse login(
            LoginRequest request
    ) {

        String email =
                normalizeEmail(
                        request.email()
                );

        /*
         * Daha önce çok sayıda hatalı deneme yapıldıysa
         * parola kontrolüne bile geçmeden isteği durdurur.
         */
        loginAttemptService.checkAllowed(
                email
        );

        AppUser user =
                userRepository
                        .findByEmail(
                                email
                        )
                        .orElse(null);

        /*
         * Kullanıcının var olup olmadığına göre farklı
         * hata mesajı vermiyoruz. Böylece hesap keşfi
         * yapılmasını zorlaştırıyoruz.
         */
        if (user == null) {

            loginAttemptService.recordFailure(
                    email
            );

            throw unauthorized();
        }

        boolean passwordMatches =
                passwordEncoder.matches(
                        request.password(),
                        user.getPasswordHash()
                );

        if (!passwordMatches) {

            loginAttemptService.recordFailure(
                    email
            );

            throw unauthorized();
        }

        /*
         * Şifre doğruysa başarısız giriş sayacını sıfırlarız.
         */
        loginAttemptService.recordSuccess(
                email
        );

        if (!user.isActive()) {

            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Bu kullanıcı hesabı pasif durumda."
            );
        }

        String token =
                jwtService.generateToken(
                        user
                );

        AuthUserResponse userResponse =
                new AuthUserResponse(
                        user.getId(),
                        user.getFullName(),
                        user.getEmail(),
                        user.getRole().name()
                );

        return new LoginResponse(
                token,
                userResponse
        );
    }

    private ResponseStatusException unauthorized() {

        return new ResponseStatusException(
                HttpStatus.UNAUTHORIZED,
                "E-posta veya şifre hatalı."
        );
    }

    private String normalizeEmail(
            String email
    ) {

        return email
                .trim()
                .toLowerCase(
                        Locale.ROOT
                );
    }
}