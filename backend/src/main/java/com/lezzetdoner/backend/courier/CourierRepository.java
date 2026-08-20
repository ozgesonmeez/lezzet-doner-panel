package com.lezzetdoner.backend.courier;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CourierRepository extends JpaRepository<Courier, Long> {

    Optional<Courier> findByNameIgnoreCase(String name);

    List<Courier> findAllByOrderByActiveDescNameAsc();
}