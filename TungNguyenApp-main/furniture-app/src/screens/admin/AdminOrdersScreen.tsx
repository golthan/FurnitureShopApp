import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Alert,
  TextInput,
} from "react-native";
import {
  getAdminOrders,
  getOrderById,
  updateOrderStatus,
} from "../../services/api";
import { Order } from "../../types";
import Ionicons from "react-native-vector-icons/Ionicons";

const AdminOrdersScreen = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const orderStatuses = ["pending", "confirmed", "shipped", "cancelled"];

  useEffect(() => {
    loadOrders(true); // Initial load
  }, []);

  const filteredOrders = useMemo(() => {
    if (searchQuery.trim() === "") {
      return orders;
    }
    const lowercasedQuery = searchQuery.toLowerCase();
    return orders.filter(
      (order) =>
        order.id.toString().includes(lowercasedQuery) ||
        order.username.toLowerCase().includes(lowercasedQuery)
    );
  }, [searchQuery, orders]);

  const loadOrders = async (isInitial = false) => {
    if (loadingMore) return;

    if (isInitial) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    try {
      const response = await getAdminOrders(isInitial ? 0 : currentPage, 10);
      setOrders((prevOrders) =>
        isInitial ? response.orders : [...prevOrders, ...response.orders]
      );
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error("Error loading orders:", error);
      Alert.alert("Lỗi", "Không thể tải danh sách đơn hàng");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleRefresh = () => {
    setCurrentPage(0);
    loadOrders(true);
  };

  const loadMore = () => {
    if (!loadingMore && currentPage < totalPages - 1) {
      setCurrentPage((prevPage) => prevPage + 1);
    }
  };

  useEffect(() => {
    if (currentPage > 0) {
      loadOrders();
    }
  }, [currentPage]);

  const viewOrderDetails = async (orderId: number) => {
    try {
      setLoading(true);
      const order = await getOrderById(orderId);
      setSelectedOrder(order);
      setDetailModalVisible(true);
    } catch (error) {
      console.error("Error fetching order details:", error);
      Alert.alert("Lỗi", "Không thể tải chi tiết đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  const openStatusModal = (order: Order) => {
    setSelectedOrder(order);
    setStatusModalVisible(true);
  };

  const handleUpdateStatus = async (status: string) => {
    if (!selectedOrder) return;

    try {
      setLoading(true);
      await updateOrderStatus(selectedOrder.id, status);

      // Update the order in the list
      const updatedOrders = orders.map((order) =>
        order.id === selectedOrder.id ? { ...order, status } : order
      );
      setOrders(updatedOrders);

      // Update the selected order if detail modal is open
      setSelectedOrder({ ...selectedOrder, status });

      setStatusModalVisible(false);
      Alert.alert(
        "Thành công",
        `Đã cập nhật trạng thái đơn hàng thành ${status}`
      );
    } catch (error) {
      console.error("Error updating order status:", error);
      Alert.alert("Lỗi", "Không thể cập nhật trạng thái đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "#f39c12";
      case "shipped":
        return "#3498db";
      case "confirmed":
        return "#2ecc71";
      case "cancelled":
        return "#e74c3c";
      default:
        return "#7f8c8d";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return "time-outline";
      case "shipped":
        return "car-outline";
      case "confirmed":
        return "checkmark-circle-outline";
      case "cancelled":
        return "close-circle-outline";
      default:
        return "help-circle-outline";
    }
  };

  const renderOrderItem = ({ item }: { item: Order }) => {
    const statusColor = getStatusColor(item.status);
    const statusIcon = getStatusIcon(item.status);

    return (
      <View style={styles.orderItem}>
        <View style={styles.orderHeader}>
          <View>
            <Text style={styles.orderId}>Đơn hàng #{item.id}</Text>
            <Text style={styles.orderDate}>
              {new Date(item.orderDate).toLocaleDateString("vi-VN")}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
            <Ionicons name={statusIcon} size={16} color="#fff" />
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
        </View>

        <View style={styles.orderInfo}>
          <Text style={styles.customerName}>Khách hàng: {item.username}</Text>
          <Text style={styles.orderTotal}>
            Tổng tiền: {(item.totalAmount || 0).toLocaleString("vi-VN")} đ
          </Text>
          <Text style={styles.orderItemCount}>
            Số lượng sản phẩm: {item.orderItems?.length || 0}
          </Text>
        </View>

        <View style={styles.orderActions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.viewButton]}
            onPress={() => viewOrderDetails(item.id)}
          >
            <Ionicons name="eye-outline" size={20} color="#fff" />
            <Text style={styles.actionButtonText}>Chi tiết</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.statusButton]}
            onPress={() => openStatusModal(item)}
          >
            <Ionicons name="options-outline" size={20} color="#fff" />
            <Text style={styles.actionButtonText}>Cập nhật</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderFooter = () => {
    if (!loadingMore) return null;

    return (
      <View style={{ paddingVertical: 20 }}>
        <ActivityIndicator size="small" color="#3498db" />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm theo ID hoặc tên khách hàng..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {loading && orders.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3498db" />
          <Text style={styles.loadingText}>Đang tải đơn hàng...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredOrders}
          renderItem={renderOrderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.orderList}
          onRefresh={handleRefresh}
          refreshing={loading}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={
            !loading ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="receipt-outline" size={64} color="#ccc" />
                <Text style={styles.emptyText}>Không có đơn hàng nào</Text>
              </View>
            ) : null
          }
        />
      )}

      {/* Order Detail Modal */}
      <Modal
        visible={detailModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setDetailModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Chi tiết đơn hàng #{selectedOrder?.id}
              </Text>
              <TouchableOpacity onPress={() => setDetailModalVisible(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            {selectedOrder && (
              <View style={styles.orderDetailContainer}>
                <View style={styles.orderDetailSection}>
                  <Text style={styles.sectionTitle}>Thông tin đơn hàng</Text>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Mã đơn hàng:</Text>
                    <Text style={styles.infoValue}>#{selectedOrder.id}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Ngày đặt:</Text>
                    <Text style={styles.infoValue}>
                      {new Date(selectedOrder.orderDate).toLocaleDateString(
                        "vi-VN"
                      )}
                    </Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Trạng thái:</Text>
                    <View
                      style={[
                        styles.statusBadge,
                        {
                          backgroundColor: getStatusColor(selectedOrder.status),
                        },
                      ]}
                    >
                      <Ionicons
                        name={getStatusIcon(selectedOrder.status)}
                        size={16}
                        color="#fff"
                      />
                      <Text style={styles.statusText}>
                        {selectedOrder.status}
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={styles.orderDetailSection}>
                  <Text style={styles.sectionTitle}>Thông tin khách hàng</Text>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>ID người dùng:</Text>
                    <Text style={styles.infoValue}>{selectedOrder.userId}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Tên đăng nhập:</Text>
                    <Text style={styles.infoValue}>
                      {selectedOrder.username}
                    </Text>
                  </View>
                </View>

                <View style={styles.orderDetailSection}>
                  <Text style={styles.sectionTitle}>Sản phẩm</Text>
                  {selectedOrder.orderItems.map((item) => (
                    <View key={item.id} style={styles.orderItemDetail}>
                      <Text style={styles.productName}>{item.productName}</Text>
                      <View style={styles.productInfo}>
                        <Text style={styles.productPrice}>
                          {(item.unitPrice || 0).toLocaleString("vi-VN")} đ x{" "}
                          {item.quantity || 0}
                        </Text>
                        <Text style={styles.productTotal}>
                          {(
                            (item.unitPrice || 0) * (item.quantity || 0)
                          ).toLocaleString("vi-VN")}{" "}
                          đ
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>

                <View style={styles.totalSection}>
                  <Text style={styles.totalLabel}>Tổng cộng:</Text>
                  <Text style={styles.totalValue}>
                    {(selectedOrder.totalAmount || 0).toLocaleString("vi-VN")} đ
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.updateStatusButton}
                  onPress={() => {
                    setDetailModalVisible(false);
                    setStatusModalVisible(true);
                  }}
                >
                  <Ionicons name="options-outline" size={20} color="#fff" />
                  <Text style={styles.updateStatusButtonText}>
                    Cập nhật trạng thái
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* Status Update Modal */}
      <Modal
        visible={statusModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setStatusModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.statusModalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Cập nhật trạng thái</Text>
              <TouchableOpacity onPress={() => setStatusModalVisible(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <View style={styles.statusOptions}>
              {orderStatuses.map((status) => (
                <TouchableOpacity
                  key={status}
                  style={[
                    styles.statusOption,
                    { backgroundColor: getStatusColor(status) },
                    selectedOrder?.status === status &&
                      styles.selectedStatusOption,
                  ]}
                  onPress={() => handleUpdateStatus(status)}
                >
                  <Ionicons
                    name={getStatusIcon(status)}
                    size={24}
                    color="#fff"
                  />
                  <Text style={styles.statusOptionText}>{status}</Text>
                </TouchableOpacity>
              ))}
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
  header: {
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
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
  orderList: {
    padding: 16,
  },
  orderItem: {
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
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingBottom: 12,
  },
  orderId: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  orderDate: {
    fontSize: 14,
    color: "#777",
    marginTop: 4,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 12,
    marginLeft: 4,
  },
  orderInfo: {
    marginBottom: 12,
  },
  customerName: {
    fontSize: 14,
    color: "#555",
    marginBottom: 4,
  },
  orderTotal: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  orderItemCount: {
    fontSize: 14,
    color: "#555",
  },
  orderActions: {
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
  viewButton: {
    backgroundColor: "#3498db",
  },
  statusButton: {
    backgroundColor: "#f39c12",
  },
  actionButtonText: {
    color: "#fff",
    fontWeight: "bold",
    marginLeft: 6,
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
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 12,
    width: "90%",
    maxHeight: "80%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  statusModalContent: {
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
  orderDetailContainer: {
    padding: 16,
  },
  orderDetailSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingBottom: 8,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: "#555",
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
  },
  orderItemDetail: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  productName: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  productInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  productPrice: {
    fontSize: 14,
    color: "#555",
  },
  productTotal: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
  },
  totalSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  totalValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#e74c3c",
  },
  updateStatusButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#3498db",
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
  },
  updateStatusButtonText: {
    color: "#fff",
    fontWeight: "bold",
    marginLeft: 8,
  },
  statusOptions: {
    padding: 16,
  },
  statusOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  selectedStatusOption: {
    borderWidth: 2,
    borderColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  statusOptionText: {
    color: "#fff",
    fontWeight: "bold",
    marginLeft: 12,
    fontSize: 16,
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
});

export default AdminOrdersScreen;
