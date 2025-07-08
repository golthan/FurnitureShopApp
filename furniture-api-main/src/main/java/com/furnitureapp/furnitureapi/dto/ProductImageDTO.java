package com.furnitureapp.furnitureapi.dto;

public class ProductImageDTO {
    private Integer id;
    private String imageUrl;
    private Integer isPrimary;

    public ProductImageDTO() {
    }

    public ProductImageDTO(Integer id, String imageUrl, Integer isPrimary) {
        this.id = id;
        this.imageUrl = imageUrl;
        this.isPrimary = isPrimary;
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public Integer getIsPrimary() {
        return isPrimary;
    }

    public void setIsPrimary(Integer isPrimary) {
        this.isPrimary = isPrimary;
    }
}
