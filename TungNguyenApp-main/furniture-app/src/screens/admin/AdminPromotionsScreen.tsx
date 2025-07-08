import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Modal,
  Alert,
  Platform,
} from "react-native";
import {
  getPromotions,
  createPromotion,
  updatePromotion,
  deletePromotion,
} from "../../services/api";
import { Promotion, PromotionRequest } from "../../types";
import Ionicons from "react-native-vector-icons/Ionicons";
import DateTimePicker from "@react-native-community/datetimepicker";

const AdminPromotionsScreen = () => {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentPromotion, setCurrentPromotion] = useState<Promotion | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [formData, setFormData] = useState<PromotionRequest>({
    title: "",
    discountPercent: 0,
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Date picker states
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  useEffect(() => {
    loadPromotions();
  }, []);

  const filteredPromotions = useMemo(() => {
    if (searchQuery.trim() === "") {
      return promotions;
    }
    const lowercasedQuery = searchQuery.toLowerCase();
    return promotions.filter((promotion) =>
      promotion.title.toLowerCase().includes(lowercasedQuery)
    );
  }, [searchQuery, promotions]);

  const loadPromotions = async () => {
    try {
      setLoading(true);
      const data = await getPromotions();
      setPromotions(data);
    } catch (error) {
      console.error("Error loading promotions:", error);
      Alert.alert("Lỗi", "Không thể tải danh sách khuyến mãi");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadPromotions();
  };

  const openCreateModal = () => {
    setCurrentPromotion(null);
    setFormData({
      title: "",
      discountPercent: 0,
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    });
    setFormErrors({});
    setModalVisible(true);
  };

  const openEditModal = (promotion: Promotion) => {
    setCurrentPromotion(promotion);
    setFormData({
      title: promotion.title,
      discountPercent: promotion.discountPercent,
      startDate: promotion.startDate,
      endDate: promotion.endDate,
    });
    setFormErrors({});
    setModalVisible(true);
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.title.trim()) {
      errors.title = "Tên khuyến mãi không được để trống";
    }

    if (formData.discountPercent <= 0 || formData.discountPercent > 100) {
      errors.discountPercent = "Phần trăm giảm giá phải từ 1-100%";
    }

    const startDate = new Date(formData.startDate);
    const endDate = new Date(formData.endDate);

    if (isNaN(startDate.getTime())) {
      errors.startDate = "Ngày bắt đầu không hợp lệ";
    }

    if (isNaN(endDate.getTime())) {
      errors.endDate = "Ngày kết thúc không hợp lệ";
    }

    if (startDate >= endDate) {
      errors.dateRange = "Ngày kết thúc phải sau ngày bắt đầu";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      if (currentPromotion) {
        // Update existing promotion
        const updatedPromotion = await updatePromotion(
          currentPromotion.id,
          formData
        );
        setPromotions(
          promotions.map((p) =>
            p.id === updatedPromotion.id ? updatedPromotion : p
          )
        );
        Alert.alert("Thành công", "Cập nhật khuyến mãi thành công");
      } else {
        // Create new promotion
        const newPromotion = await createPromotion(formData);
        setPromotions([newPromotion, ...promotions]);
        Alert.alert("Thành công", "Thêm khuyến mãi mới thành công");
      }
      setModalVisible(false);
    } catch (error) {
      console.error("Error saving promotion:", error);
      Alert.alert("Lỗi", "Không thể lưu khuyến mãi");
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePromotion = (promotionId: number) => {
    Alert.alert(
      "Xác nhận xóa",
      "Bạn có chắc chắn muốn xóa khuyến mãi này không? Việc này có thể ảnh hưởng đến các sản phẩm đang áp dụng khuyến mãi.",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xóa",
          style: "destructive",
          onPress: async () => {
            try {
              setLoading(true);
              await deletePromotion(promotionId);
              setPromotions(promotions.filter((p) => p.id !== promotionId));
              Alert.alert("Thành công", "Xóa khuyến mãi thành công");
            } catch (error) {
              console.error("Error deleting promotion:", error);
              Alert.alert(
                "Lỗi",
                "Không thể xóa khuyến mãi. Có thể khuyến mãi này đang được sử dụng bởi các sản phẩm."
              );
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleStartDateChange = (event: any, selectedDate?: Date) => {
    setShowStartDatePicker(Platform.OS === "ios");
    if (selectedDate) {
      setFormData({
        ...formData,
        startDate: selectedDate.toISOString(),
      });
    }
  };

  const handleEndDateChange = (event: any, selectedDate?: Date) => {
    setShowEndDatePicker(Platform.OS === "ios");
    if (selectedDate) {
      setFormData({
        ...formData,
        endDate: selectedDate.toISOString(),
      });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN");
  };

  const isPromotionActive = (promotion: Promotion) => {
    const now = new Date();
    const startDate = new Date(promotion.startDate);
    const endDate = new Date(promotion.endDate);
    return now >= startDate && now <= endDate;
  };

  const renderPromotionItem = ({ item }: { item: Promotion }) => {
    const isActive = isPromotionActive(item);

    return (
      <View style={styles.promotionItem}>
        <View style={styles.promotionHeader}>
          <Text style={styles.promotionTitle}>{item.title}</Text>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: isActive ? "#2ecc71" : "#e74c3c" },
            ]}
          >
            <Text style={styles.statusText}>
              {isActive ? "Đang hoạt động" : "Không hoạt động"}
            </Text>
          </View>
        </View>

        <View style={styles.promotionInfo}>
          <Text style={styles.discountText}>
            Giảm giá: {item.discountPercent}%
          </Text>
          <Text style={styles.dateText}>
            Từ {formatDate(item.startDate)} đến {formatDate(item.endDate)}
          </Text>
        </View>

        <View style={styles.promotionActions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.editButton]}
            onPress={() => openEditModal(item)}
          >
            <Ionicons name="create-outline" size={20} color="#fff" />
            <Text style={styles.actionButtonText}>Sửa</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => handleDeletePromotion(item.id)}
          >
            <Ionicons name="trash-outline" size={20} color="#fff" />
            <Text style={styles.actionButtonText}>Xóa</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm khuyến mãi..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <TouchableOpacity style={styles.addButton} onPress={openCreateModal}>
          <Ionicons name="add" size={24} color="#fff" />
          <Text style={styles.addButtonText}>Thêm mới</Text>
        </TouchableOpacity>
      </View>

      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3498db" />
          <Text style={styles.loadingText}>Đang tải khuyến mãi...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredPromotions}
          renderItem={renderPromotionItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.promotionList}
          onRefresh={handleRefresh}
          refreshing={refreshing}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="pricetag-outline" size={64} color="#ccc" />
              <Text style={styles.emptyText}>Không có khuyến mãi nào</Text>
            </View>
          }
        />
      )}

      {/* Promotion Form Modal */}
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
                {currentPromotion
                  ? "Cập nhật khuyến mãi"
                  : "Thêm khuyến mãi mới"}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <View style={styles.formContainer}>
              <Text style={styles.inputLabel}>Tên khuyến mãi</Text>
              <TextInput
                style={[styles.input, formErrors.title && styles.inputError]}
                value={formData.title}
                onChangeText={(text) =>
                  setFormData({ ...formData, title: text })
                }
                placeholder="Nhập tên khuyến mãi"
              />
              {formErrors.title && (
                <Text style={styles.errorText}>{formErrors.title}</Text>
              )}

              <Text style={styles.inputLabel}>Phần trăm giảm giá (%)</Text>
              <TextInput
                style={[
                  styles.input,
                  formErrors.discountPercent && styles.inputError,
                ]}
                value={formData.discountPercent.toString()}
                onChangeText={(text) => {
                  const discount = parseFloat(text) || 0;
                  setFormData({ ...formData, discountPercent: discount });
                }}
                keyboardType="numeric"
                placeholder="Nhập phần trăm giảm giá"
              />
              {formErrors.discountPercent && (
                <Text style={styles.errorText}>
                  {formErrors.discountPercent}
                </Text>
              )}

              <Text style={styles.inputLabel}>Ngày bắt đầu</Text>
              <TouchableOpacity
                style={[
                  styles.dateInput,
                  formErrors.startDate && styles.inputError,
                ]}
                onPress={() => setShowStartDatePicker(true)}
              >
                <Text>{formatDate(formData.startDate)}</Text>
                <Ionicons name="calendar-outline" size={20} color="#555" />
              </TouchableOpacity>
              {formErrors.startDate && (
                <Text style={styles.errorText}>{formErrors.startDate}</Text>
              )}

              <Text style={styles.inputLabel}>Ngày kết thúc</Text>
              <TouchableOpacity
                style={[
                  styles.dateInput,
                  formErrors.endDate && styles.inputError,
                ]}
                onPress={() => setShowEndDatePicker(true)}
              >
                <Text>{formatDate(formData.endDate)}</Text>
                <Ionicons name="calendar-outline" size={20} color="#555" />
              </TouchableOpacity>
              {formErrors.endDate && (
                <Text style={styles.errorText}>{formErrors.endDate}</Text>
              )}
              {formErrors.dateRange && (
                <Text style={styles.errorText}>{formErrors.dateRange}</Text>
              )}

              {showStartDatePicker && (
                <DateTimePicker
                  value={new Date(formData.startDate)}
                  mode="date"
                  display="default"
                  onChange={handleStartDateChange}
                />
              )}

              {showEndDatePicker && (
                <DateTimePicker
                  value={new Date(formData.endDate)}
                  mode="date"
                  display="default"
                  onChange={handleEndDateChange}
                />
              )}

              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleSubmit}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.submitButtonText}>
                    {currentPromotion ? "Cập nhật" : "Thêm mới"}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  promotionList: {
    padding: 16,
  },
  promotionItem: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  promotionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingBottom: 12,
  },
  promotionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 12,
  },
  promotionInfo: {
    marginBottom: 16,
  },
  discountText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#e74c3c",
    marginBottom: 8,
  },
  dateText: {
    fontSize: 14,
    color: "#555",
  },
  promotionActions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 4,
  },
  editButton: {
    backgroundColor: "#3498db",
  },
  deleteButton: {
    backgroundColor: "#e74c3c",
  },
  actionButtonText: {
    color: "#fff",
    fontWeight: "bold",
    marginLeft: 6,
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
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 12,
    width: "90%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
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
  dateInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 16,
    backgroundColor: "#f9f9f9",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  inputError: {
    borderColor: "#e74c3c",
  },
  errorText: {
    color: "#e74c3c",
    fontSize: 12,
    marginTop: -12,
    marginBottom: 12,
  },
  submitButton: {
    backgroundColor: "#3498db",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
  submitButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});

export default AdminPromotionsScreen;
