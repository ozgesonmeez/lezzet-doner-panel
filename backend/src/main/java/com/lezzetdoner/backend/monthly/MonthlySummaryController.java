package com.lezzetdoner.backend.monthly;

import com.lezzetdoner.backend.monthly.dto.*;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.YearMonth;
import java.time.format.DateTimeParseException;

@RestController
@RequestMapping("/api/monthly-summary")
public class MonthlySummaryController {

    private final MonthlySummaryService monthlySummaryService;

    public MonthlySummaryController(
            MonthlySummaryService monthlySummaryService
    ) {
        this.monthlySummaryService =
                monthlySummaryService;
    }

    @GetMapping
    public MonthlySummaryResponse getSummary(
            @RequestParam(required = false)
            String month
    ) {

        return monthlySummaryService.getSummary(
                parseMonth(month)
        );
    }

    @PostMapping("/extra-expenses")
    @ResponseStatus(HttpStatus.CREATED)
    public MonthlyExtraExpenseResponse createExtraExpense(
            @RequestParam(required = false)
            String month,

            @Valid
            @RequestBody
            CreateMonthlyExpenseRequest request
    ) {

        return monthlySummaryService.createExtraExpense(
                parseMonth(month),
                request
        );
    }

    @PutMapping("/extra-expenses/{expenseId}")
    public MonthlyExtraExpenseResponse updateExtraExpense(
            @PathVariable Long expenseId,

            @Valid
            @RequestBody
            UpdateMonthlyExpenseRequest request
    ) {

        return monthlySummaryService.updateExtraExpense(
                expenseId,
                request
        );
    }

    @DeleteMapping("/extra-expenses/{expenseId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteExtraExpense(
            @PathVariable Long expenseId
    ) {

        monthlySummaryService.deleteExtraExpense(
                expenseId
        );
    }

    private YearMonth parseMonth(
            String value
    ) {

        if (value == null || value.isBlank()) {
            return null;
        }

        try {
            return YearMonth.parse(value);
        } catch (DateTimeParseException exception) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Ay bilgisi YYYY-MM formatında olmalıdır."
            );
        }
    }
}