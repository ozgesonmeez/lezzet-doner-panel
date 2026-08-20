package com.lezzetdoner.backend.courier;

import com.lezzetdoner.backend.courier.dto.CourierEntryResponse;
import com.lezzetdoner.backend.courier.dto.CourierResponse;
import com.lezzetdoner.backend.user.AppUser;
import com.lezzetdoner.backend.user.AppUserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;

@Service
public class CourierService {

    private static final ZoneId ISTANBUL_ZONE =
            ZoneId.of("Europe/Istanbul");

    private final CourierRepository courierRepository;

    private final CourierEntryRepository courierEntryRepository;

    private final AppUserRepository userRepository;

    public CourierService(
            CourierRepository courierRepository,
            CourierEntryRepository courierEntryRepository,
            AppUserRepository userRepository
    ) {
        this.courierRepository =
                courierRepository;

        this.courierEntryRepository =
                courierEntryRepository;

        this.userRepository =
                userRepository;
    }

    @Transactional(readOnly = true)
    public List<CourierResponse> getTodayCouriers() {

        LocalDate today =
                LocalDate.now(
                        ISTANBUL_ZONE
                );

        return courierRepository
                .findAllByOrderByActiveDescNameAsc()
                .stream()
                .map(courier ->
                        toResponse(
                                courier,
                                today
                        )
                )
                .toList();
    }

    @Transactional
    public CourierResponse createCourier(
            String rawName
    ) {

        String name =
                normalizeName(
                        rawName
                );

        courierRepository
                .findByNameIgnoreCase(
                        name
                )
                .ifPresent(existing -> {

                    throw new ResponseStatusException(
                            HttpStatus.CONFLICT,
                            "Bu isimde bir kurye zaten mevcut."
                    );
                });

        Courier courier =
                new Courier(
                        name
                );

        Courier savedCourier =
                courierRepository.save(
                        courier
                );

        return toResponse(
                savedCourier,
                LocalDate.now(
                        ISTANBUL_ZONE
                )
        );
    }

    @Transactional
    public CourierResponse updateCourierStatus(
            Long courierId,
            boolean active
    ) {

        Courier courier =
                getCourier(
                        courierId
                );

        courier.setActive(
                active
        );

        Courier savedCourier =
                courierRepository.save(
                        courier
                );

        return toResponse(
                savedCourier,
                LocalDate.now(
                        ISTANBUL_ZONE
                )
        );
    }

    @Transactional
    public CourierResponse addEntry(
            Long courierId,
            BigDecimal amount,
            String authenticatedEmail
    ) {

        Courier courier =
                getCourier(
                        courierId
                );

        if (!courier.isActive()) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Pasif kuryeye paket eklenemez."
            );
        }

        AppUser user =
                getAuthenticatedUser(
                        authenticatedEmail
                );

        LocalDate today =
                LocalDate.now(
                        ISTANBUL_ZONE
                );

        CourierEntry entry =
                new CourierEntry(
                        courier,
                        user,
                        amount,
                        today
                );

        courierEntryRepository.save(
                entry
        );

        return toResponse(
                courier,
                today
        );
    }

    @Transactional
    public void updateEntry(
            Long entryId,
            BigDecimal amount
    ) {

        CourierEntry entry =
                courierEntryRepository
                        .findById(
                                entryId
                        )
                        .orElseThrow(() ->
                                new ResponseStatusException(
                                        HttpStatus.NOT_FOUND,
                                        "Paket kaydı bulunamadı."
                                )
                        );

        entry.setAmount(
                amount
        );

        courierEntryRepository.save(
                entry
        );
    }

    @Transactional
    public void deleteEntry(
            Long entryId
    ) {

        if (
                !courierEntryRepository
                        .existsById(
                                entryId
                        )
        ) {

            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Paket kaydı bulunamadı."
            );
        }

        courierEntryRepository
                .deleteById(
                        entryId
                );
    }

    private Courier getCourier(
            Long courierId
    ) {

        return courierRepository
                .findById(
                        courierId
                )
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Kurye bulunamadı."
                        )
                );
    }

    private AppUser getAuthenticatedUser(
            String email
    ) {

        if (
                email == null ||
                email.isBlank()
        ) {

            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Oturum bilgisi bulunamadı."
            );
        }

        AppUser user =
                userRepository
                        .findByEmail(
                                email
                        )
                        .orElseThrow(() ->
                                new ResponseStatusException(
                                        HttpStatus.UNAUTHORIZED,
                                        "Oturum kullanıcısı bulunamadı."
                                )
                        );

        if (!user.isActive()) {

            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Bu kullanıcı hesabı pasif durumda."
            );
        }

        return user;
    }

    private CourierResponse toResponse(
            Courier courier,
            LocalDate date
    ) {

        List<CourierEntry> entries =
                courierEntryRepository
                        .findByCourierIdAndEntryDateOrderByCreatedAtAsc(
                                courier.getId(),
                                date
                        );

        List<CourierEntryResponse> entryResponses =
                entries.stream()
                        .map(entry -> {

                            AppUser createdBy =
                                    entry.getCreatedBy();

                            return new CourierEntryResponse(
                                    entry.getId(),
                                    entry.getAmount(),
                                    entry.getEntryDate(),
                                    entry.getCreatedAt(),

                                    createdBy != null
                                            ? createdBy.getId()
                                            : null,

                                    createdBy != null
                                            ? createdBy.getFullName()
                                            : null,

                                    createdBy != null
                                            ? createdBy.getRole().name()
                                            : null
                            );
                        })
                        .toList();

        BigDecimal totalAmount =
                entries.stream()
                        .map(
                                CourierEntry::getAmount
                        )
                        .reduce(
                                BigDecimal.ZERO,
                                BigDecimal::add
                        );

        return new CourierResponse(
                courier.getId(),
                courier.getName(),
                courier.isActive(),
                entries.size(),
                totalAmount,
                entryResponses
        );
    }

    private String normalizeName(
            String name
    ) {

        return name
                .trim()
                .replaceAll(
                        "\\s+",
                        " "
                );
    }
}