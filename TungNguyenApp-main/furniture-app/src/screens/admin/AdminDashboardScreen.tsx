import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { getDashboardOverview, getSalesStatistics } from "../../services/api";
import { DashboardOverview, SalesStatistics } from "../../types";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useAuth } from "../../contexts/AuthContext";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { AdminTabParamList } from "../../navigation/AppNavigator";

type AdminDashboardScreenNavigationProp =
  BottomTabNavigationProp<AdminTabParamList>;

type Props = {
  navigation: AdminDashboardScreenNavigationProp;
};

type AdminMenuItemProps = {
  title: string;
  icon: string;
  color: string;
  onPress: () => void;
};

const AdminMenuItem: React.FC<AdminMenuItemProps> = ({
  title,
  icon,
  color,
  onPress,
}) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress}>
    <View style={[styles.iconContainer, { backgroundColor: color }]}>
      <Ionicons name={icon as any} size={30} color="#fff" />
    </View>
    <Text style={styles.menuItemText}>{title}</Text>
  </TouchableOpacity>
);

const AdminDashboardScreen: React.FC<Props> = ({ navigation }) => {
  const { user } = useAuth();
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [sales, setSales] = useState<SalesStatistics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [overviewData, salesData] = await Promise.all([
          getDashboardOverview(),
          getSalesStatistics(),
        ]);
        setOverview(overviewData);
        setSales(salesData);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const menuItems: {
    title: string;
    icon: string;
    screen: keyof AdminTabParamList;
  }[] = [
    { title: "Quản lý sản phẩm", icon: "cube-outline", screen: "Products" },
    { title: "Quản lý danh mục", icon: "copy-outline", screen: "Categories" },
    { title: "Quản lý đơn hàng", icon: "receipt-outline", screen: "Orders" },
    {
      title: "Quản lý khuyến mãi",
      icon: "pricetag-outline",
      screen: "Promotions",
    },
    { title: "Quản lý người dùng", icon: "people-outline", screen: "Users" },
  ];

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#333" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          Chào mừng trở lại, {user?.username || "Admin"}!
        </Text>
        <Text style={styles.headerSubtitle}>
          Đây là tổng quan hệ thống của bạn.
        </Text>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Ionicons name="people-circle-outline" size={32} color="#3498db" />
          <Text style={styles.statValue}>{overview?.userCount ?? "..."}</Text>
          <Text style={styles.statLabel}>Người dùng</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="cube-outline" size={32} color="#2ecc71" />
          <Text style={styles.statValue}>
            {overview?.productCount ?? "..."}
          </Text>
          <Text style={styles.statLabel}>Sản phẩm</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="receipt-outline" size={32} color="#e74c3c" />
          <Text style={styles.statValue}>{overview?.orderCount ?? "..."}</Text>
          <Text style={styles.statLabel}>Đơn hàng</Text>
        </View>
      </View>

      <View style={styles.salesCard}>
        <Text style={styles.menuTitle}>Thống kê doanh thu</Text>
        <Text style={styles.salesText}>
          Hôm nay: {sales?.dailyRevenue ?? "..."}
        </Text>
        <Text style={styles.salesText}>
          Tháng này: {sales?.monthlyRevenue ?? "..."}
        </Text>
        <Text style={styles.salesText}>
          Tổng cộng: {sales?.totalRevenue ?? "..."}
        </Text>
      </View>

      <View style={styles.menuContainer}>
        <Text style={styles.menuTitle}>Quản lý hệ thống</Text>
        <View style={styles.menuGrid}>
          {menuItems.map((item, index) => (
            <AdminMenuItem
              key={item.screen}
              title={item.title}
              icon={item.icon}
              color={
                [
                  "#3498db",
                  "#2ecc71",
                  "#e74c3c",
                  "#f39c12",
                  "#9b59b6",
                  "#1abc9c",
                ][index % 6]
              }
              onPress={() => navigation.navigate(item.screen)}
            />
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    backgroundColor: "#333",
    padding: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#ddd",
    marginTop: 4,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 16,
    marginTop: -20,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginHorizontal: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginTop: 8,
  },
  statLabel: {
    fontSize: 14,
    color: "#777",
    marginTop: 4,
  },
  salesCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    margin: 24,
  },
  salesText: {
    fontSize: 16,
    color: "#555",
    marginBottom: 8,
  },
  menuContainer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  menuTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
  },
  menuGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  menuItem: {
    width: "48%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  menuItemText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
  },
});

export default AdminDashboardScreen;
