package com.furnitureapp.furnitureapi.repository;

import com.furnitureapp.furnitureapi.entity.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Integer> {
    // Có thể thêm các phương thức custom nếu cần
    Optional<Customer> findByUserId(Integer userId);
}