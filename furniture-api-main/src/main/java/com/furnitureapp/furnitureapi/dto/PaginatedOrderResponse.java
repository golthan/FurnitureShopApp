package com.furnitureapp.furnitureapi.dto;

import java.util.List;

public class PaginatedOrderResponse {
    private List<OrderDTO> orders;
    private int totalPages;

    public PaginatedOrderResponse() {
    }

    public PaginatedOrderResponse(List<OrderDTO> orders, int totalPages) {
        this.orders = orders;
        this.totalPages = totalPages;
    }

    public List<OrderDTO> getOrders() {
        return orders;
    }

    public void setOrders(List<OrderDTO> orders) {
        this.orders = orders;
    }

    public int getTotalPages() {
        return totalPages;
    }

    public void setTotalPages(int totalPages) {
        this.totalPages = totalPages;
    }
}
