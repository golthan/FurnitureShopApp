import React from "react";
import {
  View,
  StyleSheet,
  FlatList,
  Text,
  Image,
  TouchableOpacity,
  TextInput,
  Alert,
} from "react-native";
import { Button } from "react-native-elements";
import { useCart } from "../../contexts/CartContext";
import { useNavigation } from "@react-navigation/native";
import { MainStackParamList } from "../../navigation/AppNavigator";
import { StackNavigationProp } from "@react-navigation/stack";
import { useAuth } from "../../contexts/AuthContext";
import api, { getCustomerByUserId, API_BASE_URL } from "../../services/api";

type CartScreenNavigationProp = StackNavigationProp<MainStackParamList, "Cart">;

const CartScreen = () => {
  const { items, totalPrice, removeFromCart, updateQuantity, clearCart } =
    useCart();
  const navigation = useNavigation<CartScreenNavigationProp>();
  const { user } = useAuth();

  const handleCheckout = async () => {
    if (!user) {
      Alert.alert("Bạn cần đăng nhập để đặt hàng.");
      return;
    }
    if (items.length === 0) {
      Alert.alert("Giỏ hàng trống.");
      return;
    }
    // Kiểm tra thông tin cá nhân
    try {
      const customer = await getCustomerByUserId(user.id);
      if (
        !customer.fullName ||
        !customer.email ||
        !customer.phone ||
        !customer.address
      ) {
        Alert.alert(
          "Thiếu thông tin cá nhân",
          "Vui lòng cập nhật đầy đủ thông tin cá nhân trước khi đặt hàng!",
          [
            {
              text: "Cập nhật ngay",
              onPress: () => navigation.navigate("Profile"),
            },
            { text: "Để sau", style: "cancel" },
          ]
        );
        return;
      }
    } catch (e) {
      Alert.alert(
        "Thiếu thông tin cá nhân",
        "Vui lòng cập nhật đầy đủ thông tin cá nhân trước khi đặt hàng!",
        [
          {
            text: "Cập nhật ngay",
            onPress: () => navigation.navigate("Profile"),
          },
          { text: "Để sau", style: "cancel" },
        ]
      );
      return;
    }
    try {
      const orderItems = items.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
      }));
      await api.post("/api/orders", {
        userId: user.id,
        items: orderItems,
      });
      clearCart();
      Alert.alert(
        "Đặt hàng thành công!",
        "Đơn hàng của bạn đã được ghi nhận.",
        [{ text: "OK", onPress: () => navigation.navigate("Orders") }]
      );
    } catch (error) {
      Alert.alert(
        "Đặt hàng thất bại!",
        "Vui lòng thử lại hoặc kiểm tra kết nối."
      );
    }
  };

  const handleQuantityChange = (productId: number, text: string) => {
    const newQuantity = parseInt(text, 10);
    const item = items.find((i) => i.product.id === productId);
    const maxStock = item?.product.stock || 1;
    if (!isNaN(newQuantity) && newQuantity > 0) {
      if (newQuantity > maxStock) {
        Alert.alert(
          "Vượt quá số lượng tồn kho",
          `Chỉ còn lại ${maxStock} sản phẩm trong kho.`
        );
        updateQuantity(productId, maxStock);
        setQuantityInputs((prev) => ({
          ...prev,
          [productId]: String(maxStock),
        }));
      } else {
        updateQuantity(productId, newQuantity);
      }
    } else if (text === "") {
      // Allow empty input temporarily, will revert to current quantity if user leaves empty
    } else {
      // Optionally, show an alert for invalid input
      // Alert.alert("Số lượng không hợp lệ", "Vui lòng nhập số nguyên dương.");
    }
  };

  // Using a local state for TextInput value to avoid immediate re-renders
  const [quantityInputs, setQuantityInputs] = React.useState<{
    [key: number]: string;
  }>({});

  React.useEffect(() => {
    // Initialize quantityInputs when items change
    const initialQuantities: { [key: number]: string } = {};
    items.forEach((item) => {
      initialQuantities[item.product.id] = String(item.quantity);
    });
    setQuantityInputs(initialQuantities);
  }, [items]);

  return (
    <View style={styles.container}>
      {items.length === 0 ? (
        <Text style={styles.emptyText}>Giỏ hàng của bạn đang trống.</Text>
      ) : (
        <>
          <FlatList
            data={items}
            keyExtractor={(item) => item.product.id.toString()}
            renderItem={({ item }) => (
              <View style={styles.itemCard}>
                <Image
                  source={{
                    uri: item.product.images[0]?.imageUrl
                      ? item.product.images[0].imageUrl.startsWith(
                          "http://localhost:8080"
                        )
                        ? item.product.images[0].imageUrl.replace(
                            "http://localhost:8080",
                            API_BASE_URL
                          )
                        : item.product.images[0].imageUrl
                      : "https://via.placeholder.com/100",
                  }}
                  style={styles.productImage}
                />
                <View style={styles.itemDetailsContainer}>
                  <Text style={styles.itemName}>{item.product.name}</Text>
                  {item.product.promotionTitle ? (
                    <View style={styles.priceRow}>
                      <Text style={styles.originalPrice}>
                        {item.product.price.toLocaleString("vi-VN")} ₫
                      </Text>
                      <Text style={styles.salePrice}>
                        {(item.product.price * 0.9).toLocaleString("vi-VN")} ₫
                      </Text>
                    </View>
                  ) : (
                    <Text style={styles.itemPrice}>
                      {item.product.price.toLocaleString("vi-VN")} ₫
                    </Text>
                  )}
                  <View style={styles.quantityControl}>
                    <TouchableOpacity
                      style={styles.qtyButton}
                      onPress={() => {
                        if (item.quantity > 1) {
                          updateQuantity(item.product.id, item.quantity - 1);
                        }
                      }}
                    >
                      <Text style={styles.qtyButtonText}>-</Text>
                    </TouchableOpacity>
                    <TextInput
                      style={styles.itemQuantityInput}
                      value={
                        quantityInputs[item.product.id] !== undefined
                          ? quantityInputs[item.product.id]
                          : String(item.quantity)
                      }
                      onChangeText={(text) => {
                        setQuantityInputs((prev) => ({
                          ...prev,
                          [item.product.id]: text,
                        }));
                        // Không gọi handleQuantityChange ở đây để tránh updateQuantity khi user đang xóa số
                      }}
                      keyboardType="numeric"
                      onBlur={() => {
                        const text = quantityInputs[item.product.id];
                        if (
                          text === "" ||
                          isNaN(parseInt(text, 10)) ||
                          parseInt(text, 10) <= 0
                        ) {
                          setQuantityInputs((prev) => ({
                            ...prev,
                            [item.product.id]: String(item.quantity),
                          }));
                        } else {
                          handleQuantityChange(item.product.id, text);
                        }
                      }}
                    />
                    <TouchableOpacity
                      style={styles.qtyButton}
                      onPress={() => {
                        if (item.quantity < item.product.stock) {
                          updateQuantity(item.product.id, item.quantity + 1);
                        } else {
                          Alert.alert(
                            "Vượt quá số lượng tồn kho",
                            `Chỉ còn lại ${item.product.stock} sản phẩm trong kho.`
                          );
                        }
                      }}
                    >
                      <Text style={styles.qtyButtonText}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={() => removeFromCart(item.product.id)}
                  style={styles.removeButtonContainer}
                >
                  <Text style={styles.removeButtonText}>Xóa</Text>
                </TouchableOpacity>
              </View>
            )}
            contentContainerStyle={styles.listContent}
          />
          <View style={styles.summaryContainerNew}>
            <View style={styles.totalRowNew}>
              <Text style={styles.totalLabelNew}>Tổng cộng:</Text>
              <Text style={styles.totalValueNew}>
                {totalPrice.toLocaleString("vi-VN")} ₫
              </Text>
            </View>
            <View style={styles.buttonRow}>
              <Button
                title="THANH TOÁN"
                onPress={handleCheckout}
                buttonStyle={styles.checkoutBtnNew}
                titleStyle={styles.checkoutBtnTextNew}
                containerStyle={styles.buttonContainer}
              />
              <Button
                title="XÓA GIỎ HÀNG"
                onPress={clearCart}
                buttonStyle={styles.clearCartBtnNew}
                titleStyle={styles.clearCartBtnTextNew}
                containerStyle={styles.buttonContainer}
              />
            </View>
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0F2F5",
    paddingTop: 10,
  },
  listContent: {
    paddingHorizontal: 15,
    paddingBottom: 20,
  },
  emptyText: {
    fontSize: 18,
    color: "#888",
    textAlign: "center",
    marginTop: 100,
    fontWeight: "500",
  },
  itemCard: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },
  productImage: {
    width: 90,
    height: 90,
    borderRadius: 10,
    marginRight: 15,
  },
  itemDetailsContainer: {
    flex: 1,
    justifyContent: "center",
  },
  itemName: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  itemPrice: {
    fontSize: 16,
    color: "#28A745",
    fontWeight: "bold",
    marginBottom: 10,
  },
  quantityControl: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 120,
    alignSelf: "flex-start",
  },
  qtyButton: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#b0b0b0",
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },
  qtyButtonText: {
    color: "#333",
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
  },
  itemQuantityInput: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    width: 38,
    height: 32,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    marginHorizontal: 2,
    backgroundColor: "#fff",
    paddingVertical: 0,
    paddingHorizontal: 0,
  },
  removeButtonContainer: {
    backgroundColor: "#DC3545",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginLeft: 15,
  },
  removeButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "bold",
  },
  summaryContainerNew: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 22,
    marginHorizontal: 15,
    marginTop: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 7,
  },
  totalRowNew: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
  },
  totalLabelNew: {
    fontSize: 20,
    fontWeight: "600",
    color: "#444",
  },
  totalValueNew: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#28A745",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  buttonContainer: {
    flex: 1,
    marginHorizontal: 4,
  },
  checkoutBtnNew: {
    backgroundColor: "#28A745",
    borderRadius: 10,
    paddingVertical: 14,
  },
  checkoutBtnTextNew: {
    fontSize: 17,
    fontWeight: "bold",
  },
  clearCartBtnNew: {
    backgroundColor: "#f1f1f1",
    borderRadius: 10,
    paddingVertical: 14,
  },
  clearCartBtnTextNew: {
    color: "#d9534f",
    fontSize: 17,
    fontWeight: "bold",
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  originalPrice: {
    fontSize: 15,
    color: "#888",
    textDecorationLine: "line-through",
    marginRight: 8,
  },
  salePrice: {
    fontSize: 16,
    color: "#e74c3c",
    fontWeight: "bold",
  },
});

export default CartScreen;
