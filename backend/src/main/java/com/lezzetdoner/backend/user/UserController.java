package com.lezzetdoner.backend.user;

import com.lezzetdoner.backend.user.dto.CreateUserRequest;
import com.lezzetdoner.backend.user.dto.ResetPasswordRequest;
import com.lezzetdoner.backend.user.dto.UpdateUserRequest;
import com.lezzetdoner.backend.user.dto.UserResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(
            UserService userService
    ) {
        this.userService =
                userService;
    }

    @GetMapping
    public List<UserResponse> getUsers() {

        return userService.getUsers();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public UserResponse createUser(
            @Valid
            @RequestBody
            CreateUserRequest request
    ) {

        return userService.createUser(
                request
        );
    }

    @PutMapping("/{userId}")
    public UserResponse updateUser(
            @PathVariable
            Long userId,

            @Valid
            @RequestBody
            UpdateUserRequest request,

            Authentication authentication
    ) {

        return userService.updateUser(
                userId,
                request,
                authentication.getName()
        );
    }

    @PutMapping("/{userId}/password")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void resetPassword(
            @PathVariable
            Long userId,

            @Valid
            @RequestBody
            ResetPasswordRequest request
    ) {

        userService.resetPassword(
                userId,
                request
        );
    }
}