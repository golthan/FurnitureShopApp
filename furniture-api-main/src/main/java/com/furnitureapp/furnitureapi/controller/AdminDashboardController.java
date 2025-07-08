package com.furnitureapp.furnitureapi.controller;

import com.furnitureapp.furnitureapi.repository.OrderRepository;
import com.furnitureapp.furnitureapi.repository.ProductRepository;
import com.furnitureapp.furnitureapi.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.text.DecimalFormat;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/stats")
@PreAuthorize("hasRole('ADMIN')")
public class AdminDashboardController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private OrderRepository orderRepository;

    private final DecimalFormat formatter = new DecimalFormat("#,###.##");

    @GetMapping("/overview")
    public ResponseEntity<Map<String, Long>> getOverviewStats() {
        long userCount = userRepository.count();
        long productCount = productRepository.count();
        long orderCount = orderRepository.count();

        Map<String, Long> stats = new HashMap<>();
        stats.put("userCount", userCount);
        stats.put("productCount", productCount);
        stats.put("orderCount", orderCount);

        return ResponseEntity.ok(stats);
    }

    @GetMapping("/sales")
    public ResponseEntity<Map<String, String>> getSalesStats() {
        // Lấy dữ liệu thực tế từ cơ sở dữ liệu
        LocalDate today = LocalDate.now();
        LocalDate firstDayOfMonth = today.withDayOfMonth(1);

        // Tính toán các thống kê doanh thu
        Double totalRevenue = orderRepository.calculateTotalRevenue();
        Double monthlyRevenue = orderRepository.calculateRevenueForPeriod(firstDayOfMonth, today);
        Double dailyRevenue = orderRepository.calculateDailyRevenue(today);

        // Xử lý giá trị null (trường hợp không có đơn hàng)
        totalRevenue = totalRevenue != null ? totalRevenue : 0.0;
        monthlyRevenue = monthlyRevenue != null ? monthlyRevenue : 0.0;
        dailyRevenue = dailyRevenue != null ? dailyRevenue : 0.0;

        Map<String, String> salesStats = new HashMap<>();
        salesStats.put("totalRevenue", formatter.format(totalRevenue));
        salesStats.put("monthlyRevenue", formatter.format(monthlyRevenue));
        salesStats.put("dailyRevenue", formatter.format(dailyRevenue));

        return ResponseEntity.ok(salesStats);
    }

    @GetMapping("/products")
    public ResponseEntity<Map<String, String>> getProductStats() {
        // This is a placeholder. Real product statistics would involve more complex
        // queries
        // e.g., top selling products, low stock alerts, etc.
        Map<String, String> productStats = new HashMap<>();
        productStats.put("topSellingProduct", "Luxury Sofa");
        productStats.put("lowStockItems", "5");
        return ResponseEntity.ok(productStats);
    }
}
