package com.lezzetdoner.backend.courier;

import com.lezzetdoner.backend.user.AppUser;
import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

@Entity
@Table(name = "courier_entries")
public class CourierEntry {

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
            name = "courier_id",
            nullable = false
    )
    private Courier courier;

    @ManyToOne(
            fetch = FetchType.LAZY
    )
    @JoinColumn(
            name = "created_by_user_id",
            updatable = false
    )
    private AppUser createdBy;

    @Column(
            nullable = false,
            precision = 12,
            scale = 2
    )
    private BigDecimal amount;

    @Column(
            name = "entry_date",
            nullable = false
    )
    private LocalDate entryDate;

    @Enumerated(
            EnumType.STRING
    )
    @Column(
            name = "entry_type",
            nullable = false,
            length = 20
    )
    private CourierEntryType entryType =
            CourierEntryType.NORMAL;

    @Column(
            name = "created_at",
            nullable = false,
            updatable = false
    )
    private Instant createdAt;

    @Column(
            name = "updated_at",
            nullable = false
    )
    private Instant updatedAt;

    public CourierEntry() {
    }

    public CourierEntry(
            Courier courier,
            AppUser createdBy,
            BigDecimal amount,
            LocalDate entryDate,
            CourierEntryType entryType
    ) {
        this.courier =
                courier;

        this.createdBy =
                createdBy;

        this.amount =
                amount;

        this.entryDate =
                entryDate;

        this.entryType =
                entryType;
    }

    @PrePersist
    public void prePersist() {

        Instant now =
                Instant.now();

        this.createdAt =
                now;

        this.updatedAt =
                now;

        if (this.entryType == null) {
            this.entryType =
                    CourierEntryType.NORMAL;
        }
    }

    @PreUpdate
    public void preUpdate() {

        this.updatedAt =
                Instant.now();
    }

    public Long getId() {
        return id;
    }

    public Courier getCourier() {
        return courier;
    }

    public AppUser getCreatedBy() {
        return createdBy;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public LocalDate getEntryDate() {
        return entryDate;
    }

    public CourierEntryType getEntryType() {
        return entryType;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setAmount(
            BigDecimal amount
    ) {
        this.amount =
                amount;
    }
}