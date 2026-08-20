package com.lezzetdoner.backend.user.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ResetPasswordRequest(

        @NotBlank(message = "Yeni şifre gereklidir.")
        @Size(
                min = 8,
                max = 100,
                message = "Şifre en az 8 karakter olmalıdır."
        )
        String password

) {
}