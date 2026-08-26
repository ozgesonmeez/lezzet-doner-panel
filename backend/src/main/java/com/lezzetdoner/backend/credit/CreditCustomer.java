package com.lezzetdoner.backend.credit;

import com.lezzetdoner.backend.user.AppUser;
import jakarta.persistence.*;

import java.time.Instant;

@Entity
@Table(name = "credit_customers")
public class CreditCustomer {

    @Id
    @GeneratedValue(
            strategy = GenerationType.IDENTITY
    )
    private Long id;

    @Column(
            name = "customer_name",
            nullable = false,
            length = 160
    )
    private String customerName;

    @Column(
            length = 30
    )
    private String phone;

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

    @Column(
            name = "updated_at",
            nullable = false
    )
    private Instant updatedAt;

    public CreditCustomer() {
    }

    public CreditCustomer(
            String customerName,
            String phone,
            String note,
            AppUser createdBy
    ) {
        this.customerName =
                customerName;

        this.phone =
                phone;

        this.note =
                note;

        this.createdBy =
                createdBy;
    }

    @PrePersist
    public void prePersist() {

        Instant now =
                Instant.now();

        this.createdAt =
                now;

        this.updatedAt =
                now;
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt =
                Instant.now();
    }

    public Long getId() {
        return id;
    }

    public String getCustomerName() {
        return customerName;
    }

    public String getPhone() {
        return phone;
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

    public Instant getUpdatedAt() {
        return updatedAt;
    }
}