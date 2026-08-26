package com.lezzetdoner.backend.credit;

import com.lezzetdoner.backend.credit.dto.CreateCreditCustomerRequest;
import com.lezzetdoner.backend.credit.dto.CreateCreditTransactionRequest;
import com.lezzetdoner.backend.credit.dto.CreditCustomerDetailResponse;
import com.lezzetdoner.backend.credit.dto.CreditCustomerListResponse;
import com.lezzetdoner.backend.credit.dto.CreditTransactionResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping(
        "/api/credits"
)
public class CreditController {

    private final CreditService
            creditService;

    public CreditController(
            CreditService creditService
    ) {
        this.creditService =
                creditService;
    }

    @GetMapping(
            "/customers"
    )
    public CreditCustomerListResponse
    getCustomers(
            Authentication authentication
    ) {

        requireAdmin(
                authentication
        );

        return creditService
                .getCustomers();
    }

    @GetMapping(
            "/customers/{customerId}"
    )
    public CreditCustomerDetailResponse
    getCustomer(
            @PathVariable
            Long customerId,

            Authentication authentication
    ) {

        requireAdmin(
                authentication
        );

        return creditService
                .getCustomer(
                        customerId
                );
    }

    @PostMapping(
            "/customers"
    )
    @ResponseStatus(
            HttpStatus.CREATED
    )
    public CreditCustomerDetailResponse
    createCustomer(
            @Valid
            @RequestBody
            CreateCreditCustomerRequest request,

            Authentication authentication
    ) {

        requireAdmin(
                authentication
        );

        return creditService
                .createCustomer(
                        request,
                        authentication
                                .getName()
                );
    }

    @PostMapping(
            "/customers/{customerId}/transactions"
    )
    @ResponseStatus(
            HttpStatus.CREATED
    )
    public CreditTransactionResponse
    createTransaction(
            @PathVariable
            Long customerId,

            @Valid
            @RequestBody
            CreateCreditTransactionRequest request,

            Authentication authentication
    ) {

        requireAdmin(
                authentication
        );

        return creditService
                .createTransaction(
                        customerId,
                        request,
                        authentication
                                .getName()
                );
    }

    private void requireAdmin(
            Authentication authentication
    ) {

        if (
                authentication == null
                        ||
                !authentication
                        .isAuthenticated()
        ) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Oturum gerekli."
            );
        }

        boolean admin =
                authentication
                        .getAuthorities()
                        .stream()
                        .anyMatch(authority ->
                                "ROLE_ADMIN"
                                        .equals(
                                                authority
                                                        .getAuthority()
                                        )
                        );

        if (!admin) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Bu alana yalnızca yönetici erişebilir."
            );
        }
    }
}