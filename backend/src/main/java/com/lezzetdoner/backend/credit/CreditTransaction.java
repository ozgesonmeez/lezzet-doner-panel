package com.lezzetdoner.backend.credit;

import com.lezzetdoner.backend.user.AppUser;
import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

@Entity
@Table(name = "credit_transactions")
public class CreditTransaction {

    @Id
    @GeneratedValue(
            strategy = GenerationType.IDENTITY
    )
    private Long id;

    @ManyToOne(
            fetch = FetchType.LAZY,
            optional = false
    )
    @JoinColumn(
            name = "customer_id",
            nullable = false
    )
    private CreditCustomer customer;

    @Enumerated(
            EnumType.STRING
    )
    @Column(
            name = "transaction_type",
            nullable = false,
            length = 20
    )
    private CreditTransactionType
            transactionType;

    @Column(
            nullable = false,
            precision = 12,
            scale = 2
    )
    private BigDecimal amount;

    @Column(
            name = "transaction_date",
            nullable = false
    )
    private LocalDate transactionDate;

    @Column(
            length = 500
    )
    private String note;

    @ManyToOne(
            fetch = FetchType.LAZY
    )
    @JoinColumn(
            name = "created_by_user_id",
            updatable = false
    )
    private AppUser createdBy;

    @Column(
            name = "created_at",
            nullable = false,
            updatable = false
    )
    private Instant createdAt;

    public CreditTransaction() {
    }

    public CreditTransaction(
            CreditCustomer customer,
            CreditTransactionType
                    transactionType,
            BigDecimal amount,
            LocalDate transactionDate,
            String note,
            AppUser createdBy
    ) {
        this.customer =
                customer;

        this.transactionType =
                transactionType;

        this.amount =
                amount;

        this.transactionDate =
                transactionDate;

        this.note =
                note;

        this.createdBy =
                createdBy;
    }

    @PrePersist
    public void prePersist() {
        this.createdAt =
                Instant.now();
    }

    public Long getId() {
        return id;
    }

    public CreditCustomer getCustomer() {
        return customer;
    }

    public CreditTransactionType
    getTransactionType() {
        return transactionType;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public LocalDate getTransactionDate() {
        return transactionDate;
    }

    public String getNote() {
        return note;
    }

    public AppUser getCreatedBy() {
        return createdBy;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}