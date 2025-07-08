package com.furnitureapp.furnitureapi.dto;

import java.time.LocalDate;

public class PromotionDTO {
    private Integer id;
    private String title;
    private Double discountPercent;
    private LocalDate startDate;
    private LocalDate endDate;

    public PromotionDTO() {
    }

    public PromotionDTO(Integer id, String title, Double discountPercent, LocalDate startDate, LocalDate endDate) {
        this.id = id;
        this.title = title;
        this.discountPercent = discountPercent;
        this.startDate = startDate;
        this.endDate = endDate;
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public Double getDiscountPercent() {
        return discountPercent;
    }

    public void setDiscountPercent(Double discountPercent) {
        this.discountPercent = discountPercent;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }
}
