package com.lezzetdoner.backend.courier.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateCourierRequest(

        @NotBlank(message = "Kurye adı boş bırakılamaz.")
        @Size(
                max = 100,
                message = "Kurye adı en fazla 100 karakter olabilir."
        )
        String name

) {
}