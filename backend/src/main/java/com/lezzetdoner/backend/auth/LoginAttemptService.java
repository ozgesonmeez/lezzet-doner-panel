package com.lezzetdoner.backend.auth;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.Duration;
import java.time.Instant;
import java.util.Comparator;
import java.util.Locale;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class LoginAttemptService {

    private static final int MAX_TRACKED_ENTRIES =
            5000;

    private final int maxAttempts;

    private final Duration lockDuration;

    private final Map<String, AttemptState> attempts =
            new ConcurrentHashMap<>();

    public LoginAttemptService(
            @Value("${security.login.max-attempts:5}")
            int maxAttempts,

            @Value("${security.login.lock-minutes:15}")
            long lockMinutes
    ) {

        if (maxAttempts < 1) {
            throw new IllegalStateException(
                    "Login maksimum deneme sayısı en az 1 olmalıdır."
            );
        }

        if (lockMinutes < 1) {
            throw new IllegalStateException(
                    "Login kilit süresi en az 1 dakika olmalıdır."
            );
        }

        this.maxAttempts =
                maxAttempts;

        this.lockDuration =
                Duration.ofMinutes(
                        lockMinutes
                );
    }

    public void checkAllowed(
            String email
    ) {

        String key =
                normalizeEmail(
                        email
                );

        AttemptState state =
                attempts.get(
                        key
                );

        if (state == null) {
            return;
        }

        Instant now =
                Instant.now();

        if (
                state.lockedUntil() != null
                        &&
                        now.isBefore(
                                state.lockedUntil()
                        )
        ) {

            long secondsRemaining =
                    Math.max(
                            1,
                            Duration.between(
                                    now,
                                    state.lockedUntil()
                            ).getSeconds()
                    );

            long minutesRemaining =
                    Math.max(
                            1,
                            (secondsRemaining + 59) / 60
                    );

            throw new ResponseStatusException(
                    HttpStatus.TOO_MANY_REQUESTS,
                    "Çok fazla başarısız giriş denemesi yapıldı. Yaklaşık "
                            + minutesRemaining
                            + " dakika sonra tekrar deneyin."
            );
        }

        if (
                state.lockedUntil() != null
                        &&
                        !now.isBefore(
                                state.lockedUntil()
                        )
        ) {

            attempts.remove(
                    key
            );
        }
    }

    public void recordFailure(
            String email
    ) {

        String key =
                normalizeEmail(
                        email
                );

        Instant now =
                Instant.now();

        attempts.compute(
                key,
                (ignored, current) -> {

                    if (
                            current != null
                                    &&
                                    current.lockedUntil() != null
                                    &&
                                    now.isBefore(
                                            current.lockedUntil()
                                    )
                    ) {

                        return current;
                    }

                    int failures =
                            current == null
                                    ? 1
                                    : current.failures() + 1;

                    Instant lockedUntil =
                            failures >= maxAttempts
                                    ? now.plus(
                                            lockDuration
                                    )
                                    : null;

                    return new AttemptState(
                            failures,
                            lockedUntil,
                            now
                    );
                }
        );

        trimIfNecessary();
    }

    public void recordSuccess(
            String email
    ) {

        attempts.remove(
                normalizeEmail(
                        email
                )
        );
    }

    private void trimIfNecessary() {

        if (
                attempts.size()
                        <= MAX_TRACKED_ENTRIES
        ) {

            return;
        }

        attempts.entrySet()
                .stream()
                .min(
                        Comparator.comparing(
                                entry ->
                                        entry.getValue()
                                                .lastAttemptAt()
                        )
                )
                .map(
                        Map.Entry::getKey
                )
                .ifPresent(
                        attempts::remove
                );
    }

    private String normalizeEmail(
            String email
    ) {

        if (email == null) {
            return "";
        }

        return email
                .trim()
                .toLowerCase(
                        Locale.ROOT
                );
    }

    private record AttemptState(
            int failures,
            Instant lockedUntil,
            Instant lastAttemptAt
    ) {
    }
}