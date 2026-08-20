package com.lezzetdoner.backend.auth.dto;

public record LoginResponse(

        String token,

        AuthUserResponse user

) {
}