import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  TextInput,
  Modal,
  ScrollView,
  Alert,
  Platform,
} from "react-native";
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  fetchCategories,
  getPromotions,
  uploadProductImage,
  deleteProductImage,
  API_BASE_URL,
} from "../../services/api";
import {
  Product,
  Category,
  Promotion,
  ProductRequest,
  ProductImage,
} from "../../types";
import Ionicons from "react-native-vector-icons/Ionicons";
import * as ImagePicker from "expo-image-picker";

interface ImageManagerModalProps {
  visible: boolean;
  onClose: () => void;
  product: Product | null;
  onImageUpdate: (productId: number, images: ProductImage[]) => void;
}

const ImageManagerModal: React.FC<ImageManagerModalProps> = ({
  visible,
  onClose,
  product,
  onImageUpdate,
}) => {
  if (!product) return null;

  const [images, setImages] = useState<ProductImage[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setImages(product.images || []);
  }, [product]);

  const handlePickImage = async () => {
    try {
      // Yêu cầu quyền truy cập vào thư viện ảnh
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert(
          "Cần cấp quyền",
          "Bạn cần cấp quyền truy cập vào thư viện ảnh để tải ảnh lên."
        );
        return;
      }

      // Mở trình chọn ảnh từ thư viện
      const pickerResult = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (pickerResult.canceled) {
        return;
      }

      if (pickerResult.assets && pickerResult.assets.length > 0) {
        setLoading(true);

        try {
          const selectedAsset = pickerResult.assets[0];
          const uri = selectedAsset.uri;

          // Tạo file object cho FormData
          const fileToUpload = {
            uri,
            type: selectedAsset.mimeType || "image/jpeg",
            name: uri.split("/").pop() || `image-${Date.now()}.jpg`,
          };

          // Gọi API tải ảnh
          const newImage = await uploadProductImage(
            product.id,
            fileToUpload,
            0
          );

          // Cập nhật danh sách ảnh
          const updatedImages = [...images, newImage];
          setImages(updatedImages);
          onImageUpdate(product.id, updatedImages);

          Alert.alert("Thành công", "Tải ảnh lên thành công");
        } catch (error) {
          Alert.alert("Lỗi", "Không thể tải ảnh lên. Vui lòng thử lại sau.");
        } finally {
          setLoading(false);
        }
      }
    } catch (error) {
      Alert.alert("Lỗi", "Không thể truy cập thư viện ảnh. Vui lòng thử lại.");
    }
  };

  const handleDelete = async (imageId: number) => {
    setLoading(true);
    try {
      await deleteProductImage(imageId);
      const updatedImages = images.filter((img) => img.id !== imageId);
      setImages(updatedImages);
      onImageUpdate(product.id, updatedImages);
    } catch (error) {
      console.error("Error deleting image:", error);
      Alert.alert("Lỗi", "Không thể xóa ảnh.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Quản lý ảnh: {product.name}</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>
          <FlatList
            data={images}
            keyExtractor={(item) => item.id.toString()}
            numColumns={2}
            renderItem={({ item }) => (
              <View style={styles.imageContainer}>
                <Image
                  source={{
                    uri: item.imageUrl.replace(
                      "http://localhost:8080",
                      API_BASE_URL
                    ),
                  }}
                  style={styles.gridImage}
                />
                <TouchableOpacity
                  style={styles.deleteImageIcon}
                  onPress={() => handleDelete(item.id)}
                >
                  <Ionicons name="trash-bin" size={20} color="white" />
                </TouchableOpacity>
              </View>
            )}
            ListEmptyComponent={
              <Text style={styles.emptyText}>Chưa có ảnh nào.</Text>
            }
            ListFooterComponent={
              <TouchableOpacity
                style={styles.uploadButton}
                onPress={handlePickImage}
              >
                <Ionicons name="add" size={24} color="white" />
                <Text style={styles.uploadButtonText}>Tải ảnh mới</Text>
              </TouchableOpacity>
            }
          />
          {loading && (
            <ActivityIndicator style={StyleSheet.absoluteFill} size="large" />
          )}
        </View>
      </View>
    </Modal>
  );
};

const AdminProductsScreen = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [productImages, setProductImages] = useState<ProductImage[]>([]);

  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>(
    undefined
  );

  const [formData, setFormData] = useState<ProductRequest>({
    name: "",
    description: "",
    price: 0,
    stock: 0,
    categoryId: 0,
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const loadInitialData = useCallback(async () => {
    try {
      setLoading(true);
      // Fetch static data once
      const categoriesData = await fetchCategories();
      setCategories(categoriesData);
      if (categoriesData.length > 0) {
        setFormData((prev) => ({ ...prev, categoryId: categoriesData[0].id }));
      }

      const promotionsData = await getPromotions();
      setPromotions(promotionsData);

      // Fetch first page of products
      loadProducts(0, true);
    } catch (error) {
      console.error("Error loading initial data:", error);
      Alert.alert("Lỗi", "Không thể tải dữ liệu cần thiết");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  const loadProducts = async (page: number, isRefresh = false) => {
    if (loadingMore) return;

    page === 0 ? setLoading(true) : setLoadingMore(true);

    try {
      const productsData = await getProducts(
        page,
        10,
        selectedCategory,
        searchQuery
      );
      if (isRefresh) {
        setProducts(productsData.content);
      } else {
        setProducts((prev) => [...prev, ...productsData.content]);
      }
      setTotalPages(productsData.totalPages);
      setCurrentPage(page);
    } catch (error) {
      console.error("Error loading products:", error);
      Alert.alert("Lỗi", "Không thể tải danh sách sản phẩm");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleRefresh = () => {
    loadProducts(0, true);
  };

  const handleLoadMore = () => {
    if (currentPage < totalPages - 1 && !loadingMore) {
      loadProducts(currentPage + 1);
    }
  };

  const handleSearch = () => {
    loadProducts(0, true);
  };

  const handleCategoryFilter = (categoryId?: number) => {
    setSelectedCategory(categoryId);
    // The search will be triggered by the useEffect that watches selectedCategory
  };

  useEffect(() => {
    // Debounce search
    const timer = setTimeout(() => {
      loadProducts(0, true);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery, selectedCategory]);

  const openCreateModal = () => {
    setCurrentProduct(null);
    setFormData({
      name: "",
      description: "",
      price: 0,
      stock: 0,
      categoryId: categories.length > 0 ? categories[0].id : 0,
      promotionId: undefined,
    });
    setFormErrors({});
    setModalVisible(true);
  };

  const openEditModal = (product: Product) => {
    setCurrentProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      categoryId: product.categoryId,
      promotionId: product.promotionId,
    });
    setFormErrors({});
    setModalVisible(true);
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) {
      errors.name = "Tên sản phẩm không được để trống";
    }

    if (!formData.description.trim()) {
      errors.description = "Mô tả không được để trống";
    }

    if (formData.price <= 0) {
      errors.price = "Giá phải lớn hơn 0";
    }

    if (formData.stock < 0) {
      errors.stock = "Số lượng không được âm";
    }

    if (!formData.categoryId) {
      errors.categoryId = "Vui lòng chọn danh mục";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      if (currentProduct) {
        const updatedProduct = await updateProduct(currentProduct.id, formData);
        setProducts(
          products.map((p) =>
            p.id === updatedProduct.id ? { ...p, ...updatedProduct } : p
          )
        );
        Alert.alert("Thành công", "Cập nhật sản phẩm thành công");
      } else {
        const newProduct = await createProduct(formData);
        setProducts([newProduct, ...products]);
        Alert.alert("Thành công", "Thêm sản phẩm mới thành công");
      }
      setModalVisible(false);
    } catch (error) {
      console.error("Error saving product:", error);
      Alert.alert("Lỗi", "Không thể lưu sản phẩm");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = (productId: number) => {
    Alert.alert(
      "Xác nhận xóa",
      "Bạn có chắc chắn muốn xóa sản phẩm này không?",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xóa",
          style: "destructive",
          onPress: async () => {
            setLoading(true);
            try {
              await deleteProduct(productId);
              setProducts(products.filter((p) => p.id !== productId));
              Alert.alert("Thành công", "Xóa sản phẩm thành công");
            } catch (error) {
              console.error("Error deleting product:", error);
              Alert.alert("Lỗi", "Không thể xóa sản phẩm");
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const openImageManager = (product: Product) => {
    setCurrentProduct(product);
    setImageModalVisible(true);
  };

  const handleCloseImageManager = () => {
    setImageModalVisible(false);
    setCurrentProduct(null);
  };

  const handleImageUpdate = (
    productId: number,
    updatedImages: ProductImage[]
  ) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === productId) {
          return { ...p, images: updatedImages };
        }
        return p;
      })
    );
  };

  const renderProductItem = ({ item }: { item: Product }) => {
    return (
      <View style={styles.productItem}>
        <Image
          source={{
            uri:
              item.images && item.images.length > 0
                ? item.images[0].imageUrl.replace(
                    "http://localhost:8080",
                    API_BASE_URL
                  )
                : "https://via.placeholder.com/100",
          }}
          style={styles.productImage}
        />
        <View style={styles.productInfo}>
          <Text style={styles.productName}>{item.name}</Text>
          <Text style={styles.productPrice}>
            {item.price.toLocaleString("vi-VN")} đ
          </Text>
          <Text style={styles.productStock}>Tồn kho: {item.stock}</Text>
          <Text style={styles.productCategory}>
            Danh mục: {item.categoryName}
          </Text>
        </View>
        <View style={styles.productActions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.imageButton]}
            onPress={() => openImageManager(item)}
          >
            <Ionicons name="images-outline" size={20} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.editButton]}
            onPress={() => openEditModal(item)}
          >
            <Ionicons name="create-outline" size={20} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => handleDeleteProduct(item.id)}
          >
            <Ionicons name="trash-outline" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderFooter = () => {
    if (currentPage >= totalPages - 1) return null;

    return (
      <TouchableOpacity
        style={styles.loadMoreButton}
        onPress={handleLoadMore}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.loadMoreButtonText}>Tải thêm</Text>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm sản phẩm..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
        />
        <TouchableOpacity style={styles.addButton} onPress={openCreateModal}>
          <Ionicons name="add" size={24} color="#fff" />
          <Text style={styles.addButtonText}>Thêm mới</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.categoryFilterContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryFilter}
          contentContainerStyle={styles.categoryFilterContent}
        >
          <TouchableOpacity
            style={[
              styles.categoryChip,
              selectedCategory === undefined && styles.selectedCategoryChip,
            ]}
            onPress={() => handleCategoryFilter(undefined)}
          >
            <Text
              style={[
                styles.categoryChipText,
                selectedCategory === undefined &&
                  styles.selectedCategoryChipText,
              ]}
            >
              Tất cả
            </Text>
          </TouchableOpacity>
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryChip,
                selectedCategory === category.id && styles.selectedCategoryChip,
              ]}
              onPress={() => handleCategoryFilter(category.id)}
            >
              <Text
                style={[
                  styles.categoryChipText,
                  selectedCategory === category.id &&
                    styles.selectedCategoryChipText,
                ]}
              >
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.productsContainer}>
        {loading && !loadingMore ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#3498db" />
            <Text style={styles.loadingText}>Đang tải sản phẩm...</Text>
          </View>
        ) : (
          <FlatList
            data={products}
            renderItem={renderProductItem}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.productList}
            onRefresh={handleRefresh}
            refreshing={loading}
            ListFooterComponent={renderFooter}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="cube-outline" size={64} color="#ccc" />
                <Text style={styles.emptyText}>Không tìm thấy sản phẩm</Text>
              </View>
            }
          />
        )}
      </View>

      {/* Product Form Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {currentProduct ? "Cập nhật sản phẩm" : "Thêm sản phẩm mới"}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.formContainer}>
              <Text style={styles.inputLabel}>Tên sản phẩm</Text>
              <TextInput
                style={[styles.input, formErrors.name && styles.inputError]}
                value={formData.name}
                onChangeText={(text) =>
                  setFormData({ ...formData, name: text })
                }
                placeholder="Nhập tên sản phẩm"
              />
              {formErrors.name && (
                <Text style={styles.errorText}>{formErrors.name}</Text>
              )}

              <Text style={styles.inputLabel}>Mô tả</Text>
              <TextInput
                style={[
                  styles.input,
                  styles.textArea,
                  formErrors.description && styles.inputError,
                ]}
                value={formData.description}
                onChangeText={(text) =>
                  setFormData({ ...formData, description: text })
                }
                placeholder="Nhập mô tả sản phẩm"
                multiline
                numberOfLines={4}
              />
              {formErrors.description && (
                <Text style={styles.errorText}>{formErrors.description}</Text>
              )}

              <Text style={styles.inputLabel}>Giá (VNĐ)</Text>
              <TextInput
                style={[styles.input, formErrors.price && styles.inputError]}
                value={formData.price.toString()}
                onChangeText={(text) => {
                  const price = parseFloat(text) || 0;
                  setFormData({ ...formData, price });
                }}
                keyboardType="numeric"
                placeholder="Nhập giá sản phẩm"
              />
              {formErrors.price && (
                <Text style={styles.errorText}>{formErrors.price}</Text>
              )}

              <Text style={styles.inputLabel}>Số lượng tồn kho</Text>
              <TextInput
                style={[styles.input, formErrors.stock && styles.inputError]}
                value={formData.stock.toString()}
                onChangeText={(text) => {
                  const stock = parseInt(text) || 0;
                  setFormData({ ...formData, stock });
                }}
                keyboardType="numeric"
                placeholder="Nhập số lượng tồn kho"
              />
              {formErrors.stock && (
                <Text style={styles.errorText}>{formErrors.stock}</Text>
              )}

              <Text style={styles.inputLabel}>Danh mục</Text>
              <View
                style={[
                  styles.pickerContainer,
                  formErrors.categoryId && styles.inputError,
                ]}
              >
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {categories.map((category) => (
                    <TouchableOpacity
                      key={category.id}
                      style={[
                        styles.categoryOption,
                        formData.categoryId === category.id &&
                          styles.selectedCategoryOption,
                      ]}
                      onPress={() =>
                        setFormData({ ...formData, categoryId: category.id })
                      }
                    >
                      <Text
                        style={[
                          styles.categoryOptionText,
                          formData.categoryId === category.id &&
                            styles.selectedCategoryOptionText,
                        ]}
                      >
                        {category.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
              {formErrors.categoryId && (
                <Text style={styles.errorText}>{formErrors.categoryId}</Text>
              )}

              <Text style={styles.inputLabel}>Khuyến mãi (tùy chọn)</Text>
              <View style={styles.pickerContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <TouchableOpacity
                    style={[
                      styles.categoryOption,
                      formData.promotionId === undefined &&
                        styles.selectedCategoryOption,
                    ]}
                    onPress={() =>
                      setFormData({ ...formData, promotionId: undefined })
                    }
                  >
                    <Text
                      style={[
                        styles.categoryOptionText,
                        formData.promotionId === undefined &&
                          styles.selectedCategoryOptionText,
                      ]}
                    >
                      Không áp dụng
                    </Text>
                  </TouchableOpacity>
                  {promotions.map((promotion) => (
                    <TouchableOpacity
                      key={promotion.id}
                      style={[
                        styles.categoryOption,
                        formData.promotionId === promotion.id &&
                          styles.selectedCategoryOption,
                      ]}
                      onPress={() =>
                        setFormData({ ...formData, promotionId: promotion.id })
                      }
                    >
                      <Text
                        style={[
                          styles.categoryOptionText,
                          formData.promotionId === promotion.id &&
                            styles.selectedCategoryOptionText,
                        ]}
                      >
                        {promotion.title} ({promotion.discountPercent}%)
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleSubmit}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.submitButtonText}>
                    {currentProduct ? "Cập nhật" : "Thêm mới"}
                  </Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {currentProduct && (
        <ImageManagerModal
          visible={imageModalVisible}
          onClose={handleCloseImageManager}
          product={currentProduct}
          onImageUpdate={handleImageUpdate}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  searchContainer: {
    flexDirection: "row",
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: "#f9f9f9",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#3498db",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginLeft: 8,
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "bold",
    marginLeft: 4,
  },
  categoryFilterContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    zIndex: 10,
  },
  categoryFilter: {
    height: 36,
  },
  categoryFilterContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#f0f0f0",
    borderRadius: 20,
    marginRight: 8,
  },
  selectedCategoryChip: {
    backgroundColor: "#3498db",
  },
  categoryChipText: {
    color: "#555",
  },
  selectedCategoryChipText: {
    color: "#fff",
    fontWeight: "bold",
  },
  productsContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#555",
  },
  flatListContainer: {
    flex: 1,
  },
  productList: {
    padding: 16,
    paddingBottom: 80, // Add extra padding at the bottom
  },
  productItem: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
  },
  productInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: "space-between",
  },
  productName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  productPrice: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#e74c3c",
    marginTop: 4,
  },
  productStock: {
    fontSize: 12,
    color: "#777",
    marginTop: 4,
  },
  productCategory: {
    fontSize: 12,
    color: "#777",
  },
  productActions: {
    justifyContent: "space-around",
    alignItems: "center",
    marginLeft: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 4,
  },
  imageButton: {
    backgroundColor: "#27ae60", // green
    marginBottom: 8,
  },
  editButton: {
    backgroundColor: "#3498db",
  },
  deleteButton: {
    backgroundColor: "#e74c3c",
  },
  loadMoreButton: {
    backgroundColor: "#3498db",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
  loadMoreButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: "#777",
    marginTop: 12,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    width: "95%",
    height: "80%",
    backgroundColor: "white",
    borderRadius: 10,
    padding: 10,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingBottom: 10,
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  formContainer: {
    padding: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#555",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 16,
    backgroundColor: "#f9f9f9",
  },
  inputError: {
    borderColor: "#e74c3c",
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  errorText: {
    color: "#e74c3c",
    fontSize: 12,
    marginTop: -12,
    marginBottom: 12,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 16,
    backgroundColor: "#f9f9f9",
  },
  categoryOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#f0f0f0",
    borderRadius: 20,
    marginRight: 8,
  },
  selectedCategoryOption: {
    backgroundColor: "#3498db",
  },
  categoryOptionText: {
    color: "#555",
  },
  selectedCategoryOptionText: {
    color: "#fff",
    fontWeight: "bold",
  },
  submitButton: {
    backgroundColor: "#3498db",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
    marginBottom: 24,
  },
  submitButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  imageContainer: {
    flex: 1 / 2,
    aspectRatio: 1,
    padding: 5,
  },
  gridImage: {
    width: "100%",
    height: "100%",
    borderRadius: 8,
  },
  deleteImageIcon: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "rgba(0,0,0,0.6)",
    padding: 5,
    borderRadius: 15,
  },
  uploadButton: {
    backgroundColor: "#3498db",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 15,
    borderRadius: 8,
    margin: 10,
  },
  uploadButtonText: {
    color: "white",
    fontWeight: "bold",
    marginLeft: 10,
  },
});

export default AdminProductsScreen;
