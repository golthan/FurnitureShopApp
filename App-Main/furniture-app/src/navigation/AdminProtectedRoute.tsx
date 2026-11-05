import React, { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useAuth } from "../contexts/AuthContext";
import Ionicons from "react-native-vector-icons/Ionicons";

type AdminProtectedRouteProps = {
  children: React.ReactNode;
};

const AdminProtectedRoute: React.FC<AdminProtectedRouteProps> = ({
  children,
}) => {
  const { user, isLoading, logout } = useAuth();

  const isAdmin = user?.role === "admin";

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      // If a non-admin somehow reaches this point, log them out to reset state.
      logout();
    }
  }, [isLoading, isAdmin, logout]);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Đang tải...</Text>
      </View>
    );
  }

  if (!isAdmin) {
    // This part might not be visible for long due to logout, but it's good for fallback.
    return (
      <View style={styles.container}>
        <Ionicons name="alert-circle-outline" size={64} color="#e74c3c" />
        <Text style={styles.errorTitle}>Phiên không hợp lệ</Text>
        <Text style={styles.errorText}>
          Bạn không có quyền truy cập. Đang đăng xuất...
        </Text>
      </View>
    );
  }

  return <>{children}</>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    padding: 20,
  },
  loadingText: {
    fontSize: 18,
    color: "#333",
  },
  errorTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#e74c3c",
    marginTop: 16,
  },
  errorText: {
    fontSize: 16,
    color: "#555",
    textAlign: "center",
    marginTop: 8,
    marginBottom: 24,
  },
});

export default AdminProtectedRoute;
