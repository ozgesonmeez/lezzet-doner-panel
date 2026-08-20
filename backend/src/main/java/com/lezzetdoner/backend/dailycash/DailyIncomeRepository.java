package com.lezzetdoner.backend.dailycash;

import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface DailyIncomeRepository
        extends JpaRepository<DailyIncomeEntry, Long> {

    List<DailyIncomeEntry>
    findByEntryDateOrderByCreatedAtAsc(LocalDate entryDate);

    List<DailyIncomeEntry>
    findByEntryDateBetweenOrderByEntryDateAscCreatedAtAsc(
            LocalDate startDate,
            LocalDate endDate
    );
}