package com.lezzetdoner.backend.credit;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CreditCustomerRepository
        extends JpaRepository<
        CreditCustomer,
        Long
        > {

    List<CreditCustomer>
    findAllByOrderByCustomerNameAsc();
}