package com.lezzetdoner.backend.credit.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateCreditCustomerRequest(

        @NotBlank(
                message =
                        "Kişi veya işletme adı gereklidir."
        )
        @Size(
                max = 160,
                message =
                        "Ad en fazla 160 karakter olabilir."
        )
        String customerName,

        @Size(
                max = 30,
                message =
                        "Telefon en fazla 30 karakter olabilir."
        )
        String phone,

        @Size(
                max = 500,
                message =
                        "Not en fazla 500 karakter olabilir."
        )
        String note

) {
}