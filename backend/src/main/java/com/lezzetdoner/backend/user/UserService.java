package com.lezzetdoner.backend.user;

import com.lezzetdoner.backend.user.dto.CreateUserRequest;
import com.lezzetdoner.backend.user.dto.ResetPasswordRequest;
import com.lezzetdoner.backend.user.dto.UpdateUserRequest;
import com.lezzetdoner.backend.user.dto.UserResponse;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Locale;

@Service
public class UserService {

    private final AppUserRepository userRepository;

    private final PasswordEncoder passwordEncoder;

    public UserService(
            AppUserRepository userRepository,
            PasswordEncoder passwordEncoder
    ) {

        this.userRepository =
                userRepository;

        this.passwordEncoder =
                passwordEncoder;
    }

    @Transactional(readOnly = true)
    public List<UserResponse> getUsers() {

        return userRepository
                .findAll()
                .stream()
                .sorted(
                        (first, second) ->
                                first
                                        .getFullName()
                                        .compareToIgnoreCase(
                                                second.getFullName()
                                        )
                )
                .map(
                        this::toResponse
                )
                .toList();
    }

    @Transactional
    public UserResponse createUser(
            CreateUserRequest request
    ) {

        String email =
                normalizeEmail(
                        request.email()
                );

        if (
                userRepository.existsByEmail(
                        email
                )
        ) {

            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Bu e-posta adresi zaten kullanılıyor."
            );
        }

        AppUser user =
                new AppUser(
                        normalizeText(
                                request.fullName()
                        ),
                        email,
                        passwordEncoder.encode(
                                request.password()
                        ),
                        request.role(),
                        true
                );

        return toResponse(
                userRepository.save(
                        user
                )
        );
    }

    @Transactional
    public UserResponse updateUser(
            Long userId,
            UpdateUserRequest request,
            String authenticatedEmail
    ) {

        AppUser authenticatedUser =
                getAuthenticatedAdmin(
                        authenticatedEmail
                );

        AppUser user =
                getUserOrThrow(
                        userId
                );

        protectOwnAdminAccount(
                authenticatedUser,
                user,
                request
        );

        protectLastActiveAdmin(
                user,
                request
        );

        String email =
                normalizeEmail(
                        request.email()
                );

        userRepository
                .findByEmail(
                        email
                )
                .filter(existing ->
                        !existing
                                .getId()
                                .equals(
                                        userId
                                )
                )
                .ifPresent(existing -> {

                    throw new ResponseStatusException(
                            HttpStatus.CONFLICT,
                            "Bu e-posta adresi başka bir kullanıcı tarafından kullanılıyor."
                    );
                });

        user.setFullName(
                normalizeText(
                        request.fullName()
                )
        );

        user.setEmail(
                email
        );

        user.setRole(
                request.role()
        );

        user.setActive(
                request.active()
        );

        return toResponse(
                userRepository.save(
                        user
                )
        );
    }

    @Transactional
    public void resetPassword(
            Long userId,
            ResetPasswordRequest request
    ) {

        AppUser user =
                getUserOrThrow(
                        userId
                );

        user.setPasswordHash(
                passwordEncoder.encode(
                        request.password()
                )
        );

        /*
         * Kullanıcının daha önce verilmiş tüm JWT'lerini
         * anında geçersiz hale getirir.
         */
        user.incrementTokenVersion();

        userRepository.save(
                user
        );
    }

    private void protectOwnAdminAccount(
            AppUser authenticatedUser,
            AppUser targetUser,
            UpdateUserRequest request
    ) {

        boolean editingOwnAccount =
                authenticatedUser
                        .getId()
                        .equals(
                                targetUser.getId()
                        );

        if (!editingOwnAccount) {

            return;
        }

        if (
                request.role()
                        != UserRole.ADMIN
        ) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Kendi yönetici rolünüzü değiştiremezsiniz."
            );
        }

        if (!request.active()) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Kendi hesabınızı pasife alamazsınız."
            );
        }
    }

    private void protectLastActiveAdmin(
            AppUser targetUser,
            UpdateUserRequest request
    ) {

        boolean currentlyActiveAdmin =
                targetUser.isActive()
                        &&
                        targetUser.getRole()
                                == UserRole.ADMIN;

        if (!currentlyActiveAdmin) {

            return;
        }

        boolean removingAdminAccess =
                !request.active()
                        ||
                        request.role()
                                != UserRole.ADMIN;

        if (!removingAdminAccess) {

            return;
        }

        long activeAdminCount =
                userRepository
                        .countByRoleAndActiveTrue(
                                UserRole.ADMIN
                        );

        if (
                activeAdminCount <= 1
        ) {

            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Sistemde en az bir aktif yönetici hesabı bulunmalıdır."
            );
        }
    }

    private AppUser getAuthenticatedAdmin(
            String authenticatedEmail
    ) {

        if (
                authenticatedEmail == null
                        ||
                        authenticatedEmail.isBlank()
        ) {

            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Oturum bilgisi bulunamadı."
            );
        }

        AppUser user =
                userRepository
                        .findByEmail(
                                normalizeEmail(
                                        authenticatedEmail
                                )
                        )
                        .orElseThrow(
                                () ->
                                        new ResponseStatusException(
                                                HttpStatus.UNAUTHORIZED,
                                                "Oturum kullanıcısı bulunamadı."
                                        )
                        );

        if (!user.isActive()) {

            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Bu kullanıcı hesabı pasif durumda."
            );
        }

        if (
                user.getRole()
                        != UserRole.ADMIN
        ) {

            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Bu işlem için yönetici yetkisi gereklidir."
            );
        }

        return user;
    }

    private AppUser getUserOrThrow(
            Long userId
    ) {

        return userRepository
                .findById(
                        userId
                )
                .orElseThrow(
                        () ->
                                new ResponseStatusException(
                                        HttpStatus.NOT_FOUND,
                                        "Kullanıcı bulunamadı."
                                )
                );
    }

    private UserResponse toResponse(
            AppUser user
    ) {

        return new UserResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getRole().name(),
                user.isActive(),
                user.getCreatedAt()
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

    private String normalizeText(
            String value
    ) {

        return value
                .trim()
                .replaceAll(
                        "\\s+",
                        " "
                );
    }
}