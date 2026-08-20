package com.lezzetdoner.backend.auth;

import com.lezzetdoner.backend.user.AppUser;
import com.lezzetdoner.backend.user.UserRole;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.ObjectMapper;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.Base64;
import java.util.LinkedHashMap;
import java.util.Map;

@Service
public class JwtService {

    private static final String HMAC_ALGORITHM =
            "HmacSHA256";

    private static final int MAX_TOKEN_LENGTH =
            8192;

    private final ObjectMapper objectMapper;

    private final byte[] secret;

    private final long expirationSeconds;

    public JwtService(
            ObjectMapper objectMapper,

            @Value("${security.jwt.secret}")
            String secret,

            @Value("${security.jwt.expiration-seconds:28800}")
            long expirationSeconds
    ) {

        if (
                secret == null
                        ||
                        secret.length() < 32
        ) {

            throw new IllegalStateException(
                    "JWT secret en az 32 karakter olmalıdır."
            );
        }

        if (
                expirationSeconds <= 0
        ) {

            throw new IllegalStateException(
                    "JWT geçerlilik süresi sıfırdan büyük olmalıdır."
            );
        }

        this.objectMapper =
                objectMapper;

        this.secret =
                secret.getBytes(
                        StandardCharsets.UTF_8
                );

        this.expirationSeconds =
                expirationSeconds;
    }

    public String generateToken(
            AppUser user
    ) {

        try {

            long now =
                    Instant.now()
                            .getEpochSecond();

            long expiresAt =
                    now
                            + expirationSeconds;

            Map<String, Object> header =
                    new LinkedHashMap<>();

            header.put(
                    "alg",
                    "HS256"
            );

            header.put(
                    "typ",
                    "JWT"
            );

            Map<String, Object> payload =
                    new LinkedHashMap<>();

            payload.put(
                    "sub",
                    user.getEmail()
            );

            payload.put(
                    "role",
                    user.getRole()
                            .name()
            );

            payload.put(
                    "uid",
                    user.getId()
            );

            payload.put(
                    "tv",
                    user.getTokenVersion()
            );

            payload.put(
                    "iat",
                    now
            );

            payload.put(
                    "exp",
                    expiresAt
            );

            String encodedHeader =
                    encodeJson(
                            header
                    );

            String encodedPayload =
                    encodeJson(
                            payload
                    );

            String unsignedToken =
                    encodedHeader
                            + "."
                            + encodedPayload;

            String signature =
                    sign(
                            unsignedToken
                    );

            return unsignedToken
                    + "."
                    + signature;

        } catch (Exception exception) {

            throw new IllegalStateException(
                    "JWT oluşturulamadı.",
                    exception
            );
        }
    }

