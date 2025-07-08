package com.furnitureapp.furnitureapi.controller;

import com.furnitureapp.furnitureapi.dto.ProductDTO;
import com.furnitureapp.furnitureapi.dto.ProductImageDTO;
import com.furnitureapp.furnitureapi.dto.ProductImageUploadRequest;
import com.furnitureapp.furnitureapi.dto.ProductRequest;
import com.furnitureapp.furnitureapi.entity.Product;
import com.furnitureapp.furnitureapi.entity.ProductImage;
import com.furnitureapp.furnitureapi.service.ProductService;
import com.furnitureapp.furnitureapi.service.PromotionService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    @Autowired
    private ProductService productService;

    @Autowired
    private PromotionService promotionService;

    @GetMapping
    public Page<ProductDTO> getAllProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) Integer categoryId,
            @RequestParam(required = false) String keyword) {
        Page<Product> products = productService.getAllProducts(page, size, categoryId, keyword);
        return products.map(this::convertToDto);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductDTO> getProductById(@PathVariable Integer id) {
        return productService.getProductById(id)
                .map(this::convertToDto)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProductDTO> createProduct(@Valid @RequestBody ProductRequest productRequest) {
        Product product = new Product();
        product.setName(productRequest.getName());
        product.setDescription(productRequest.getDescription());
        product.setPrice(productRequest.getPrice());
        product.setStock(productRequest.getStock());
        Product createdProduct = productService.createProduct(product, productRequest.getCategoryId(),
                productRequest.getPromotionId());
        return ResponseEntity.ok(convertToDto(createdProduct));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProductDTO> updateProduct(@PathVariable Integer id,
            @Valid @RequestBody ProductRequest productRequest) {
        Product productDetails = new Product();
        productDetails.setName(productRequest.getName());
        productDetails.setDescription(productRequest.getDescription());
        productDetails.setPrice(productRequest.getPrice());
        productDetails.setStock(productRequest.getStock());
        Product updatedProduct = productService.updateProduct(id, productDetails, productRequest.getCategoryId(),
                productRequest.getPromotionId());
        return ResponseEntity.ok(convertToDto(updatedProduct));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteProduct(@PathVariable Integer id) {
        productService.deleteProduct(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{productId}/images")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProductImageDTO> uploadProductImage(
            @PathVariable Integer productId,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "isPrimary", defaultValue = "0") Integer isPrimary) throws IOException {
        ProductImage productImage = productService.uploadProductImage(productId, file, isPrimary);
        return ResponseEntity.ok(convertToDto(productImage));
    }

    @GetMapping("/{productId}/images")
    public List<ProductImageDTO> getProductImages(@PathVariable Integer productId) {
        return productService.getProductImages(productId).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @DeleteMapping("/images/{imageId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteProductImage(@PathVariable Integer imageId) throws IOException {
        productService.deleteProductImage(imageId);
        return ResponseEntity.noContent().build();
    }

    private ProductDTO convertToDto(Product product) {
        ProductDTO dto = new ProductDTO();
        dto.setId(product.getId());
        dto.setName(product.getName());
        dto.setDescription(product.getDescription());
        dto.setPrice(product.getPrice());
        dto.setStock(product.getStock());
        if (product.getCategory() != null) {
            dto.setCategoryId(product.getCategory().getId());
            dto.setCategoryName(product.getCategory().getName());
        }
        if (product.getPromotion() != null && promotionService.isPromotionActive(product.getPromotion())) {
            dto.setPromotionId(product.getPromotion().getId());
            dto.setPromotionTitle(product.getPromotion().getTitle());
        } else {
            dto.setPromotionId(null);
            dto.setPromotionTitle(null);
        }
        // Fetch images separately if needed, or eager load them in entity
        List<ProductImageDTO> images = productService.getProductImages(product.getId()).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
        dto.setImages(images);
        return dto;
    }

    private ProductImageDTO convertToDto(ProductImage productImage) {
        return new ProductImageDTO(productImage.getId(), productImage.getImageUrl(), productImage.getIsPrimary());
    }
}
