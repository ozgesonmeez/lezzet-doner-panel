package com.lezzetdoner.backend.user;

import jakarta.persistence.*;

import java.time.Instant;

@Entity
@Table(name = "app_users")
public class AppUser {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(
            name = "full_name",
            nullable = false,
            length = 120
    )
    private String fullName;

    @Column(
            nullable = false,
            unique = true,
            length = 180
    )
    private String email;

    @Column(
            name = "password_hash",
            nullable = false
    )
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    @Column(
            nullable = false,
            length = 20
    )
    private UserRole role;

    @Column(nullable = false)
    private boolean active = true;

    @Column(
            name = "token_version",
            nullable = false
    )
    private long tokenVersion = 0;

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

    public AppUser() {
    }

    public AppUser(
            String fullName,
            String email,
            String passwordHash,
            UserRole role,
            boolean active
    ) {

        this.fullName =
                fullName;

        this.email =
                email;

        this.passwordHash =
                passwordHash;

        this.role =
                role;

        this.active =
                active;

        this.tokenVersion =
                0;
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

    public String getFullName() {
        return fullName;
    }

    public String getEmail() {
        return email;
    }

    public String getPasswordHash() {
        return passwordHash;
    }

    public UserRole getRole() {
        return role;
    }

    public boolean isActive() {
        return active;
    }

    public long getTokenVersion() {
        return tokenVersion;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setFullName(
            String fullName
    ) {

        this.fullName =
                fullName;
    }

    public void setEmail(
            String email
    ) {

        this.email =
                email;
    }

    public void setPasswordHash(
            String passwordHash
    ) {

        this.passwordHash =
                passwordHash;
    }

    public void setRole(
            UserRole role
    ) {

        this.role =
                role;
    }

    public void setActive(
            boolean active
    ) {

        this.active =
                active;
    }

    public void incrementTokenVersion() {

        this.tokenVersion++;
    }
}