    public JwtPrincipal validateAndRead(
            String token
    ) {

        try {

            if (
                    token == null
                            ||
                            token.isBlank()
                            ||
                            token.length() > MAX_TOKEN_LENGTH
            ) {

                throw new IllegalArgumentException(
                        "Geçersiz token."
                );
            }

            String[] parts =
                    token.split(
                            "\\.",
                            -1
                    );

            if (
                    parts.length != 3
                            ||
                            parts[0].isBlank()
                            ||
                            parts[1].isBlank()
                            ||
                            parts[2].isBlank()
            ) {

                throw new IllegalArgumentException(
                        "Geçersiz token."
                );
            }

            String unsignedToken =
                    parts[0]
                            + "."
                            + parts[1];

            byte[] expectedSignature =
                    decodeBase64(
                            sign(
                                    unsignedToken
                            )
                    );

            byte[] providedSignature =
                    decodeBase64(
                            parts[2]
                    );

            if (
                    !MessageDigest.isEqual(
                            expectedSignature,
                            providedSignature
                    )
            ) {

                throw new IllegalArgumentException(
                        "Token imzası geçersiz."
                );
            }

            Map<String, Object> header =
                    decodeJson(
                            parts[0]
                    );

            Object algorithm =
                    header.get(
                            "alg"
                    );

            if (
                    algorithm == null
                            ||
                            !"HS256".equals(
                                    algorithm.toString()
                            )
            ) {

                throw new IllegalArgumentException(
                        "Token algoritması geçersiz."
                );
            }

            Map<String, Object> payload =
                    decodeJson(
                            parts[1]
                    );

            Object subjectValue =
                    payload.get(
                            "sub"
                    );

            Object roleObject =
                    payload.get(
                            "role"
                    );

            Object userIdValue =
                    payload.get(
                            "uid"
                    );

            Object tokenVersionValue =
                    payload.get(
                            "tv"
                    );

            Object issuedAtValue =
                    payload.get(
                            "iat"
                    );

            Object expirationValue =
                    payload.get(
                            "exp"
                    );

            if (
                    subjectValue == null
                            ||
                            roleObject == null
                            ||
                            !(userIdValue instanceof Number)
                            ||
                            !(tokenVersionValue instanceof Number)
                            ||
                            !(issuedAtValue instanceof Number)
                            ||
                            !(expirationValue instanceof Number)
            ) {

                throw new IllegalArgumentException(
                        "Token içeriği geçersiz."
                );
            }

            String email =
                    subjectValue
                            .toString();

            String roleValue =
                    roleObject
                            .toString();

            long userId =
                    ((Number) userIdValue)
                            .longValue();

            long tokenVersion =
                    ((Number) tokenVersionValue)
                            .longValue();

            long issuedAt =
                    ((Number) issuedAtValue)
                            .longValue();

            long expiration =
                    ((Number) expirationValue)
                            .longValue();

            long now =
                    Instant.now()
                            .getEpochSecond();

            if (
                    now >= expiration
            ) {

                throw new IllegalArgumentException(
                        "Token süresi dolmuş."
                );
            }

            /*
             * Saat farkı / clock skew için küçük tolerans.
             * Token gelecekte üretilmiş görünmemeli.
             */
            if (
                    issuedAt > now + 60
            ) {

                throw new IllegalArgumentException(
                        "Token oluşturulma zamanı geçersiz."
                );
            }

            if (
                    expiration <= issuedAt
            ) {

                throw new IllegalArgumentException(
                        "Token zaman bilgileri geçersiz."
                );
            }

            UserRole role =
                    UserRole.valueOf(
                            roleValue
                    );

            return new JwtPrincipal(
                    userId,
                    email,
                    role,
                    tokenVersion
            );

        } catch (Exception exception) {

            throw new IllegalArgumentException(
                    "Geçersiz veya süresi dolmuş token.",
                    exception
            );
        }
    }

    private Map<String, Object> decodeJson(
            String value
    ) throws Exception {

        byte[] json =
                Base64
                        .getUrlDecoder()
                        .decode(
                                value
                        );

        return objectMapper.readValue(
                json,
                new TypeReference<
                        Map<String, Object>
                        >() {
                }
        );
    }

    private String encodeJson(
            Map<String, Object> data
    ) throws Exception {

        byte[] json =
                objectMapper
                        .writeValueAsBytes(
                                data
                        );

        return Base64
                .getUrlEncoder()
                .withoutPadding()
                .encodeToString(
                        json
                );
    }

    private String sign(
            String value
    ) throws Exception {

        Mac mac =
                Mac.getInstance(
                        HMAC_ALGORITHM
                );

        SecretKeySpec key =
                new SecretKeySpec(
                        secret,
                        HMAC_ALGORITHM
                );

        mac.init(
                key
        );

        byte[] signature =
                mac.doFinal(
                        value.getBytes(
                                StandardCharsets.UTF_8
                        )
                );

        return Base64
                .getUrlEncoder()
                .withoutPadding()
                .encodeToString(
                        signature
                );
    }

    private byte[] decodeBase64(
            String value
    ) {

        return Base64
                .getUrlDecoder()
                .decode(
                        value
                );
    }

    public record JwtPrincipal(
            long userId,
            String email,
            UserRole role,
            long tokenVersion
    ) {
    }
}