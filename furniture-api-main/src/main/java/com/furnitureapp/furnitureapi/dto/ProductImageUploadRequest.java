package com.furnitureapp.furnitureapi.dto;

import jakarta.validation.constraints.NotNull;
import org.springframework.web.multipart.MultipartFile;

public class ProductImageUploadRequest {
    @NotNull
    private MultipartFile file;
    private Integer isPrimary; // 1 for primary, 0 for secondary

    public MultipartFile getFile() {
        return file;
    }

    public void setFile(MultipartFile file) {
        this.file = file;
    }

    public Integer getIsPrimary() {
        return isPrimary;
    }

    public void setIsPrimary(Integer isPrimary) {
        this.isPrimary = isPrimary;
    }
}
