package com.lezzetdoner.backend.credit;

import com.lezzetdoner.backend.credit.dto.CreateCreditCustomerRequest;
import com.lezzetdoner.backend.credit.dto.CreateCreditTransactionRequest;
import com.lezzetdoner.backend.credit.dto.CreditCustomerDetailResponse;
import com.lezzetdoner.backend.credit.dto.CreditCustomerListResponse;
import com.lezzetdoner.backend.credit.dto.CreditCustomerSummaryResponse;
import com.lezzetdoner.backend.credit.dto.CreditTransactionResponse;
import com.lezzetdoner.backend.user.AppUser;
import com.lezzetdoner.backend.user.AppUserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;

@Service
public class CreditService {

    private static final ZoneId ISTANBUL_ZONE =
            ZoneId.of(
                    "Europe/Istanbul"
            );

    private final CreditCustomerRepository
            customerRepository;

    private final CreditTransactionRepository
            transactionRepository;

    private final AppUserRepository
            userRepository;

    public CreditService(
            CreditCustomerRepository
                    customerRepository,
            CreditTransactionRepository
                    transactionRepository,
            AppUserRepository
                    userRepository
    ) {
        this.customerRepository =
                customerRepository;

        this.transactionRepository =
                transactionRepository;

        this.userRepository =
                userRepository;
    }

    @Transactional(readOnly = true)
    public CreditCustomerListResponse
    getCustomers() {

        List<CreditCustomerSummaryResponse>
                customers =
                customerRepository
                        .findAllByOrderByCustomerNameAsc()
                        .stream()
                        .map(
                                this::toSummary
                        )
                        .toList();

        BigDecimal totalOpenAmount =
                customers.stream()
                        .map(
                                CreditCustomerSummaryResponse::balance
                        )
                        .filter(balance ->
                                balance.compareTo(
                                        BigDecimal.ZERO
                                ) > 0
                        )
                        .reduce(
                                BigDecimal.ZERO,
                                BigDecimal::add
                        );

        long debtorCount =
                customers.stream()
                        .filter(customer ->
                                customer.balance()
                                        .compareTo(
                                                BigDecimal.ZERO
                                        ) > 0
                        )
                        .count();

        return new CreditCustomerListResponse(
                totalOpenAmount,
                customers.size(),
                debtorCount,
                customers
        );
    }

    @Transactional(readOnly = true)
    public CreditCustomerDetailResponse
    getCustomer(
            Long customerId
    ) {

        CreditCustomer customer =
                getCustomerOrThrow(
                        customerId
                );

        List<CreditTransaction>
                transactions =
                getTransactions(
                        customerId
                );

        return toDetail(
                customer,
                transactions
        );
    }

    @Transactional
    public CreditCustomerDetailResponse
    createCustomer(
            CreateCreditCustomerRequest request,
            String actorEmail
    ) {

        AppUser actor =
                getActor(
                        actorEmail
                );

        CreditCustomer customer =
                new CreditCustomer(
                        normalizeRequired(
                                request.customerName()
                        ),
                        normalizeOptional(
                                request.phone()
                        ),
                        normalizeOptional(
                                request.note()
                        ),
                        actor
                );

        CreditCustomer saved =
                customerRepository
                        .save(customer);

        return toDetail(
                saved,
                List.of()
        );
    }

    @Transactional
    public CreditTransactionResponse
    createTransaction(
            Long customerId,
            CreateCreditTransactionRequest request,
            String actorEmail
    ) {

        CreditCustomer customer =
                getCustomerOrThrow(
                        customerId
                );

        AppUser actor =
                getActor(
                        actorEmail
                );

        LocalDate transactionDate =
                resolveTransactionDate(
                        request.transactionDate()
                );

        if (
                request.type()
                        == CreditTransactionType.PAYMENT
        ) {
            BigDecimal currentBalance =
                    calculateBalance(
                            getTransactions(
                                    customerId
                            )
                    );

            if (
                    request.amount()
                            .compareTo(
                                    currentBalance
                            ) > 0
            ) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Ödeme tutarı mevcut borçtan fazla olamaz."
                );
            }

