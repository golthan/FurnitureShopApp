import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { Product } from "../types";
import HomeScreen from "../screens/main/HomeScreen";
import CartScreen from "../screens/main/CartScreen";
import OrdersScreen from "../screens/main/OrdersScreen";
import ProfileScreen from "../screens/main/ProfileScreen";
import ProductDetailScreen from "../screens/main/ProductDetailScreen";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useAuth } from "../contexts/AuthContext";

// Import admin screens
import AdminDashboardScreen from "../screens/admin/AdminDashboardScreen";
import AdminProductsScreen from "../screens/admin/AdminProductsScreen";
import AdminCategoriesScreen from "../screens/admin/AdminCategoriesScreen";
import AdminOrdersScreen from "../screens/admin/AdminOrdersScreen";
import AdminPromotionsScreen from "../screens/admin/AdminPromotionsScreen";
import AdminUsersScreen from "../screens/admin/AdminUsersScreen";
import AdminProfileScreen from "../screens/admin/AdminProfileScreen";
import AdminProtectedRoute from "./AdminProtectedRoute";

// --- Type Definitions ---

export type HomeStackParamList = {
  Home: undefined;
  ProductDetail: { product: Product };
};

export type CustomerTabParamList = {
  Home: undefined; // Refers to HomeStack
  Cart: undefined;
  Orders: undefined;
  Profile: undefined;
};

export type AdminTabParamList = {
  Dashboard: undefined;
  Products: undefined;
  Categories: undefined;
  Orders: undefined;
  Promotions: undefined;
  Users: undefined;
  Profile: undefined;
};

const CustomerTab = createBottomTabNavigator<CustomerTabParamList>();
const AdminTab = createBottomTabNavigator<AdminTabParamList>();
const HomeStackNavigator = createStackNavigator<HomeStackParamList>();

// --- Customer Navigator ---

const HomeStack = () => {
  return (
    <HomeStackNavigator.Navigator>
      <HomeStackNavigator.Screen
        name="Home"
        component={HomeScreen}
        options={{ headerShown: true, title: "Home" }}
      />
      <HomeStackNavigator.Screen
        name="ProductDetail"
        component={ProductDetailScreen}
        options={{ headerShown: false }}
      />
    </HomeStackNavigator.Navigator>
  );
};

const CustomerAppNavigator = () => {
  return (
    <CustomerTab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName = "";
          if (route.name === "Home")
            iconName = focused ? "home" : "home-outline";
          else if (route.name === "Cart")
            iconName = focused ? "cart" : "cart-outline";
          else if (route.name === "Orders")
            iconName = focused ? "list" : "list-outline";
          else if (route.name === "Profile")
            iconName = focused ? "person" : "person-outline";
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#3498db",
        tabBarInactiveTintColor: "#888",
        tabBarStyle: {
          backgroundColor: "#fff",
          borderTopLeftRadius: 18,
          borderTopRightRadius: 18,
          height: 62,
          paddingBottom: 8,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.08,
          shadowRadius: 8,
          elevation: 8,
        },
        tabBarLabelStyle: {
          fontSize: 13,
          fontWeight: "bold",
          marginBottom: 4,
        },
        headerShown: true,
      })}
    >
      <CustomerTab.Screen
        name="Home"
        component={HomeStack}
        options={{ title: "Home", headerShown: false }}
      />
      <CustomerTab.Screen
        name="Cart"
        component={CartScreen}
        options={{ title: "Cart" }}
      />
      <CustomerTab.Screen
        name="Orders"
        component={OrdersScreen}
        options={{ title: "Orders" }}
      />
      <CustomerTab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: "Profile" }}
      />
    </CustomerTab.Navigator>
  );
};

// --- Admin Navigator ---

const AdminAppNavigator = () => {
  return (
    <AdminProtectedRoute>
      <AdminTab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName = "";
            if (route.name === "Dashboard")
              iconName = focused ? "analytics" : "analytics-outline";
            else if (route.name === "Products")
              iconName = focused ? "cube" : "cube-outline";
            else if (route.name === "Categories")
              iconName = focused ? "copy" : "copy-outline";
            else if (route.name === "Orders")
              iconName = focused ? "receipt" : "receipt-outline";
            else if (route.name === "Users")
              iconName = focused ? "people" : "people-outline";
            else if (route.name === "Promotions")
              iconName = focused ? "pricetag" : "pricetag-outline";
            else if (route.name === "Profile")
              iconName = focused ? "person-circle" : "person-circle-outline";
            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: "#e74c3c",
          tabBarInactiveTintColor: "#888",
          tabBarStyle: {
            backgroundColor: "#fff",
            height: 62,
            paddingBottom: 8,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: "bold",
            marginBottom: 4,
          },
        })}
      >
        <AdminTab.Screen
          name="Dashboard"
          component={AdminDashboardScreen}
          options={{ title: "Dashboard" }}
        />
        <AdminTab.Screen
          name="Products"
          component={AdminProductsScreen}
          options={{ title: "Products" }}
        />
        <AdminTab.Screen
          name="Categories"
          component={AdminCategoriesScreen}
          options={{ title: "Categories" }}
        />
        <AdminTab.Screen
          name="Orders"
          component={AdminOrdersScreen}
          options={{ title: "Orders" }}
        />
        <AdminTab.Screen
          name="Users"
          component={AdminUsersScreen}
          options={{ title: "Users" }}
        />
        <AdminTab.Screen
          name="Promotions"
          component={AdminPromotionsScreen}
          options={{ title: "Promotions" }}
        />
        <AdminTab.Screen
          name="Profile"
          component={AdminProfileScreen}
          options={{ title: "Profile" }}
        />
      </AdminTab.Navigator>
    </AdminProtectedRoute>
  );
};

// --- Main App Navigator ---

const AppNavigator = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  return isAdmin ? <AdminAppNavigator /> : <CustomerAppNavigator />;
};

export default AppNavigator;
