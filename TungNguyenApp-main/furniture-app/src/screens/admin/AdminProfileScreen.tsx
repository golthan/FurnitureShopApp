import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useAuth } from "../../contexts/AuthContext";
import Ionicons from "react-native-vector-icons/Ionicons";
import ChangePasswordModal from "../../components/ChangePasswordModal";

const AdminProfileScreen = () => {
  const { user, logout } = useAuth();
  const [changePasswordVisible, setChangePasswordVisible] = useState(false);

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>
          Vui lòng đăng nhập để xem thông tin tài khoản.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.profileHeader}>
        <View style={styles.avatarContainer}>
          <Ionicons name="person-circle" size={100} color="#3498db" />
        </View>
        <Text style={styles.username}>{user.username}</Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>{user.role.toUpperCase()}</Text>
        </View>
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>Thông tin tài khoản</Text>

        <View style={styles.infoItem}>
          <Ionicons
            name="person-outline"
            size={24}
            color="#3498db"
            style={styles.infoIcon}
          />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Tên đăng nhập</Text>
            <Text style={styles.infoValue}>{user.username}</Text>
          </View>
        </View>

        <View style={styles.infoItem}>
          <Ionicons
            name="shield-outline"
            size={24}
            color="#3498db"
            style={styles.infoIcon}
          />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Vai trò</Text>
            <Text style={styles.infoValue}>{user.role}</Text>
          </View>
        </View>

        <View style={styles.infoItem}>
          <Ionicons
            name="key-outline"
            size={24}
            color="#3498db"
            style={styles.infoIcon}
          />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Mật khẩu</Text>
            <Text style={styles.infoValue}>••••••••</Text>
          </View>
          <TouchableOpacity
            style={styles.changeButton}
            onPress={() => setChangePasswordVisible(true)}
          >
            <Text style={styles.changeButtonText}>Đổi</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.infoItem}>
          <Ionicons
            name="id-card-outline"
            size={24}
            color="#3498db"
            style={styles.infoIcon}
          />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>ID người dùng</Text>
            <Text style={styles.infoValue}>{user.id}</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity
        style={styles.logoutButton}
        onPress={() => {
          Alert.alert(
            "Xác nhận đăng xuất",
            "Bạn có chắc chắn muốn đăng xuất?",
            [
              { text: "Hủy", style: "cancel" },
              {
                text: "Đăng xuất",
                style: "destructive",
                onPress: () => logout(),
              },
            ]
          );
        }}
      >
        <Ionicons
          name="log-out-outline"
          size={24}
          color="#fff"
          style={styles.buttonIcon}
        />
        <Text style={styles.buttonText}>Đăng xuất</Text>
      </TouchableOpacity>

      <ChangePasswordModal
        visible={changePasswordVisible}
        onClose={() => setChangePasswordVisible(false)}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  profileHeader: {
    backgroundColor: "#fff",
    paddingTop: 30,
    paddingBottom: 20,
    alignItems: "center",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarContainer: {
    marginBottom: 10,
  },
  username: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  roleBadge: {
    backgroundColor: "#e74c3c",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  roleText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 12,
  },
  infoSection: {
    backgroundColor: "#fff",
    margin: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingBottom: 8,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  infoIcon: {
    marginRight: 16,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    color: "#777",
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  changeButton: {
    backgroundColor: "#3498db",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  changeButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  logoutButton: {
    backgroundColor: "#e74c3c",
    margin: 16,
    padding: 16,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  buttonIcon: {
    marginRight: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  errorText: {
    color: "#e74c3c",
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
  },
});

export default AdminProfileScreen;
