package com.lezzetdoner.backend.report;

import com.lezzetdoner.backend.courier.CourierEntry;
import com.lezzetdoner.backend.courier.CourierEntryRepository;
import com.lezzetdoner.backend.dailycash.DailyExpenseEntry;
import com.lezzetdoner.backend.dailycash.DailyExpenseRepository;
import com.lezzetdoner.backend.dailycash.DailyIncomeEntry;
import com.lezzetdoner.backend.dailycash.DailyIncomeRepository;
import com.lezzetdoner.backend.monthly.MonthlyExtraExpense;
import com.lezzetdoner.backend.monthly.MonthlyExtraExpenseRepository;
import com.lezzetdoner.backend.report.dto.ReportResponse;
import com.lezzetdoner.backend.user.AppUser;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class ReportService {

    private final DailyIncomeRepository incomeRepository;

    private final DailyExpenseRepository expenseRepository;

    private final CourierEntryRepository courierEntryRepository;

    private final MonthlyExtraExpenseRepository monthlyExtraExpenseRepository;

    public ReportService(
            DailyIncomeRepository incomeRepository,
            DailyExpenseRepository expenseRepository,
            CourierEntryRepository courierEntryRepository,
            MonthlyExtraExpenseRepository monthlyExtraExpenseRepository
    ) {
        this.incomeRepository =
                incomeRepository;

        this.expenseRepository =
                expenseRepository;

        this.courierEntryRepository =
                courierEntryRepository;

        this.monthlyExtraExpenseRepository =
                monthlyExtraExpenseRepository;
    }

    @Transactional(readOnly = true)
    public ReportResponse getReport(
            LocalDate startDate,
            LocalDate endDate
    ) {

        validateDateRange(
                startDate,
                endDate
        );

        List<DailyIncomeEntry> incomes =
                incomeRepository
                        .findByEntryDateBetweenOrderByEntryDateAscCreatedAtAsc(
                                startDate,
                                endDate
                        );

        List<DailyExpenseEntry> expenses =
                expenseRepository
                        .findByEntryDateBetweenOrderByEntryDateAscCreatedAtAsc(
                                startDate,
                                endDate
                        );

        List<CourierEntry> courierEntries =
                courierEntryRepository
                        .findByEntryDateBetweenOrderByEntryDateAscCreatedAtAsc(
                                startDate,
                                endDate
                        );

        LocalDate startMonth =
                startDate.withDayOfMonth(1);

        LocalDate endMonth =
                endDate.withDayOfMonth(1);

        List<MonthlyExtraExpense> extraExpenses =
                monthlyExtraExpenseRepository
                        .findByExpenseMonthBetweenOrderByExpenseMonthAscCreatedAtAsc(
                                startMonth,
                                endMonth
                        );

        BigDecimal totalIncome =
                sumIncome(
                        incomes
                );

        BigDecimal dailyExpenseTotal =
                sumExpenses(
                        expenses
                );

        BigDecimal extraExpenseTotal =
                extraExpenses
                        .stream()
                        .map(
                                MonthlyExtraExpense::getAmount
                        )
                        .reduce(
                                BigDecimal.ZERO,
                                BigDecimal::add
                        );

        BigDecimal totalExpense =
                dailyExpenseTotal
                        .add(
                                extraExpenseTotal
                        );

        BigDecimal netAmount =
                totalIncome
                        .subtract(
                                totalExpense
                        );

        BigDecimal totalPackageAmount =
                courierEntries
                        .stream()
                        .map(
                                CourierEntry::getAmount
                        )
                        .reduce(
                                BigDecimal.ZERO,
                                BigDecimal::add
                        );

        return new ReportResponse(
                startDate,
                endDate,
                totalIncome,
                dailyExpenseTotal,
                extraExpenseTotal,
                totalExpense,
                netAmount,
                courierEntries.size(),
                totalPackageAmount,
                buildSalesChannelReports(
                        incomes
                ),
                buildCourierReports(
                        courierEntries
                ),
                buildStaffReports(
                        courierEntries
                ),
                buildDailyReports(
                        startDate,
                        endDate,
                        incomes,
                        expenses,
                        courierEntries
                ),
                buildExtraExpenseReports(
                        extraExpenses
                )
        );
    }

    private List<ReportResponse.SalesChannelReport>
    buildSalesChannelReports(
            List<DailyIncomeEntry> incomes
    ) {

        Map<String, BigDecimal> totals =
                new LinkedHashMap<>();

        for (DailyIncomeEntry income : incomes) {

            String channel =
                    income.getChannel() == null
                            || income.getChannel().isBlank()
                            ? "Diğer"
                            : income.getChannel().trim();

            totals.merge(
                    channel,
                    income.getAmount(),
                    BigDecimal::add
            );
        }

        return totals
                .entrySet()
                .stream()
                .map(entry ->
                        new ReportResponse.SalesChannelReport(
                                entry.getKey(),
                                entry.getValue()
                        )
                )
                .sorted(
                        Comparator.comparing(
                                ReportResponse.SalesChannelReport::totalAmount
                        ).reversed()
                )
                .toList();
    }

    private List<ReportResponse.CourierReport>
    buildCourierReports(
            List<CourierEntry> entries
    ) {

        Map<Long, CourierAccumulator> totals =
                new LinkedHashMap<>();

        for (CourierEntry entry : entries) {

            Long courierId =
                    entry.getCourier().getId();

            CourierAccumulator accumulator =
                    totals.computeIfAbsent(
                            courierId,
                            id ->
                                    new CourierAccumulator(
                                            id,
                                            entry.getCourier().getName()
                                    )
                    );

            accumulator.packageCount++;

            accumulator.totalAmount =
                    accumulator.totalAmount.add(
                            entry.getAmount()
                    );
        }

        return totals
                .values()
                .stream()
                .map(accumulator ->
                        new ReportResponse.CourierReport(
                                accumulator.courierId,
                                accumulator.courierName,
                                accumulator.packageCount,
                                accumulator.totalAmount
                        )
                )
                .sorted(
                        Comparator.comparingLong(
                                ReportResponse.CourierReport::packageCount
                        ).reversed()
                )
                .toList();
    }

    private List<ReportResponse.StaffReport>
    buildStaffReports(
            List<CourierEntry> entries
    ) {

        Map<String, StaffAccumulator> totals =
                new LinkedHashMap<>();

        for (CourierEntry entry : entries) {

            AppUser user =
                    entry.getCreatedBy();

            String key =
                    user == null
                            ? "OLD_RECORD"
                            : "USER_" + user.getId();

            StaffAccumulator accumulator =
                    totals.computeIfAbsent(
                            key,
                            ignored -> {

                                if (user == null) {

                                    return new StaffAccumulator(
                                            null,
                                            "Eski kayıt",
                                            null
                                    );
                                }

                                return new StaffAccumulator(
                                        user.getId(),
                                        user.getFullName(),
                                        user.getRole().name()
                                );
                            }
                    );

            accumulator.packageCount++;

            accumulator.totalAmount =
                    accumulator.totalAmount.add(
                            entry.getAmount()
                    );
        }

        return totals
                .values()
                .stream()
                .map(accumulator ->
                        new ReportResponse.StaffReport(
                                accumulator.userId,
                                accumulator.fullName,
                                accumulator.role,
                                accumulator.packageCount,
                                accumulator.totalAmount
                        )
                )
                .sorted(
                        Comparator.comparingLong(
                                ReportResponse.StaffReport::packageCount
                        ).reversed()
                )
                .toList();
    }

    private List<ReportResponse.DailyReport>
    buildDailyReports(
            LocalDate startDate,
            LocalDate endDate,
            List<DailyIncomeEntry> incomes,
            List<DailyExpenseEntry> expenses,
            List<CourierEntry> courierEntries
    ) {

        Map<LocalDate, DailyAccumulator> days =
                new LinkedHashMap<>();

        LocalDate current =
                startDate;

        while (!current.isAfter(endDate)) {

            days.put(
                    current,
                    new DailyAccumulator(
                            current
                    )
            );

            current =
                    current.plusDays(1);
        }

        for (DailyIncomeEntry income : incomes) {

            DailyAccumulator day =
                    days.get(
                            income.getEntryDate()
                    );

            if (day != null) {

                day.totalIncome =
                        day.totalIncome.add(
                                income.getAmount()
                        );
            }
        }

        for (DailyExpenseEntry expense : expenses) {

            DailyAccumulator day =
                    days.get(
                            expense.getEntryDate()
                    );

            if (day != null) {

                day.totalExpense =
                        day.totalExpense.add(
                                expense.getAmount()
                        );
            }
        }

        for (CourierEntry entry : courierEntries) {

            DailyAccumulator day =
                    days.get(
                            entry.getEntryDate()
                    );

            if (day != null) {

                day.packageCount++;

                day.packageAmount =
                        day.packageAmount.add(
                                entry.getAmount()
                        );
            }
        }

        List<ReportResponse.DailyReport> result =
                new ArrayList<>();

        for (DailyAccumulator day : days.values()) {

            BigDecimal net =
                    day.totalIncome.subtract(
                            day.totalExpense
                    );

            result.add(
                    new ReportResponse.DailyReport(
                            day.date,
                            day.totalIncome,
                            day.totalExpense,
                            net,
                            day.packageCount,
                            day.packageAmount
                    )
            );
        }

        return result;
    }

    private List<ReportResponse.ExtraExpenseReport>
    buildExtraExpenseReports(
            List<MonthlyExtraExpense> expenses
    ) {

        return expenses
                .stream()
                .map(expense ->
                        new ReportResponse.ExtraExpenseReport(
                                expense.getId(),
                                expense.getExpenseMonth(),
                                expense.getDescription(),
                                expense.getAmount()
                        )
                )
                .toList();
    }

    private BigDecimal sumIncome(
            List<DailyIncomeEntry> incomes
    ) {

        return incomes
                .stream()
                .map(
                        DailyIncomeEntry::getAmount
                )
                .reduce(
                        BigDecimal.ZERO,
                        BigDecimal::add
                );
    }

    private BigDecimal sumExpenses(
            List<DailyExpenseEntry> expenses
    ) {

        return expenses
                .stream()
                .map(
                        DailyExpenseEntry::getAmount
                )
                .reduce(
                        BigDecimal.ZERO,
                        BigDecimal::add
                );
    }

    private void validateDateRange(
            LocalDate startDate,
            LocalDate endDate
    ) {

        if (
                startDate == null
                        || endDate == null
        ) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Başlangıç ve bitiş tarihi gereklidir."
            );
        }

        if (
                endDate.isBefore(
                        startDate
                )
        ) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Bitiş tarihi başlangıç tarihinden önce olamaz."
            );
        }

        long days =
                ChronoUnit.DAYS.between(
                        startDate,
                        endDate
                );

        if (days > 366) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Tek seferde en fazla 1 yıllık rapor alınabilir."
            );
        }
    }

    private static class CourierAccumulator {

        private final Long courierId;

        private final String courierName;

        private long packageCount = 0;

        private BigDecimal totalAmount =
                BigDecimal.ZERO;

        private CourierAccumulator(
                Long courierId,
                String courierName
        ) {
            this.courierId =
                    courierId;

            this.courierName =
                    courierName;
        }
    }

    private static class StaffAccumulator {

        private final Long userId;

        private final String fullName;

        private final String role;

        private long packageCount = 0;

        private BigDecimal totalAmount =
                BigDecimal.ZERO;

        private StaffAccumulator(
                Long userId,
                String fullName,
                String role
        ) {
            this.userId =
                    userId;

            this.fullName =
                    fullName;

            this.role =
                    role;
        }
    }

    private static class DailyAccumulator {

        private final LocalDate date;

        private BigDecimal totalIncome =
                BigDecimal.ZERO;

        private BigDecimal totalExpense =
                BigDecimal.ZERO;

        private long packageCount = 0;

        private BigDecimal packageAmount =
                BigDecimal.ZERO;

        private DailyAccumulator(
                LocalDate date
        ) {
            this.date =
                    date;
        }
    }
}