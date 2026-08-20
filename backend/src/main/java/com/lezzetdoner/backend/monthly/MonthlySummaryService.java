package com.lezzetdoner.backend.monthly;

import com.lezzetdoner.backend.dailycash.DailyExpenseEntry;
import com.lezzetdoner.backend.dailycash.DailyExpenseRepository;
import com.lezzetdoner.backend.dailycash.DailyIncomeEntry;
import com.lezzetdoner.backend.dailycash.DailyIncomeRepository;
import com.lezzetdoner.backend.monthly.dto.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.ZoneId;
import java.util.List;

@Service
public class MonthlySummaryService {

    private static final ZoneId ISTANBUL_ZONE =
            ZoneId.of("Europe/Istanbul");

    private final DailyIncomeRepository incomeRepository;
    private final DailyExpenseRepository expenseRepository;
    private final MonthlyExtraExpenseRepository monthlyExpenseRepository;

    public MonthlySummaryService(
            DailyIncomeRepository incomeRepository,
            DailyExpenseRepository expenseRepository,
            MonthlyExtraExpenseRepository monthlyExpenseRepository
    ) {
        this.incomeRepository = incomeRepository;
        this.expenseRepository = expenseRepository;
        this.monthlyExpenseRepository = monthlyExpenseRepository;
    }

    @Transactional(readOnly = true)
    public MonthlySummaryResponse getSummary(
            YearMonth requestedMonth
    ) {

        YearMonth month =
                requestedMonth != null
                        ? requestedMonth
                        : YearMonth.now(ISTANBUL_ZONE);

        LocalDate startDate =
                month.atDay(1);

        LocalDate endDate =
                month.atEndOfMonth();

        List<DailyIncomeEntry> incomes =
                incomeRepository
                        .findByEntryDateBetweenOrderByEntryDateAscCreatedAtAsc(
                                startDate,
                                endDate
                        );

        List<DailyExpenseEntry> dailyExpenses =
                expenseRepository
                        .findByEntryDateBetweenOrderByEntryDateAscCreatedAtAsc(
                                startDate,
                                endDate
                        );

        List<MonthlyExtraExpense> extraExpenses =
                monthlyExpenseRepository
                        .findByExpenseMonthOrderByCreatedAtAsc(
                                startDate
                        );

        BigDecimal totalIncome =
                incomes.stream()
                        .map(DailyIncomeEntry::getAmount)
                        .reduce(
                                BigDecimal.ZERO,
                                BigDecimal::add
                        );

        BigDecimal dailyExpenseTotal =
                dailyExpenses.stream()
                        .map(DailyExpenseEntry::getAmount)
                        .reduce(
                                BigDecimal.ZERO,
                                BigDecimal::add
                        );

        BigDecimal extraExpenseTotal =
                extraExpenses.stream()
                        .map(MonthlyExtraExpense::getAmount)
                        .reduce(
                                BigDecimal.ZERO,
                                BigDecimal::add
                        );

        BigDecimal totalExpense =
                dailyExpenseTotal.add(
                        extraExpenseTotal
                );

        BigDecimal netAmount =
                totalIncome.subtract(
                        totalExpense
                );

        List<MonthlyDaySummaryResponse> daySummaries =
                startDate
                        .datesUntil(
                                endDate.plusDays(1)
                        )
                        .map(date -> {

                            BigDecimal dayIncome =
                                    incomes.stream()
                                            .filter(entry ->
                                                    entry.getEntryDate()
                                                            .equals(date)
                                            )
                                            .map(
                                                    DailyIncomeEntry::getAmount
                                            )
                                            .reduce(
                                                    BigDecimal.ZERO,
                                                    BigDecimal::add
                                            );

                            BigDecimal dayExpense =
                                    dailyExpenses.stream()
                                            .filter(entry ->
                                                    entry.getEntryDate()
                                                            .equals(date)
                                            )
                                            .map(
                                                    DailyExpenseEntry::getAmount
                                            )
                                            .reduce(
                                                    BigDecimal.ZERO,
                                                    BigDecimal::add
                                            );

                            return new MonthlyDaySummaryResponse(
                                    date,
                                    dayIncome,
                                    dayExpense,
                                    dayIncome.subtract(
                                            dayExpense
                                    )
                            );
                        })
                        .toList();

        List<MonthlyExtraExpenseResponse> extraExpenseResponses =
                extraExpenses.stream()
                        .map(this::toResponse)
                        .toList();

        return new MonthlySummaryResponse(
                month.toString(),
                totalIncome,
                dailyExpenseTotal,
                extraExpenseTotal,
                totalExpense,
                netAmount,
                daySummaries,
                extraExpenseResponses
        );
    }

    @Transactional
    public MonthlyExtraExpenseResponse createExtraExpense(
            YearMonth month,
            CreateMonthlyExpenseRequest request
    ) {

        YearMonth resolvedMonth =
                month != null
                        ? month
                        : YearMonth.now(ISTANBUL_ZONE);

        MonthlyExtraExpense expense =
                new MonthlyExtraExpense(
                        normalize(
                                request.description()
                        ),
                        request.amount(),
                        resolvedMonth.atDay(1)
                );

        return toResponse(
                monthlyExpenseRepository.save(
                        expense
                )
        );
    }

    @Transactional
    public MonthlyExtraExpenseResponse updateExtraExpense(
            Long expenseId,
            UpdateMonthlyExpenseRequest request
    ) {

        MonthlyExtraExpense expense =
                monthlyExpenseRepository
                        .findById(expenseId)
                        .orElseThrow(() ->
                                new ResponseStatusException(
                                        HttpStatus.NOT_FOUND,
                                        "Ay sonu gideri bulunamadı."
                                )
                        );

        expense.setDescription(
                normalize(
                        request.description()
                )
        );

        expense.setAmount(
                request.amount()
        );

        return toResponse(
                monthlyExpenseRepository.save(
                        expense
                )
        );
    }

    @Transactional
    public void deleteExtraExpense(
            Long expenseId
    ) {

        if (!monthlyExpenseRepository.existsById(expenseId)) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Ay sonu gideri bulunamadı."
            );
        }

        monthlyExpenseRepository.deleteById(
                expenseId
        );
    }

    private MonthlyExtraExpenseResponse toResponse(
            MonthlyExtraExpense expense
    ) {

        return new MonthlyExtraExpenseResponse(
                expense.getId(),
                expense.getDescription(),
                expense.getAmount(),
                expense.getCreatedAt()
        );
    }

    private String normalize(
            String value
    ) {

        return value
                .trim()
                .replaceAll("\\s+", " ");
    }
}