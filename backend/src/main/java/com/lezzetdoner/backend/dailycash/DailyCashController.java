package com.lezzetdoner.backend.dailycash;

import com.lezzetdoner.backend.dailycash.dto.*;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/daily-cash")
public class DailyCashController {

    private final DailyCashService dailyCashService;

    public DailyCashController(
            DailyCashService dailyCashService
    ) {
        this.dailyCashService = dailyCashService;
    }

    @GetMapping
    public DailyCashResponse getDailyCash(
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate date
    ) {

        return dailyCashService.getDailyCash(date);
    }

    @PostMapping("/incomes")
    @ResponseStatus(HttpStatus.CREATED)
    public DailyIncomeResponse createIncome(
            @Valid
            @RequestBody
            CreateIncomeRequest request
    ) {

        return dailyCashService.createIncome(request);
    }

    @PutMapping("/incomes/{incomeId}")
    public DailyIncomeResponse updateIncome(
            @PathVariable Long incomeId,
            @Valid
            @RequestBody
            UpdateIncomeRequest request
    ) {

        return dailyCashService.updateIncome(
                incomeId,
                request
        );
    }

    @DeleteMapping("/incomes/{incomeId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteIncome(
            @PathVariable Long incomeId
    ) {

        dailyCashService.deleteIncome(incomeId);
    }

    @PostMapping("/expenses")
    @ResponseStatus(HttpStatus.CREATED)
    public DailyExpenseResponse createExpense(
            @Valid
            @RequestBody
            CreateExpenseRequest request
    ) {

        return dailyCashService.createExpense(request);
    }

    @PutMapping("/expenses/{expenseId}")
    public DailyExpenseResponse updateExpense(
            @PathVariable Long expenseId,
            @Valid
            @RequestBody
            UpdateExpenseRequest request
    ) {

        return dailyCashService.updateExpense(
                expenseId,
                request
        );
    }

    @DeleteMapping("/expenses/{expenseId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteExpense(
            @PathVariable Long expenseId
    ) {

        dailyCashService.deleteExpense(expenseId);
    }
}