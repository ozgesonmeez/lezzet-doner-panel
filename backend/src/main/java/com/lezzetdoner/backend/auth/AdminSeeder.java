package com.lezzetdoner.backend.auth;

import com.lezzetdoner.backend.user.AppUser;
import com.lezzetdoner.backend.user.AppUserRepository;
import com.lezzetdoner.backend.user.UserRole;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Locale;

@Component
@ConditionalOnProperty(
        name = "app.bootstrap-admin.enabled",
        havingValue = "true"
)
public class AdminSeeder
        implements CommandLineRunner {

    private final AppUserRepository userRepository;

    private final PasswordEncoder passwordEncoder;

    private final String adminName;

    private final String adminEmail;

    private final String adminPassword;

    public AdminSeeder(
            AppUserRepository userRepository,
            PasswordEncoder passwordEncoder,

            @Value("${app.bootstrap-admin.name}")
            String adminName,

            @Value("${app.bootstrap-admin.email}")
            String adminEmail,

            @Value("${app.bootstrap-admin.password}")
            String adminPassword
    ) {

        this.userRepository =
                userRepository;

        this.passwordEncoder =
                passwordEncoder;

        this.adminName =
                adminName;

        this.adminEmail =
                adminEmail;

        this.adminPassword =
                adminPassword;
    }

    @Override
    public void run(
            String... args
    ) {

        validateConfiguration();

        String normalizedEmail =
                adminEmail
                        .trim()
                        .toLowerCase(
                                Locale.ROOT
                        );

        if (
                userRepository.existsByEmail(
                        normalizedEmail
                )
        ) {

            return;
        }

        AppUser admin =
                new AppUser(
                        adminName.trim(),
                        normalizedEmail,
                        passwordEncoder.encode(
                                adminPassword
                        ),
                        UserRole.ADMIN,
                        true
                );

        userRepository.save(
                admin
        );

        System.out.println(
                "Bootstrap ADMIN kullanıcısı oluşturuldu: "
                        + normalizedEmail
        );
    }

    private void validateConfiguration() {

        if (
                adminName == null
                        ||
                        adminName.isBlank()
        ) {

            throw new IllegalStateException(
                    "Bootstrap admin adı boş olamaz."
            );
        }

        if (
                adminEmail == null
                        ||
                        adminEmail.isBlank()
                        ||
                        !adminEmail.contains("@")
        ) {

            throw new IllegalStateException(
                    "Bootstrap admin e-posta adresi geçersiz."
            );
        }

        if (
                adminPassword == null
                        ||
                        adminPassword.length() < 12
        ) {

            throw new IllegalStateException(
                    "Bootstrap admin şifresi en az 12 karakter olmalıdır."
            );
        }
    }
}