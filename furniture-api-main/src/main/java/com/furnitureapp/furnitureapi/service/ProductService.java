package com.furnitureapp.furnitureapi.service;

import com.furnitureapp.furnitureapi.entity.Category;
import com.furnitureapp.furnitureapi.entity.Product;
import com.furnitureapp.furnitureapi.entity.ProductImage;
import com.furnitureapp.furnitureapi.entity.Promotion;
import com.furnitureapp.furnitureapi.repository.CategoryRepository;
import com.furnitureapp.furnitureapi.repository.ProductImageRepository;
import com.furnitureapp.furnitureapi.repository.ProductRepository;
import com.furnitureapp.furnitureapi.repository.PromotionRepository;
import com.furnitureapp.furnitureapi.service.PromotionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class ProductService {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private PromotionRepository promotionRepository;

    @Autowired
    private PromotionService promotionService;

    @Autowired
    private ProductImageRepository productImageRepository;

    private final Path fileStorageLocation = Paths.get("uploads").toAbsolutePath().normalize();

    public ProductService() {
        try {
            Files.createDirectories(this.fileStorageLocation);
        } catch (Exception ex) {
            throw new RuntimeException("Could not create the directory where the uploaded files will be stored.", ex);
        }
    }

    public Page<Product> getAllProducts(int page, int size, Integer categoryId, String keyword) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Product> products;
        if (categoryId != null && keyword != null && !keyword.isEmpty()) {
            products = productRepository
                    .findByCategoryIdAndNameContainingIgnoreCaseOrCategoryIdAndDescriptionContainingIgnoreCase(
                            categoryId, keyword, categoryId, keyword, pageable);
        } else if (categoryId != null) {
            products = productRepository.findByCategoryId(categoryId, pageable);
        } else if (keyword != null && !keyword.isEmpty()) {
            products = productRepository.findByNameContainingIgnoreCaseOrDescriptionContainingIgnoreCase(keyword,
                    keyword,
                    pageable);
        } else {
            products = productRepository.findAll(pageable);
        }

        // Clean up invalid promotions
        products.forEach(product -> {
            if (product.getPromotion() != null && !promotionService.isPromotionActive(product.getPromotion())) {
                product.setPromotion(null);
                productRepository.save(product);
            }
        });

        return products;
    }

    public Optional<Product> getProductById(Integer id) {
        Optional<Product> product = productRepository.findById(id);
        product.ifPresent(p -> {
            if (p.getPromotion() != null && !promotionService.isPromotionActive(p.getPromotion())) {
                p.setPromotion(null);
                productRepository.save(p);
            }
        });
        return product;
    }

    public Product createProduct(Product product, Integer categoryId, Integer promotionId) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new RuntimeException("Category not found"));
        product.setCategory(category);

        if (promotionId != null) {
            Promotion promotion = promotionRepository.findById(promotionId)
                    .orElseThrow(() -> new RuntimeException("Promotion not found"));
            if (promotionService.isPromotionActive(promotion)) {
                product.setPromotion(promotion);
            }
        }
        return productRepository.save(product);
    }

    public Product updateProduct(Integer id, Product productDetails, Integer categoryId, Integer promotionId) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        product.setName(productDetails.getName());
        product.setDescription(productDetails.getDescription());
        product.setPrice(productDetails.getPrice());
        product.setStock(productDetails.getStock());

        if (categoryId != null) {
            Category category = categoryRepository.findById(categoryId)
                    .orElseThrow(() -> new RuntimeException("Category not found"));
            product.setCategory(category);
        } else {
            product.setCategory(null);
        }

        if (promotionId != null) {
            Promotion promotion = promotionRepository.findById(promotionId)
                    .orElseThrow(() -> new RuntimeException("Promotion not found"));
            if (promotionService.isPromotionActive(promotion)) {
                product.setPromotion(promotion);
            } else {
                product.setPromotion(null);
            }
        } else {
            product.setPromotion(null);
        }

        return productRepository.save(product);
    }

    public void deleteProduct(Integer id) {
        productRepository.deleteById(id);
    }

    public ProductImage uploadProductImage(Integer productId, MultipartFile file, Integer isPrimary)
            throws IOException {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        String fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
        Path targetLocation = this.fileStorageLocation.resolve(fileName);
        Files.copy(file.getInputStream(), targetLocation);

        ProductImage productImage = new ProductImage();
        productImage.setProduct(product);
        productImage.setImageUrl("http://localhost:8080/uploads/" + fileName); // Store full URL
        productImage.setIsPrimary(isPrimary != null ? isPrimary : 0); // Default to secondary if not specified

        return productImageRepository.save(productImage);
    }

    public List<ProductImage> getProductImages(Integer productId) {
        return productImageRepository.findByProductId(productId);
    }

    public void deleteProductImage(Integer imageId) throws IOException {
        ProductImage productImage = productImageRepository.findById(imageId)
                .orElseThrow(() -> new RuntimeException("Product image not found"));

        String imageUrl = productImage.getImageUrl();
        // Chỉ xóa file vật lý nếu là file nội bộ
        if (imageUrl != null
                && (imageUrl.startsWith("http://localhost:8080/uploads/") || imageUrl.startsWith("/uploads/"))) {
            String fileName = imageUrl.replace("http://localhost:8080/uploads/", "").replace("/uploads/", "");
            Path filePath = Paths.get(fileStorageLocation.toString(), fileName);
            Files.deleteIfExists(filePath);
        }

        productImageRepository.delete(productImage);
    }
}
