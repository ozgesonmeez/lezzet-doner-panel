package com.lezzetdoner.backend.report.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record ReportResponse(

        LocalDate startDate,

        LocalDate endDate,

        BigDecimal totalIncome,

        BigDecimal dailyExpenseTotal,

        BigDecimal extraExpenseTotal,

        BigDecimal totalExpense,

        BigDecimal netAmount,

        long totalPackageCount,

        BigDecimal totalPackageAmount,

        List<SalesChannelReport> salesChannels,

        List<CourierReport> couriers,

        List<StaffReport> staff,

        List<DailyReport> days,

        List<ExtraExpenseReport> extraExpenses

) {

    public record SalesChannelReport(

            String channel,

            BigDecimal totalAmount

    ) {
    }

    public record CourierReport(

            Long courierId,

            String courierName,

            long packageCount,

            BigDecimal totalAmount

    ) {
    }

    public record StaffReport(

            Long userId,

            String fullName,

            String role,

            long packageCount,

            BigDecimal totalAmount

    ) {
    }

    public record DailyReport(

            LocalDate date,

            BigDecimal totalIncome,

            BigDecimal totalExpense,

            BigDecimal netAmount,

            long packageCount,

            BigDecimal packageAmount

    ) {
    }

    public record ExtraExpenseReport(

            Long id,

            LocalDate expenseMonth,

            String description,

            BigDecimal amount

    ) {
    }
}