package com.lezzetdoner.backend.credit;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CreditTransactionRepository
        extends JpaRepository<
        CreditTransaction,
        Long
        > {

    List<CreditTransaction>
    findAllByCustomerIdOrderByTransactionDateDescCreatedAtDesc(
            Long customerId
    );
}