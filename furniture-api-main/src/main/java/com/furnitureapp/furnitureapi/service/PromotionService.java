package com.furnitureapp.furnitureapi.service;

import com.furnitureapp.furnitureapi.entity.Promotion;
import com.furnitureapp.furnitureapi.repository.PromotionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class PromotionService {

    @Autowired
    private PromotionRepository promotionRepository;

    public List<Promotion> getAllPromotions() {
        return promotionRepository.findAll();
    }

    public List<Promotion> getActivePromotions() {
        return promotionRepository.findByEndDateAfterOrEndDateIsNull(LocalDate.now());
    }

    public Optional<Promotion> getPromotionById(Integer id) {
        return promotionRepository.findById(id);
    }

    public Promotion createPromotion(Promotion promotion) {
        return promotionRepository.save(promotion);
    }

    public Promotion updatePromotion(Integer id, Promotion promotionDetails) {
        Promotion promotion = promotionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Promotion not found with id " + id));
        promotion.setTitle(promotionDetails.getTitle());
        promotion.setDiscountPercent(promotionDetails.getDiscountPercent());
        promotion.setStartDate(promotionDetails.getStartDate());
        promotion.setEndDate(promotionDetails.getEndDate());
        return promotionRepository.save(promotion);
    }

    public void deletePromotion(Integer id) {
        promotionRepository.deleteById(id);
    }

    public boolean isPromotionActive(Promotion promotion) {
        if (promotion == null)
            return false;
        LocalDate now = LocalDate.now();
        return !now.isBefore(promotion.getStartDate()) &&
                !now.isAfter(promotion.getEndDate());
    }
}
