package com.furnitureapp.furnitureapi.controller;

import com.furnitureapp.furnitureapi.dto.OrderDTO;
import com.furnitureapp.furnitureapi.dto.OrderItemDTO;
import com.furnitureapp.furnitureapi.dto.OrderRequest;
import com.furnitureapp.furnitureapi.dto.PaginatedOrderResponse;
import org.springframework.data.domain.Page;
import com.furnitureapp.furnitureapi.entity.Order;
import com.furnitureapp.furnitureapi.entity.OrderItem;
import com.furnitureapp.furnitureapi.entity.Product;
import com.furnitureapp.furnitureapi.service.OrderService;
import com.furnitureapp.furnitureapi.service.ProductService;
import com.furnitureapp.furnitureapi.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Autowired
    private OrderService orderService;

    @Autowired
    private UserService userService;

    @Autowired
    private ProductService productService;

    @GetMapping
    @PreAuthorize("hasRole('CUSTOMER') or hasRole('ADMIN')")
    public List<OrderDTO> getOrdersForCurrentUser(@RequestParam Integer currentUserId) {
        return orderService.getOrdersByUserId(currentUserId).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('CUSTOMER') or hasRole('ADMIN')")
    public ResponseEntity<OrderDTO> getOrderById(@PathVariable Integer id) {
        return orderService.getOrderById(id)
                .map(this::convertToDto)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasRole('CUSTOMER') or hasRole('ADMIN')")
    public ResponseEntity<OrderDTO> createOrder(@Valid @RequestBody OrderRequest orderRequest) {
        List<OrderItem> orderItems = orderRequest.getItems().stream()
                .map(itemRequest -> {
                    OrderItem orderItem = new OrderItem();
                    Product product = productService.getProductById(itemRequest.getProductId())
                            .orElseThrow(() -> new RuntimeException("Product not found"));
                    orderItem.setProduct(product);
                    orderItem.setQuantity(itemRequest.getQuantity());
                    return orderItem;
                }).collect(Collectors.toList());

        Order createdOrder = orderService.createOrder(orderRequest.getUserId(), orderItems);
        return ResponseEntity.ok(convertToDto(createdOrder));
    }

    @PutMapping("/{id}/{status}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<OrderDTO> updateOrderStatus(@PathVariable Integer id, @PathVariable String status) {
        Order updatedOrder = orderService.updateOrderStatus(id, status);
        return ResponseEntity.ok(convertToDto(updatedOrder));
    }

    @GetMapping("/admin/orders")
    @PreAuthorize("hasRole('ADMIN')")
    public PaginatedOrderResponse getAllOrdersForAdmin(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<Order> ordersPage = orderService.getAllOrders(page, size);
        List<OrderDTO> orderDTOs = ordersPage.getContent().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
        return new PaginatedOrderResponse(orderDTOs, ordersPage.getTotalPages());
    }

    private OrderDTO convertToDto(Order order) {
        OrderDTO dto = new OrderDTO();
        dto.setId(order.getId());
        dto.setUserId(order.getUser().getId());
        dto.setUsername(order.getUser().getUsername());
        dto.setOrderDate(order.getOrderDate());
        dto.setStatus(order.getStatus());
        dto.setTotalAmount(order.getTotalAmount()); // Set total amount
        List<OrderItemDTO> itemDTOs = order.getOrderItems().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
        dto.setOrderItems(itemDTOs);
        return dto;
    }

    private OrderItemDTO convertToDto(OrderItem orderItem) {
        return new OrderItemDTO(orderItem.getId(), orderItem.getProduct().getId(),
                orderItem.getProduct().getName(), orderItem.getUnitPrice(), orderItem.getQuantity());
    }
}
