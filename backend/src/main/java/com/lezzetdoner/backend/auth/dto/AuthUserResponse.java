package com.lezzetdoner.backend.auth.dto;

public record AuthUserResponse(

        Long id,

        String fullName,

        String email,

        String role

) {
}