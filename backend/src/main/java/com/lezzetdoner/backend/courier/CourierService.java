package com.lezzetdoner.backend.courier;

import com.lezzetdoner.backend.courier.dto.CourierEntryResponse;
import com.lezzetdoner.backend.courier.dto.CourierResponse;
import com.lezzetdoner.backend.user.AppUser;
import com.lezzetdoner.backend.user.AppUserRepository;
import com.lezzetdoner.backend.user.UserRole;
import org.springframework.dao.DataIntegrityViolationException;
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
            ZoneId.of(
                    "Europe/Istanbul"
            );

    private final CourierRepository
            courierRepository;

    private final CourierEntryRepository
            courierEntryRepository;

    private final AppUserRepository
            userRepository;

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
    public List<CourierResponse>
    getTodayCouriers() {

        LocalDate today =
                LocalDate.now(
                        ISTANBUL_ZONE
                );

        return getCouriersForDateInternal(
                today
        );
    }

    @Transactional(readOnly = true)
    public List<CourierResponse>
    getCouriersForDate(
            LocalDate requestedDate,
            String authenticatedEmail
    ) {

        AppUser user =
                getAuthenticatedUser(
                        authenticatedEmail
                );

        LocalDate date =
                resolveEntryDate(
                        requestedDate
                );

        LocalDate today =
                LocalDate.now(
                        ISTANBUL_ZONE
                );

        if (
                user.getRole()
                        != UserRole.ADMIN
                        &&
                !date.equals(today)
        ) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Geçmiş tarihli kurye kayıtlarını yalnızca yönetici görüntüleyebilir."
            );
        }

        return getCouriersForDateInternal(
                date
        );
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
    public CourierResponse
    updateCourierStatus(
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
    public void deleteCourier(
            Long courierId
    ) {

        Courier courier =
                getCourier(
                        courierId
                );

        try {
            courierRepository.delete(
                    courier
            );

            courierRepository.flush();
        } catch (
                DataIntegrityViolationException exception
        ) {

            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Paket geçmişi olan kurye silinemez. Geçmiş kayıtları korumak için kuryeyi pasife alın."
            );
        }
    }

    @Transactional
    public CourierResponse addEntry(
            Long courierId,
            BigDecimal amount,
            LocalDate requestedDate,
            CourierEntryType requestedType,
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

        LocalDate entryDate =
                resolveEntryDate(
                        requestedDate
                );

        LocalDate today =
                LocalDate.now(
                        ISTANBUL_ZONE
                );

        if (
                user.getRole()
                        != UserRole.ADMIN
                        &&
                !entryDate.equals(today)
        ) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Geçmiş tarihe paket kaydını yalnızca yönetici ekleyebilir."
            );
        }

        CourierEntryType entryType =
                requestedType != null
                        ? requestedType
                        : CourierEntryType.NORMAL;

        validateEntryAmount(
                entryType,
                amount
        );

        CourierEntry entry =
                new CourierEntry(
                        courier,
                        user,
                        amount,
                        entryDate,
                        entryType
                );

        courierEntryRepository.save(
                entry
        );

        return toResponse(
                courier,
                entryDate
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

        if (
                entry.getEntryType()
                        == CourierEntryType.ONLINE
        ) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Online paket tutarı düzenlenemez."
            );
        }

        if (
                amount == null
                        ||
                amount.compareTo(
                        BigDecimal.ZERO
                ) <= 0
        ) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Normal paket tutarı 0'dan büyük olmalıdır."
            );
        }

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

    private List<CourierResponse>
    getCouriersForDateInternal(
            LocalDate date
    ) {

        return courierRepository
                .findAllByOrderByActiveDescNameAsc()
                .stream()
                .map(courier ->
                        toResponse(
                                courier,
                                date
                        )
                )
                .toList();
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
                email == null
                        ||
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

    private LocalDate resolveEntryDate(
            LocalDate requestedDate
    ) {

        LocalDate today =
                LocalDate.now(
                        ISTANBUL_ZONE
                );

        LocalDate date =
                requestedDate != null
                        ? requestedDate
                        : today;

        if (
                date.isAfter(
                        today
                )
        ) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Gelecek tarihe paket kaydı eklenemez."
            );
        }

        return date;
    }

    private void validateEntryAmount(
            CourierEntryType entryType,
            BigDecimal amount
    ) {

        if (amount == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Paket tutarı gereklidir."
            );
        }

        if (
                entryType
                        == CourierEntryType.NORMAL
                        &&
                amount.compareTo(
                        BigDecimal.ZERO
                ) <= 0
        ) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Normal paket tutarı 0'dan büyük olmalıdır."
            );
        }

        if (
                entryType
                        == CourierEntryType.ONLINE
                        &&
                amount.compareTo(
                        BigDecimal.ZERO
                ) != 0
        ) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Online paket tutarı 0 TL olmalıdır."
            );
        }
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

        List<CourierEntryResponse>
                entryResponses =
                entries.stream()
                        .map(entry -> {

                            AppUser createdBy =
                                    entry.getCreatedBy();

                            return new CourierEntryResponse(
                                    entry.getId(),
                                    entry.getAmount(),
                                    entry.getEntryDate(),
                                    entry.getEntryType()
                                            .name(),
                                    entry.getCreatedAt(),

                                    createdBy != null
                                            ? createdBy.getId()
                                            : null,

                                    createdBy != null
                                            ? createdBy.getFullName()
                                            : null,

                                    createdBy != null
                                            ? createdBy.getRole()
                                            .name()
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