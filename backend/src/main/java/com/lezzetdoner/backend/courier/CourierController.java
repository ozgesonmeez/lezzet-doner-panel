package com.lezzetdoner.backend.courier;

import com.lezzetdoner.backend.courier.dto.*;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class CourierController {

    private final CourierService courierService;

    public CourierController(
            CourierService courierService
    ) {
        this.courierService =
                courierService;
    }

    @GetMapping(
            "/couriers/today"
    )
    public List<CourierResponse> getTodayCouriers() {

        return courierService
                .getTodayCouriers();
    }

    @PostMapping(
            "/couriers"
    )
    @ResponseStatus(
            HttpStatus.CREATED
    )
    public CourierResponse createCourier(
            @Valid
            @RequestBody
            CreateCourierRequest request
    ) {

        return courierService
                .createCourier(
                        request.name()
                );
    }

    @PatchMapping(
            "/couriers/{courierId}/status"
    )
    public CourierResponse updateCourierStatus(
            @PathVariable
            Long courierId,

            @RequestBody
            UpdateCourierStatusRequest request
    ) {

        return courierService
                .updateCourierStatus(
                        courierId,
                        request.active()
                );
    }

    @DeleteMapping(
            "/couriers/{courierId}"
    )
    @ResponseStatus(
            HttpStatus.NO_CONTENT
    )
    public void deleteCourier(
            @PathVariable
            Long courierId
    ) {

        courierService
                .deleteCourier(
                        courierId
                );
    }

    @PostMapping(
            "/couriers/{courierId}/entries"
    )
    @ResponseStatus(
            HttpStatus.CREATED
    )
    public CourierResponse createCourierEntry(
            @PathVariable
            Long courierId,

            @Valid
            @RequestBody
            CreateCourierEntryRequest request,

            Authentication authentication
    ) {

        return courierService
                .addEntry(
                        courierId,
                        request.amount(),
                        authentication.getName()
                );
    }

    @PutMapping(
            "/courier-entries/{entryId}"
    )
    @ResponseStatus(
            HttpStatus.NO_CONTENT
    )
    public void updateCourierEntry(
            @PathVariable
            Long entryId,

            @Valid
            @RequestBody
            UpdateCourierEntryRequest request
    ) {

        courierService
                .updateEntry(
                        entryId,
                        request.amount()
                );
    }

    @DeleteMapping(
            "/courier-entries/{entryId}"
    )
    @ResponseStatus(
            HttpStatus.NO_CONTENT
    )
    public void deleteCourierEntry(
            @PathVariable
            Long entryId
    ) {

        courierService
                .deleteEntry(
                        entryId
                );
    }
}