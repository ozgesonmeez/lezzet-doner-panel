package com.lezzetdoner.backend.courier;

import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface CourierEntryRepository
        extends JpaRepository<CourierEntry, Long> {

    List<CourierEntry>
    findByCourierIdAndEntryDateOrderByCreatedAtAsc(
            Long courierId,
            LocalDate entryDate
    );

    List<CourierEntry>
    findByEntryDateBetweenOrderByEntryDateAscCreatedAtAsc(
            LocalDate startDate,
            LocalDate endDate
    );
}