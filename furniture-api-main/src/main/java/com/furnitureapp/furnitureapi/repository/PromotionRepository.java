package com.furnitureapp.furnitureapi.repository;

import com.furnitureapp.furnitureapi.entity.Promotion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface PromotionRepository extends JpaRepository<Promotion, Integer> {
    List<Promotion> findByEndDateAfterOrEndDateIsNull(LocalDate currentDate);
}
