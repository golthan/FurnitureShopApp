import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  Text,
  ActivityIndicator,
} from "react-native";
import { useAuth } from "../../contexts/AuthContext";
import api from "../../services/api";
import { Order } from "../../types";
import { useFocusEffect } from "@react-navigation/native";

const OrdersScreen = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { user } = useAuth();

  useFocusEffect(
    React.useCallback(() => {
      const fetchOrders = async () => {
        if (!user) return;
        try {
          setLoading(true);
          const response = await api.get("/api/orders", {
            params: { currentUserId: user.id },
          });
          setOrders(response.data);
        } catch (err) {
          setError("Failed to load orders");
        } finally {
          setLoading(false);
        }
      };
      fetchOrders();
    }, [user])
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3498db" />
        <Text style={styles.loadingText}>Đang tải đơn hàng...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {orders.length === 0 ? (
        <Text style={styles.emptyText}>Bạn chưa có đơn hàng nào.</Text>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.orderItem}>
              <Text style={styles.orderTitle}>Đơn hàng #{item.id}</Text>
              <Text style={styles.orderDate}>
                Ngày đặt: {new Date(item.orderDate).toLocaleDateString()}
              </Text>
              <Text style={styles.orderStatus}>Trạng thái: {item.status}</Text>
              <Text style={styles.orderTotal}>
                Tổng tiền: {item.totalAmount.toLocaleString("vi-VN")} ₫
              </Text>
              <Text style={styles.orderDetailsHeader}>Chi tiết sản phẩm:</Text>
              <FlatList
                data={item.orderItems}
                keyExtractor={(orderItem) => orderItem.id.toString()}
                renderItem={({ item: orderItem }) => (
                  <View style={styles.orderItemDetail}>
                    <Text style={styles.orderItemName}>
                      {orderItem.productName}
                    </Text>
                    <Text style={styles.orderItemQuantityPrice}>
                      {orderItem.quantity} x{" "}
                      {orderItem.unitPrice.toLocaleString("vi-VN")} ₫
                    </Text>
                  </View>
                )}
                contentContainerStyle={styles.orderItemsList}
              />
            </View>
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 12,
    backgroundColor: "#f6f8fa",
  },
  listContent: {
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f6f8fa",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
    color: "#3498db",
  },
  emptyText: {
    fontSize: 18,
    textAlign: "center",
    marginTop: 50,
    color: "#777",
  },
  orderItem: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 12,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  orderTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#333",
  },
  orderDate: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  orderStatus: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#28a745",
    marginBottom: 8,
  },
  orderTotal: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#3498db",
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingTop: 10,
  },
  orderDetailsHeader: {
    fontSize: 15,
    fontWeight: "bold",
    marginTop: 10,
    marginBottom: 5,
    color: "#555",
  },
  orderItemsList: {
    marginTop: 5,
  },
  orderItemDetail: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 5,
    paddingHorizontal: 10,
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    marginBottom: 5,
  },
  orderItemName: {
    fontSize: 14,
    color: "#333",
    flex: 1,
  },
  orderItemQuantityPrice: {
    fontSize: 14,
    color: "#555",
  },
  error: {
    color: "red",
    textAlign: "center",
  },
});

export default OrdersScreen;