            if (
                    currentBalance.compareTo(
                            BigDecimal.ZERO
                    ) <= 0
            ) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Bu kişinin ödenecek açık veresiyesi bulunmuyor."
                );
            }
        }

        CreditTransaction transaction =
                new CreditTransaction(
                        customer,
                        request.type(),
                        request.amount(),
                        transactionDate,
                        normalizeOptional(
                                request.note()
                        ),
                        actor
                );

        return toTransactionResponse(
                transactionRepository
                        .save(transaction)
        );
    }

    private CreditCustomerSummaryResponse
    toSummary(
            CreditCustomer customer
    ) {

        List<CreditTransaction>
                transactions =
                getTransactions(
                        customer.getId()
                );

        BigDecimal balance =
                calculateBalance(
                        transactions
                );

        LocalDate lastTransactionDate =
                transactions
                        .isEmpty()
                        ? null
                        : transactions
                        .get(0)
                        .getTransactionDate();

        return new CreditCustomerSummaryResponse(
                customer.getId(),
                customer.getCustomerName(),
                customer.getPhone(),
                customer.getNote(),
                balance,
                lastTransactionDate,
                transactions.size()
        );
    }

    private CreditCustomerDetailResponse
    toDetail(
            CreditCustomer customer,
            List<CreditTransaction>
                    transactions
    ) {

        AppUser createdBy =
                customer.getCreatedBy();

        List<CreditTransactionResponse>
                transactionResponses =
                transactions.stream()
                        .map(
                                this::toTransactionResponse
                        )
                        .toList();

        return new CreditCustomerDetailResponse(
                customer.getId(),
                customer.getCustomerName(),
                customer.getPhone(),
                customer.getNote(),
                calculateBalance(
                        transactions
                ),
                createdBy != null
                        ? createdBy.getId()
                        : null,
                createdBy != null
                        ? createdBy.getFullName()
                        : null,
                customer.getCreatedAt(),
                transactionResponses
        );
    }

    private CreditTransactionResponse
    toTransactionResponse(
            CreditTransaction transaction
    ) {

        AppUser createdBy =
                transaction.getCreatedBy();

        return new CreditTransactionResponse(
                transaction.getId(),
                transaction
                        .getTransactionType()
                        .name(),
                transaction.getAmount(),
                transaction
                        .getTransactionDate(),
                transaction.getNote(),
                createdBy != null
                        ? createdBy.getId()
                        : null,
                createdBy != null
                        ? createdBy.getFullName()
                        : null,
                transaction.getCreatedAt()
        );
    }

    private BigDecimal calculateBalance(
            List<CreditTransaction>
                    transactions
    ) {

        BigDecimal balance =
                BigDecimal.ZERO;

        for (
                CreditTransaction transaction
                : transactions
        ) {
            if (
                    transaction
                            .getTransactionType()
                            == CreditTransactionType.CREDIT
            ) {
                balance =
                        balance.add(
                                transaction.getAmount()
                        );
            } else {
                balance =
                        balance.subtract(
                                transaction.getAmount()
                        );
            }
        }

        return balance;
    }

    private List<CreditTransaction>
    getTransactions(
            Long customerId
    ) {

        return transactionRepository
                .findAllByCustomerIdOrderByTransactionDateDescCreatedAtDesc(
                        customerId
                );
    }

    private CreditCustomer
    getCustomerOrThrow(
            Long customerId
    ) {

        return customerRepository
                .findById(
                        customerId
                )
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Veresiye kişisi bulunamadı."
                        )
                );
    }

    private AppUser getActor(
            String email
    ) {

        return userRepository
                .findByEmail(
                        email
                )
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.UNAUTHORIZED,
                                "Kullanıcı doğrulanamadı."
                        )
                );
    }

    private LocalDate resolveTransactionDate(
            LocalDate requestedDate
    ) {

        LocalDate today =
                LocalDate.now(
                        ISTANBUL_ZONE
                );

        LocalDate date =
                requestedDate != null
                        ? requestedDate
                        : today;

        if (
                date.isAfter(
                        today
                )
        ) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Gelecek tarihe veresiye işlemi eklenemez."
            );
        }

        return date;
    }

    private String normalizeRequired(
            String value
    ) {

        return value
                .trim()
                .replaceAll(
                        "\\s+",
                        " "
                );
    }

    private String normalizeOptional(
            String value
    ) {

        if (value == null) {
            return null;
        }

        String normalized =
                value
                        .trim()
                        .replaceAll(
                                "\\s+",
                                " "
                        );

        if (
                normalized.isBlank()
        ) {
            return null;
        }

        return normalized;
    }
}