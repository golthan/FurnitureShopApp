import React, { useEffect, useRef, useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  TextInput,
  Alert,
  ActivityIndicator,
  ScrollView,
  Keyboard,
  TouchableOpacity,
} from "react-native";
import { Button } from "react-native-elements";
import { useAuth } from "../../contexts/AuthContext";
import {
  getCustomerByUserId,
  createCustomer,
  updateCustomerByUserId,
  deleteCustomerByUserId,
} from "../../services/api";
import { CustomerRequest, Customer } from "../../types";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { AuthStackParamList } from "../../navigation/AuthNavigator";
import Ionicons from "react-native-vector-icons/Ionicons";
import ChangePasswordModal from "../../components/ChangePasswordModal";

type ProfileScreenNavigationProp = StackNavigationProp<AuthStackParamList>;

const ProfileScreen = () => {
  const { user, logout } = useAuth();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [form, setForm] = useState<CustomerRequest>({
    fullName: "",
    email: "",
    phone: "",
    address: "",
  });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [changePasswordVisible, setChangePasswordVisible] = useState(false);
  const navigation = useNavigation<ProfileScreenNavigationProp>();

  // Ref cho chuyển focus
  const emailRef = useRef<TextInput>(null);
  const phoneRef = useRef<TextInput>(null);
  const addressRef = useRef<TextInput>(null);

  useEffect(() => {
    if (user) {
      setFetching(true);
      setError(null);
      getCustomerByUserId(user.id)
        .then((data) => {
          setCustomer(data);
          setForm({
            fullName: data.fullName,
            email: data.email,
            phone: data.phone,
            address: data.address,
          });
        })
        .catch((e) => {
          setCustomer(null);
          setError("Chưa có thông tin cá nhân. Vui lòng nhập để tạo mới.");
        })
        .finally(() => setFetching(false));
    }
  }, [user]);

  const handleChange = (field: keyof CustomerRequest, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  // Validate email và phone
  const validate = () => {
    if (!form.fullName || !form.email || !form.phone || !form.address) {
      Alert.alert("Lỗi", "Vui lòng nhập đầy đủ thông tin.");
      return false;
    }
    const emailRegex = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/;
    if (!emailRegex.test(form.email)) {
      Alert.alert("Lỗi", "Email không hợp lệ.");
      return false;
    }
    const phoneRegex = /^\d{9,11}$/;
    if (!phoneRegex.test(form.phone)) {
      Alert.alert("Lỗi", "Số điện thoại không hợp lệ.");
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!user) return;
    if (!validate()) return;
    setLoading(true);
    Keyboard.dismiss();
    try {
      let result;
      if (customer) {
        result = await updateCustomerByUserId(user.id, form);
        Alert.alert("Thành công", "Cập nhật thông tin cá nhân thành công!");
      } else {
        result = await createCustomer({ ...form, userId: user.id });
        Alert.alert("Thành công", "Lưu thông tin cá nhân thành công!");
      }
      setCustomer(result);
      setError(null);
    } catch (e) {
      Alert.alert("Lỗi", "Không thể lưu thông tin. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!user) return;
    Alert.alert("Xác nhận", "Bạn có chắc chắn muốn xóa thông tin cá nhân?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Xóa",
        style: "destructive",
        onPress: async () => {
          setLoading(true);
          try {
            await deleteCustomerByUserId(user.id);
            setCustomer(null);
            setForm({ fullName: "", email: "", phone: "", address: "" });
            setError(
              "Thông tin cá nhân đã được xóa. Vui lòng nhập lại để tạo mới."
            );
          } catch (e) {
            Alert.alert("Lỗi", "Không thể xóa thông tin. Vui lòng thử lại.");
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

  if (!user)
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>
          Vui lòng đăng nhập để xem thông tin cá nhân.
        </Text>
      </View>
    );
  if (fetching)
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#3498db" />
      </View>
    );

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.title}>Thông tin cá nhân</Text>
      {error && <Text style={styles.errorText}>{error}</Text>}
      <TextInput
        style={styles.input}
        placeholder="Họ và tên"
        value={form.fullName}
        onChangeText={(text) => handleChange("fullName", text)}
        returnKeyType="next"
        onSubmitEditing={() => emailRef.current?.focus()}
        editable={!loading}
      />
      <TextInput
        ref={emailRef}
        style={styles.input}
        placeholder="Email"
        value={form.email}
        onChangeText={(text) => handleChange("email", text)}
        keyboardType="email-address"
        autoCapitalize="none"
        returnKeyType="next"
        onSubmitEditing={() => phoneRef.current?.focus()}
        editable={!loading}
      />
      <TextInput
        ref={phoneRef}
        style={styles.input}
        placeholder="Số điện thoại"
        value={form.phone}
        onChangeText={(text) => handleChange("phone", text)}
        keyboardType="phone-pad"
        returnKeyType="next"
        onSubmitEditing={() => addressRef.current?.focus()}
        editable={!loading}
      />
      <TextInput
        ref={addressRef}
        style={styles.input}
        placeholder="Địa chỉ"
        value={form.address}
        onChangeText={(text) => handleChange("address", text)}
        returnKeyType="done"
        editable={!loading}
      />
      <Button
        title={
          customer ? "Cập nhật thông tin cá nhân" : "Lưu thông tin cá nhân"
        }
        onPress={handleSave}
        loading={loading}
        buttonStyle={styles.saveButton}
        containerStyle={{ marginTop: 20 }}
        disabled={loading}
      />

      <Button
        title="Đổi mật khẩu"
        onPress={() => setChangePasswordVisible(true)}
        buttonStyle={styles.changePasswordButton}
        containerStyle={{ marginTop: 10 }}
        disabled={loading}
        icon={
          <Ionicons
            name="lock-closed-outline"
            size={20}
            color="white"
            style={{ marginRight: 8 }}
          />
        }
      />

      {customer && (
        <Button
          title="Xóa thông tin cá nhân"
          onPress={handleDelete}
          buttonStyle={styles.deleteButton}
          containerStyle={{ marginTop: 10 }}
          disabled={loading}
        />
      )}
      <Button
        title="Đăng xuất"
        onPress={logout}
        buttonStyle={styles.logoutButton}
        containerStyle={{ marginTop: 10 }}
        disabled={loading}
      />

      {customer && (
        <View style={styles.infoBox}>
          <Text style={styles.infoLabel}>
            Mã người dùng:{" "}
            <Text style={styles.infoValue}>{customer.userId}</Text>
          </Text>
          <Text style={styles.infoLabel}>
            Ngày tạo tài khoản:{" "}
            <Text style={styles.infoValue}>{customer.createdAt}</Text>
          </Text>
        </View>
      )}

      <ChangePasswordModal
        visible={changePasswordVisible}
        onClose={() => setChangePasswordVisible(false)}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: "#fff",
    justifyContent: "center",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    marginBottom: 15,
    paddingHorizontal: 15,
    backgroundColor: "#f9f9f9",
  },
  saveButton: {
    backgroundColor: "#3498db",
    borderRadius: 8,
    height: 50,
  },
  deleteButton: {
    backgroundColor: "#e74c3c",
    borderRadius: 8,
    height: 50,
  },
  logoutButton: {
    backgroundColor: "#7f8c8d",
    borderRadius: 8,
    height: 50,
  },
  errorText: {
    color: "#e74c3c",
    textAlign: "center",
    marginBottom: 15,
  },
  infoBox: {
    marginTop: 20,
    padding: 15,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: "#555",
    marginBottom: 5,
  },
  infoValue: {
    fontWeight: "bold",
    color: "#333",
  },
  changePasswordButton: {
    backgroundColor: "#2980b9",
    borderRadius: 8,
    height: 50,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
});

export default ProfileScreen;
