package com.furnitureapp.furnitureapi.service;

import com.furnitureapp.furnitureapi.entity.Order;
import com.furnitureapp.furnitureapi.entity.OrderItem;
import com.furnitureapp.furnitureapi.entity.Product;
import com.furnitureapp.furnitureapi.entity.User;
import com.furnitureapp.furnitureapi.repository.OrderItemRepository;
import com.furnitureapp.furnitureapi.repository.OrderRepository;
import com.furnitureapp.furnitureapi.entity.Promotion;
import com.furnitureapp.furnitureapi.repository.ProductRepository;
import com.furnitureapp.furnitureapi.repository.PromotionRepository;
import com.furnitureapp.furnitureapi.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderItemRepository orderItemRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private PromotionRepository promotionRepository;

    public Page<Order> getAllOrders(int page, int size) {
        return orderRepository.findAll(PageRequest.of(page, size));
    }

    public Optional<Order> getOrderById(Integer id) {
        return orderRepository.findById(id);
    }

    public List<Order> getOrdersByUserId(Integer userId) {
        return orderRepository.findByUserId(userId);
    }

    @Transactional
    public Order createOrder(Integer userId, List<OrderItem> items) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Order order = new Order();
        order.setUser(user);
        order.setOrderDate(LocalDate.now());
        order.setStatus("pending"); // Initial status
        order.setTotalAmount(0.0); // Initialize total amount
        order = orderRepository.save(order);

        Double totalAmount = 0.0;
        for (OrderItem item : items) {
            Product product = productRepository.findById(item.getProduct().getId())
                    .orElseThrow(() -> new RuntimeException("Product not found: " + item.getProduct().getId()));
            if (product.getStock() < item.getQuantity()) {
                throw new RuntimeException("Not enough stock for product: " + product.getName());
            }

            Double unitPrice = product.getPrice();

            if (product.getPromotion() != null) {
                Optional<Promotion> promotionOptional = promotionRepository.findById(product.getPromotion().getId());
                if (promotionOptional.isPresent()) {
                    Promotion promotion = promotionOptional.get();
                    // Apply promotion discount
                    unitPrice = unitPrice * (1 - promotion.getDiscountPercent() / 100.0);
                }
            }

            item.setOrder(order);
            item.setProduct(product);
            item.setUnitPrice(unitPrice);
            orderItemRepository.save(item);

            totalAmount += unitPrice * item.getQuantity();

            // Decrease product stock
            product.setStock(product.getStock() - item.getQuantity());
            productRepository.save(product);
        }
        order.setTotalAmount(totalAmount);
        orderRepository.save(order); // Save order with updated total amount
        return order;
    }

    public Order updateOrderStatus(Integer id, String status) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        order.setStatus(status);
        return orderRepository.save(order);
    }
}
