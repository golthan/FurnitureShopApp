package com.furnitureapp.furnitureapi.repository;

import com.furnitureapp.furnitureapi.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Integer> {
    List<Order> findByUserId(Integer userId);

    @Query("SELECT SUM(o.totalAmount) FROM Order o")
    Double calculateTotalRevenue();

    @Query("SELECT SUM(o.totalAmount) FROM Order o WHERE o.orderDate >= :startDate AND o.orderDate <= :endDate")
    Double calculateRevenueForPeriod(LocalDate startDate, LocalDate endDate);

    @Query("SELECT SUM(o.totalAmount) FROM Order o WHERE o.orderDate = :date")
    Double calculateDailyRevenue(LocalDate date);
}
