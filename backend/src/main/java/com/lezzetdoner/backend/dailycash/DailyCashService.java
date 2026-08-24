package com.lezzetdoner.backend.dailycash;

import com.lezzetdoner.backend.dailycash.dto.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;

@Service
public class DailyCashService {

    private static final ZoneId ISTANBUL_ZONE =
            ZoneId.of("Europe/Istanbul");

    private final DailyIncomeRepository incomeRepository;
    private final DailyExpenseRepository expenseRepository;

    public DailyCashService(
            DailyIncomeRepository incomeRepository,
            DailyExpenseRepository expenseRepository
    ) {
        this.incomeRepository = incomeRepository;
        this.expenseRepository = expenseRepository;
    }

    @Transactional(readOnly = true)
    public DailyCashResponse getDailyCash(LocalDate requestedDate) {

        LocalDate date = resolveEntryDate(requestedDate);

        List<DailyIncomeEntry> incomes =
                incomeRepository
                        .findByEntryDateOrderByCreatedAtAsc(date);

        List<DailyExpenseEntry> expenses =
                expenseRepository
                        .findByEntryDateOrderByCreatedAtAsc(date);

        BigDecimal totalIncome =
                incomes.stream()
                        .map(DailyIncomeEntry::getAmount)
                        .reduce(
                                BigDecimal.ZERO,
                                BigDecimal::add
                        );

        BigDecimal totalExpense =
                expenses.stream()
                        .map(DailyExpenseEntry::getAmount)
                        .reduce(
                                BigDecimal.ZERO,
                                BigDecimal::add
                        );

        BigDecimal netAmount =
                totalIncome.subtract(totalExpense);

        List<DailyIncomeResponse> incomeResponses =
                incomes.stream()
                        .map(this::toIncomeResponse)
                        .toList();

        List<DailyExpenseResponse> expenseResponses =
                expenses.stream()
                        .map(this::toExpenseResponse)
                        .toList();

        return new DailyCashResponse(
                date,
                totalIncome,
                totalExpense,
                netAmount,
                incomeResponses,
                expenseResponses
        );
    }

    @Transactional
    public DailyIncomeResponse createIncome(
            CreateIncomeRequest request
    ) {

        LocalDate entryDate =
                resolveEntryDate(
                        request.entryDate()
                );

        DailyIncomeEntry entry =
                new DailyIncomeEntry(
                        normalize(request.channel()),
                        request.amount(),
                        entryDate
                );

        return toIncomeResponse(
                incomeRepository.save(entry)
        );
    }

    @Transactional
    public DailyIncomeResponse updateIncome(
            Long incomeId,
            UpdateIncomeRequest request
    ) {

        DailyIncomeEntry entry =
                incomeRepository
                        .findById(incomeId)
                        .orElseThrow(() ->
                                new ResponseStatusException(
                                        HttpStatus.NOT_FOUND,
                                        "Gelir kaydı bulunamadı."
                                )
                        );

        entry.setChannel(
                normalize(request.channel())
        );

        entry.setAmount(request.amount());

        return toIncomeResponse(
                incomeRepository.save(entry)
        );
    }

    @Transactional
    public void deleteIncome(Long incomeId) {

        if (!incomeRepository.existsById(incomeId)) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Gelir kaydı bulunamadı."
            );
        }

        incomeRepository.deleteById(incomeId);
    }

    @Transactional
    public DailyExpenseResponse createExpense(
            CreateExpenseRequest request
    ) {

        LocalDate entryDate =
                resolveEntryDate(
                        request.entryDate()
                );

        DailyExpenseEntry entry =
                new DailyExpenseEntry(
                        normalize(request.description()),
                        request.amount(),
                        entryDate
                );

        return toExpenseResponse(
                expenseRepository.save(entry)
        );
    }

    @Transactional
    public DailyExpenseResponse updateExpense(
            Long expenseId,
            UpdateExpenseRequest request
    ) {

        DailyExpenseEntry entry =
                expenseRepository
                        .findById(expenseId)
                        .orElseThrow(() ->
                                new ResponseStatusException(
                                        HttpStatus.NOT_FOUND,
                                        "Gider kaydı bulunamadı."
                                )
                        );

        entry.setDescription(
                normalize(request.description())
        );

        entry.setAmount(request.amount());

        return toExpenseResponse(
                expenseRepository.save(entry)
        );
    }

    @Transactional
    public void deleteExpense(Long expenseId) {

        if (!expenseRepository.existsById(expenseId)) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Gider kaydı bulunamadı."
            );
        }

        expenseRepository.deleteById(expenseId);
    }

    private DailyIncomeResponse toIncomeResponse(
            DailyIncomeEntry entry
    ) {

        return new DailyIncomeResponse(
                entry.getId(),
                entry.getChannel(),
                entry.getAmount(),
                entry.getEntryDate(),
                entry.getCreatedAt()
        );
    }

    private DailyExpenseResponse toExpenseResponse(
            DailyExpenseEntry entry
    ) {

        return new DailyExpenseResponse(
                entry.getId(),
                entry.getDescription(),
                entry.getAmount(),
                entry.getEntryDate(),
                entry.getCreatedAt()
        );
    }

    private LocalDate resolveEntryDate(
            LocalDate requestedDate
    ) {

        LocalDate today =
                LocalDate.now(ISTANBUL_ZONE);

        LocalDate date =
                requestedDate != null
                        ? requestedDate
                        : today;

        if (date.isAfter(today)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Gelecek bir tarihe kasa kaydı eklenemez."
            );
        }

        return date;
    }

    private String normalize(String value) {

        return value
                .trim()
                .replaceAll("\\s+", " ");
    }
}