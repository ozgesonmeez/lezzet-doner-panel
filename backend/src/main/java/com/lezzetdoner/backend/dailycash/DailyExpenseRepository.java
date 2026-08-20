package com.lezzetdoner.backend.dailycash;

import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface DailyExpenseRepository
        extends JpaRepository<DailyExpenseEntry, Long> {

    List<DailyExpenseEntry>
    findByEntryDateOrderByCreatedAtAsc(LocalDate entryDate);

    List<DailyExpenseEntry>
    findByEntryDateBetweenOrderByEntryDateAscCreatedAtAsc(
            LocalDate startDate,
            LocalDate endDate
    );
}