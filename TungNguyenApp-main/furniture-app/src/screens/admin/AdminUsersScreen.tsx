import React, { useState, useEffect, useMemo, useCallback } from "react";
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
  ScrollView,
} from "react-native";
import {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  register,
  getAllCustomers,
  updateCustomerByUserId,
  createCustomer,
} from "../../services/api";
import {
  User,
  UserUpdateRequest,
  Customer,
  CustomerRequest,
} from "../../types";
import Ionicons from "react-native-vector-icons/Ionicons";

type CombinedUser = User & { customerInfo?: Customer };

const AdminUsersScreen = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentUser, setCurrentUser] = useState<CombinedUser | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Form states
  const [userFormData, setUserFormData] = useState({
    username: "",
    password: "",
    role: "customer",
  });
  const [customerFormData, setCustomerFormData] = useState<
    Omit<CustomerRequest, "userId">
  >({
    fullName: "",
    email: "",
    phone: "",
    address: "",
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const loadData = useCallback(async () => {
    setRefreshing(true);
    try {
      const [usersData, customersData] = await Promise.all([
        getAllUsers(),
        getAllCustomers(),
      ]);
      setUsers(usersData);
      setCustomers(customersData);
    } catch (error) {
      console.error("Error loading data:", error);
      Alert.alert("Lỗi", "Không thể tải dữ liệu");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const combinedUsers = useMemo((): CombinedUser[] => {
    const customersMap = new Map(customers.map((c) => [c.userId, c]));
    return users.map((user) => ({
      ...user,
      customerInfo: customersMap.get(user.id),
    }));
  }, [users, customers]);

  const filteredUsers = useMemo(() => {
    if (searchQuery.trim() === "") {
      return combinedUsers;
    }
    const lowercasedQuery = searchQuery.toLowerCase();
    return combinedUsers.filter(
      (user) =>
        user.username.toLowerCase().includes(lowercasedQuery) ||
        user.customerInfo?.fullName.toLowerCase().includes(lowercasedQuery) ||
        user.customerInfo?.email.toLowerCase().includes(lowercasedQuery)
    );
  }, [searchQuery, combinedUsers]);

  const openCreateModal = () => {
    setCurrentUser(null);
    setUserFormData({
      username: "",
      password: "",
      role: "customer",
    });
    setCustomerFormData({
      fullName: "",
      email: "",
      phone: "",
      address: "",
    });
    setFormErrors({});
    setModalVisible(true);
  };

  const openEditModal = (user: CombinedUser) => {
    setCurrentUser(user);
    setUserFormData({
      username: user.username,
      password: "",
      role: user.role,
    });
    setCustomerFormData({
      fullName: user.customerInfo?.fullName || "",
      email: user.customerInfo?.email || "",
      phone: user.customerInfo?.phone || "",
      address: user.customerInfo?.address || "",
    });
    setFormErrors({});
    setModalVisible(true);
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!userFormData.username.trim()) {
      errors.username = "Tên đăng nhập không được để trống";
    }

    if (!currentUser && !userFormData.password.trim()) {
      errors.password = "Mật khẩu không được để trống";
    }

    if (!userFormData.role) {
      errors.role = "Vai trò không được để trống";
    }

    if (userFormData.role === "customer") {
      if (!customerFormData.fullName.trim())
        errors.fullName = "Họ tên không được để trống";
      if (!customerFormData.email.trim())
        errors.email = "Email không được để trống";
      else if (!/\S+@\S+\.\S+/.test(customerFormData.email))
        errors.email = "Email không hợp lệ";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveUser = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      let savedUser: User;
      if (currentUser) {
        // Khi cập nhật người dùng hiện có, chỉ cập nhật thông tin khách hàng
        savedUser = currentUser;

        // Nếu là khách hàng, cập nhật thông tin khách hàng
        if (savedUser && savedUser.role === "customer") {
          const customerRequestData: CustomerRequest = {
            ...customerFormData,
            userId: savedUser.id,
          };

          try {
            if (currentUser.customerInfo) {
              await updateCustomerByUserId(savedUser.id, customerRequestData);
            } else {
              await createCustomer(customerRequestData);
            }
          } catch (customerError) {
            console.error("Lỗi cập nhật thông tin khách hàng:", customerError);
            Alert.alert("Cảnh báo", "Không thể cập nhật thông tin khách hàng");
          }
        }

        Alert.alert("Thành công", "Cập nhật thông tin khách hàng thành công");

        // Tải lại tất cả dữ liệu để đảm bảo đồng bộ
        await loadData();
      } else {
        // Tạo người dùng mới - giữ nguyên chức năng
        savedUser = await register({
          username: userFormData.username,
          password: userFormData.password,
          role: userFormData.role,
        });

        // If role is customer, create customer info
        if (savedUser && userFormData.role === "customer") {
          const customerRequestData: CustomerRequest = {
            ...customerFormData,
            userId: savedUser.id,
          };

          try {
            await createCustomer(customerRequestData);
          } catch (customerError) {
            console.error("Lỗi tạo thông tin khách hàng:", customerError);
            Alert.alert(
              "Cảnh báo",
              "Tài khoản đã được tạo nhưng thông tin khách hàng không được cập nhật"
            );
          }
        }

        Alert.alert("Thành công", "Thêm người dùng mới thành công");

        // Tải lại tất cả dữ liệu để đảm bảo đồng bộ
        await loadData();
      }

      setModalVisible(false);
    } catch (error) {
      console.error("Error saving user:", error);
      Alert.alert("Lỗi", "Không thể lưu thông tin người dùng");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = (userId: number) => {
    Alert.alert(
      "Xác nhận xóa",
      "Bạn có chắc chắn muốn xóa người dùng này? Thao tác này không thể hoàn tác.",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xóa",
          style: "destructive",
          onPress: async () => {
            try {
              setLoading(true);
              await deleteUser(userId);
              // Remove user from local state
              setUsers(users.filter((u) => u.id !== userId));
              Alert.alert("Thành công", "Xóa người dùng thành công");
            } catch (error) {
              console.error("Error deleting user:", error);
              Alert.alert("Lỗi", "Không thể xóa người dùng");
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role.toLowerCase()) {
      case "admin":
        return "#e74c3c";
      case "customer":
        return "#3498db";
      default:
        return "#7f8c8d";
    }
  };

  const renderUserItem = ({ item }: { item: CombinedUser }) => {
    const roleBadgeColor = getRoleBadgeColor(item.role);

    return (
      <View style={styles.userItem}>
        <View style={styles.userInfo}>
          <View style={styles.userHeader}>
            <Text style={styles.username}>{item.username}</Text>
            <View
              style={[styles.roleBadge, { backgroundColor: roleBadgeColor }]}
            >
              <Text style={styles.roleText}>{item.role.toUpperCase()}</Text>
            </View>
          </View>
          <Text style={styles.userId}>ID: {item.id}</Text>
          {item.customerInfo && (
            <View style={styles.customerInfoContainer}>
              <Text style={styles.customerName}>
                {item.customerInfo.fullName}
              </Text>
              <Text style={styles.customerContact}>
                {item.customerInfo.email}
              </Text>
            </View>
          )}
        </View>
        <View style={styles.userActions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.editButton]}
            onPress={() => openEditModal(item)}
          >
            <Ionicons name="create-outline" size={20} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => handleDeleteUser(item.id)}
          >
            <Ionicons name="trash-outline" size={20} color="#fff" />
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
          placeholder="Tìm theo tên đăng nhập, họ tên,..."
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
          <Text style={styles.loadingText}>Đang tải người dùng...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredUsers}
          renderItem={renderUserItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.userList}
          onRefresh={loadData}
          refreshing={refreshing}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="people-outline" size={64} color="#ccc" />
              <Text style={styles.emptyText}>Không tìm thấy người dùng</Text>
            </View>
          }
        />
      )}

      {/* User Form Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <ScrollView
            style={styles.modalContent}
            contentContainerStyle={{ paddingBottom: 50 }}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {currentUser ? "Cập nhật người dùng" : "Thêm người dùng mới"}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <View style={styles.formContainer}>
              <Text style={styles.sectionTitle}>Thông tin tài khoản</Text>

              {currentUser && (
                <View style={styles.readonlyInfoBox}>
                  <Ionicons
                    name="lock-closed"
                    size={20}
                    color="#777"
                    style={styles.lockIcon}
                  />
                  <Text style={styles.readonlyInfoText}>
                    Thông tin tài khoản không thể chỉnh sửa để đảm bảo an toàn
                    hệ thống
                  </Text>
                </View>
              )}

              <Text style={styles.inputLabel}>Tên đăng nhập</Text>
              <View style={styles.readonlyContainer}>
                <TextInput
                  style={[
                    styles.input,
                    formErrors.username && styles.inputError,
                    currentUser && styles.readonlyInput,
                  ]}
                  value={userFormData.username}
                  onChangeText={(text) =>
                    setUserFormData({ ...userFormData, username: text })
                  }
                  placeholder="Nhập tên đăng nhập"
                  editable={!currentUser} // Cannot edit username for existing users
                />
                {currentUser && (
                  <Ionicons
                    name="lock-closed"
                    size={18}
                    color="#777"
                    style={styles.inputLockIcon}
                  />
                )}
              </View>
              {formErrors.username && (
                <Text style={styles.errorText}>{formErrors.username}</Text>
              )}

              {!currentUser ? (
                <>
                  <Text style={styles.inputLabel}>Mật khẩu</Text>
                  <TextInput
                    style={[
                      styles.input,
                      formErrors.password && styles.inputError,
                    ]}
                    value={userFormData.password}
                    onChangeText={(text) =>
                      setUserFormData({ ...userFormData, password: text })
                    }
                    placeholder="Nhập mật khẩu"
                    secureTextEntry
                  />
                  {formErrors.password && (
                    <Text style={styles.errorText}>{formErrors.password}</Text>
                  )}
                </>
              ) : null}

              <Text style={styles.inputLabel}>Vai trò</Text>
              <View style={styles.roleOptions}>
                <View
                  style={[
                    styles.roleOption,
                    userFormData.role === "customer" &&
                      !currentUser &&
                      styles.selectedRoleOption,
                    currentUser && styles.readonlyRoleOption,
                    currentUser &&
                      userFormData.role === "customer" &&
                      styles.readonlySelectedRole,
                  ]}
                >
                  <Text
                    style={[
                      styles.roleOptionText,
                      userFormData.role === "customer" &&
                        !currentUser &&
                        styles.selectedRoleOptionText,
                      currentUser && styles.readonlyRoleText,
                    ]}
                  >
                    CUSTOMER
                  </Text>
                  {currentUser && userFormData.role === "customer" && (
                    <Ionicons
                      name="checkmark-circle"
                      size={16}
                      color="#3498db"
                      style={styles.roleIcon}
                    />
                  )}
                </View>
                <View
                  style={[
                    styles.roleOption,
                    userFormData.role === "admin" &&
                      !currentUser &&
                      styles.selectedRoleOption,
                    currentUser && styles.readonlyRoleOption,
                    currentUser &&
                      userFormData.role === "admin" &&
                      styles.readonlySelectedRole,
                  ]}
                >
                  <Text
                    style={[
                      styles.roleOptionText,
                      userFormData.role === "admin" &&
                        !currentUser &&
                        styles.selectedRoleOptionText,
                      currentUser && styles.readonlyRoleText,
                    ]}
                  >
                    ADMIN
                  </Text>
                  {currentUser && userFormData.role === "admin" && (
                    <Ionicons
                      name="checkmark-circle"
                      size={16}
                      color="#3498db"
                      style={styles.roleIcon}
                    />
                  )}
                </View>
              </View>
              {formErrors.role && (
                <Text style={styles.errorText}>{formErrors.role}</Text>
              )}

              {userFormData.role === "customer" && (
                <>
                  <Text style={styles.sectionTitle}>Thông tin khách hàng</Text>
                  <Text style={styles.inputLabel}>Họ và Tên</Text>
                  <TextInput
                    style={[
                      styles.input,
                      formErrors.fullName && styles.inputError,
                    ]}
                    value={customerFormData.fullName}
                    onChangeText={(text) =>
                      setCustomerFormData({
                        ...customerFormData,
                        fullName: text,
                      })
                    }
                    placeholder="Nhập họ và tên"
                  />
                  {formErrors.fullName && (
                    <Text style={styles.errorText}>{formErrors.fullName}</Text>
                  )}

                  <Text style={styles.inputLabel}>Email</Text>
                  <TextInput
                    style={[
                      styles.input,
                      formErrors.email && styles.inputError,
                    ]}
                    value={customerFormData.email}
                    onChangeText={(text) =>
                      setCustomerFormData({ ...customerFormData, email: text })
                    }
                    placeholder="Nhập email"
                    keyboardType="email-address"
                  />
                  {formErrors.email && (
                    <Text style={styles.errorText}>{formErrors.email}</Text>
                  )}

                  <Text style={styles.inputLabel}>Số điện thoại</Text>
                  <TextInput
                    style={styles.input}
                    value={customerFormData.phone}
                    onChangeText={(text) =>
                      setCustomerFormData({ ...customerFormData, phone: text })
                    }
                    placeholder="Nhập số điện thoại"
                    keyboardType="phone-pad"
                  />

                  <Text style={styles.inputLabel}>Địa chỉ</Text>
                  <TextInput
                    style={styles.input}
                    value={customerFormData.address}
                    onChangeText={(text) =>
                      setCustomerFormData({
                        ...customerFormData,
                        address: text,
                      })
                    }
                    placeholder="Nhập địa chỉ"
                  />
                </>
              )}

              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleSaveUser}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.submitButtonText}>
                    {currentUser ? "Cập nhật" : "Thêm mới"}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
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
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
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
  searchContainer: {
    flexDirection: "row",
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
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
  userList: {
    padding: 16,
  },
  userItem: {
    flexDirection: "row",
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
  userInfo: {
    flex: 1,
  },
  userHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  username: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginRight: 8,
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  roleText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 12,
  },
  userId: {
    fontSize: 14,
    color: "#777",
  },
  customerInfoContainer: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  customerName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#444",
  },
  customerContact: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  userActions: {
    justifyContent: "space-around",
    marginLeft: 16,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 4,
  },
  editButton: {
    backgroundColor: "#3498db",
  },
  deleteButton: {
    backgroundColor: "#e74c3c",
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
    maxHeight: "85%",
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginTop: 10,
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingBottom: 5,
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
    paddingVertical: 10,
    marginBottom: 16,
    backgroundColor: "#f9f9f9",
  },
  readonlyContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  readonlyInput: {
    backgroundColor: "#f9f9f9",
    color: "#666",
    borderColor: "#ddd",
    borderStyle: "dashed",
    flex: 1,
  },
  readonlyLabel: {
    marginLeft: 8,
    color: "#999",
  },
  readonlyHint: {
    color: "#999",
    marginTop: 8,
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
  roleOptions: {
    flexDirection: "row",
    marginBottom: 16,
  },
  roleOption: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    marginHorizontal: 4,
    borderRadius: 8,
  },
  selectedRoleOption: {
    backgroundColor: "#3498db",
    borderColor: "#3498db",
  },
  roleOptionText: {
    color: "#555",
    fontWeight: "bold",
  },
  selectedRoleOptionText: {
    color: "#fff",
  },
  readonlyRoleOption: {
    backgroundColor: "#f9f9f9",
    borderColor: "#ddd",
    borderStyle: "dashed",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  readonlySelectedRole: {
    backgroundColor: "#edf7ff",
    borderColor: "#3498db",
    borderStyle: "dashed",
  },
  readonlyRoleText: {
    color: "#666",
    fontWeight: "500",
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
  readonlyInfoBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f7fa",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#3498db",
  },
  lockIcon: {
    marginRight: 10,
    color: "#3498db",
  },
  readonlyInfoText: {
    color: "#34495e",
    fontSize: 13,
    flex: 1,
  },
  inputLockIcon: {
    position: "absolute",
    right: 12,
    color: "#95a5a6",
  },
  roleIcon: {
    marginLeft: 6,
  },
});

export default AdminUsersScreen;
