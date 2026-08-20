package com.lezzetdoner.backend.user.dto;

import com.lezzetdoner.backend.user.UserRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record UpdateUserRequest(

        @NotBlank(message = "Ad soyad gereklidir.")
        @Size(
                max = 120,
                message = "Ad soyad en fazla 120 karakter olabilir."
        )
        String fullName,

        @NotBlank(message = "E-posta gereklidir.")
        @Email(message = "Geçerli bir e-posta adresi giriniz.")
        @Size(
                max = 180,
                message = "E-posta en fazla 180 karakter olabilir."
        )
        String email,

        @NotNull(message = "Kullanıcı rolü gereklidir.")
        UserRole role,

        @NotNull(message = "Aktiflik bilgisi gereklidir.")
        Boolean active

) {
}