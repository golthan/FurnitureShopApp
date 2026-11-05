import React from "react";
import { View, StyleSheet, Image, Text, TouchableOpacity } from "react-native";
import { Button } from "react-native-elements";
import { Product } from "../types";
import { useNavigation } from "@react-navigation/native";
import { HomeStackParamList } from "../navigation/AppNavigator";
import { StackNavigationProp } from "@react-navigation/stack";
import { API_BASE_URL } from "../services/api";

type ProductCardProps = {
  product: Product;
  onAddToCart: () => void;
};

const ProductCard = ({ product, onAddToCart }: ProductCardProps) => {
  const primaryImage =
    product.images.find((img) => img.isPrimary) || product.images[0];
  const navigation = useNavigation<StackNavigationProp<HomeStackParamList>>();

  return (
    <TouchableOpacity
      onPress={() => navigation.navigate("ProductDetail", { product })}
    >
      <View style={styles.container}>
        {primaryImage && (
          <Image
            source={{
              uri: primaryImage.imageUrl
                ? primaryImage.imageUrl.startsWith("http://localhost:8080")
                  ? primaryImage.imageUrl.replace(
                      "http://localhost:8080",
                      API_BASE_URL
                    )
                  : primaryImage.imageUrl
                : undefined,
            }}
            style={styles.image}
            resizeMode="cover"
          />
        )}
        <View style={styles.details}>
          <Text style={styles.name}>{product.name}</Text>
          {product.promotionTitle ? (
            <View style={styles.priceRow}>
              <Text style={styles.originalPrice}>
                {product.price.toLocaleString("vi-VN")} ₫
              </Text>
              <Text style={styles.salePrice}>
                {(product.price * 0.9).toLocaleString("vi-VN")} ₫
              </Text>
            </View>
          ) : (
            <Text style={styles.price}>
              {product.price.toLocaleString("vi-VN")} ₫
            </Text>
          )}
          {product.promotionTitle && (
            <Text style={styles.promotion}>{product.promotionTitle}</Text>
          )}
          <Button
            title="Add to Cart"
            onPress={onAddToCart}
            buttonStyle={styles.button}
            titleStyle={styles.buttonText}
          />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    marginBottom: 16,
    backgroundColor: "#fff",
    borderRadius: 18,
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  image: {
    width: 110,
    height: 110,
    borderTopLeftRadius: 18,
    borderBottomLeftRadius: 18,
  },
  details: {
    flex: 1,
    padding: 14,
    justifyContent: "center",
  },
  name: {
    fontSize: 17,
    fontWeight: "bold",
    marginBottom: 6,
    color: "#222",
  },
  price: {
    fontSize: 16,
    color: "#2ecc71",
    marginBottom: 4,
    fontWeight: "bold",
  },
  promotion: {
    fontSize: 13,
    color: "#e74c3c",
    marginBottom: 8,
  },
  button: {
    backgroundColor: "#3498db",
    borderRadius: 8,
    paddingVertical: 7,
    marginTop: 6,
  },
  buttonText: {
    fontSize: 15,
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

export default ProductCard;
