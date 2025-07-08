package com.furnitureapp.furnitureapi.controller;

import com.furnitureapp.furnitureapi.dto.PromotionDTO;
import com.furnitureapp.furnitureapi.dto.PromotionRequest;
import com.furnitureapp.furnitureapi.entity.Promotion;
import com.furnitureapp.furnitureapi.service.PromotionService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/promotions")
public class PromotionController {

    @Autowired
    private PromotionService promotionService;

    @GetMapping
    public List<PromotionDTO> getAllPromotions() {
        return promotionService.getAllPromotions().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<PromotionDTO> getPromotionById(@PathVariable Integer id) {
        return promotionService.getPromotionById(id)
                .map(this::convertToDto)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PromotionDTO> createPromotion(@Valid @RequestBody PromotionRequest promotionRequest) {
        Promotion promotion = new Promotion();
        promotion.setTitle(promotionRequest.getTitle());
        promotion.setDiscountPercent(promotionRequest.getDiscountPercent());
        promotion.setStartDate(promotionRequest.getStartDate());
        promotion.setEndDate(promotionRequest.getEndDate());
        Promotion createdPromotion = promotionService.createPromotion(promotion);
        return ResponseEntity.ok(convertToDto(createdPromotion));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PromotionDTO> updatePromotion(@PathVariable Integer id,
            @Valid @RequestBody PromotionRequest promotionRequest) {
        Promotion promotionDetails = new Promotion();
        promotionDetails.setTitle(promotionRequest.getTitle());
        promotionDetails.setDiscountPercent(promotionRequest.getDiscountPercent());
        promotionDetails.setStartDate(promotionRequest.getStartDate());
        promotionDetails.setEndDate(promotionRequest.getEndDate());
        Promotion updatedPromotion = promotionService.updatePromotion(id, promotionDetails);
        return ResponseEntity.ok(convertToDto(updatedPromotion));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deletePromotion(@PathVariable Integer id) {
        promotionService.deletePromotion(id);
        return ResponseEntity.noContent().build();
    }

    private PromotionDTO convertToDto(Promotion promotion) {
        return new PromotionDTO(promotion.getId(), promotion.getTitle(), promotion.getDiscountPercent(),
                promotion.getStartDate(), promotion.getEndDate());
    }
}
