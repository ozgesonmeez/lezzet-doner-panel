package com.lezzetdoner.backend.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record LoginRequest(

        @NotBlank(
                message = "E-posta adresi gereklidir."
        )
        @Email(
                message = "Geçerli bir e-posta adresi giriniz."
        )
        String email,

        @NotBlank(
                message = "Şifre gereklidir."
        )
        String password

) {
}