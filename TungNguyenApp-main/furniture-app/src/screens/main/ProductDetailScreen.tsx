import React, { useRef } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Text,
  Image,
  FlatList,
  Dimensions,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  StatusBar,
} from "react-native";
import { Button } from "react-native-elements";
import { useCart } from "../../contexts/CartContext";
import { RouteProp } from "@react-navigation/native";
import { HomeStackParamList } from "../../navigation/AppNavigator";
import { API_BASE_URL, getProductById } from "../../services/api";
import { useNavigation, useFocusEffect } from "@react-navigation/native";

type ProductDetailScreenRouteProp = RouteProp<
  HomeStackParamList,
  "ProductDetail"
>;

type Props = {
  route: ProductDetailScreenRouteProp;
};

const ProductDetailScreen = ({ route }: Props) => {
  const { product: initialProduct } = route.params;
  const { addToCart } = useCart();
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const images = initialProduct.images || [];
  const mainImage = images[selectedIndex];
  const flatListRef = useRef<FlatList<any>>(null);
  const navigation = useNavigation();
  const [product, setProduct] = React.useState(initialProduct);

  // Cập nhật lại thông tin sản phẩm khi vào lại màn chi tiết
  useFocusEffect(
    React.useCallback(() => {
      let isActive = true;
      const fetchProduct = async () => {
        try {
          const latest = await getProductById(initialProduct.id);
          if (isActive) setProduct(latest);
        } catch (e) {}
      };
      fetchProduct();
      return () => {
        isActive = false;
      };
    }, [initialProduct.id])
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <View style={styles.headerHomeLike}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backBtnText}>{"‹"}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitleHomeLike}>Product Details</Text>
        <View style={{ width: 32 }} />
      </View>
      <ScrollView style={styles.container}>
        {images.length > 0 && (
          <>
            <View style={styles.mainImageWrapper}>
              <FlatList
                ref={flatListRef}
                data={images}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                keyExtractor={(img, idx) =>
                  img.id ? img.id.toString() : idx.toString()
                }
                renderItem={({ item }) => (
                  <Image
                    source={{
                      uri: item.imageUrl
                        ? item.imageUrl.startsWith("http://localhost:8080")
                          ? item.imageUrl.replace(
                              "http://localhost:8080",
                              API_BASE_URL
                            )
                          : item.imageUrl
                        : undefined,
                    }}
                    style={styles.mainImage}
                    resizeMode="contain"
                  />
                )}
                onMomentumScrollEnd={(e) => {
                  const idx = Math.round(
                    e.nativeEvent.contentOffset.x /
                      Dimensions.get("window").width
                  );
                  setSelectedIndex(idx);
                }}
                initialScrollIndex={selectedIndex}
                getItemLayout={(_, index) => ({
                  length: Dimensions.get("window").width,
                  offset: Dimensions.get("window").width * index,
                  index,
                })}
                extraData={selectedIndex}
              />
              <View style={styles.imageIndicator}>
                <Text style={styles.imageIndicatorText}>
                  {selectedIndex + 1}/{images.length}
                </Text>
              </View>
            </View>
            <FlatList
              data={images}
              keyExtractor={(img, idx) =>
                img.id ? img.id.toString() : idx.toString()
              }
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.thumbnailList}
              renderItem={({ item, index }) => (
                <TouchableOpacity
                  onPress={() => {
                    setSelectedIndex(index);
                    flatListRef.current?.scrollToIndex({
                      index,
                      animated: true,
                    });
                  }}
                >
                  <Image
                    source={{
                      uri: item.imageUrl
                        ? item.imageUrl.startsWith("http://localhost:8080")
                          ? item.imageUrl.replace(
                              "http://localhost:8080",
                              API_BASE_URL
                            )
                          : item.imageUrl
                        : undefined,
                    }}
                    style={[
                      styles.thumbnail,
                      index === selectedIndex && styles.thumbnailSelected,
                    ]}
                    resizeMode="cover"
                  />
                </TouchableOpacity>
              )}
            />
          </>
        )}

        <View style={styles.details}>
          <Text style={styles.name}>{product.name}</Text>

          {product.promotionTitle ? (
            <>
              <View style={styles.priceContainer}>
                <Text style={styles.discountedPrice}>
                  {(product.price * 0.9).toLocaleString("vi-VN")} ₫
                </Text>
                <Text style={styles.originalPrice}>
                  {product.price.toLocaleString("vi-VN")} ₫
                </Text>
                <Text style={styles.promotion}>{product.promotionTitle}</Text>
              </View>
            </>
          ) : (
            <Text style={styles.price}>
              {product.price.toLocaleString("vi-VN")} ₫
            </Text>
          )}

          <Text style={styles.description}>{product.description}</Text>

          <Text style={styles.stock}>
            {product.stock > 0
              ? `In Stock: ${product.stock} items`
              : "Out of Stock"}
          </Text>

          <Button
            title="Add to Cart"
            onPress={() => addToCart(product)}
            disabled={product.stock <= 0}
            buttonStyle={styles.addToCartButton}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  headerHomeLike: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    paddingTop:
      Platform.OS === "android" ? (StatusBar.currentHeight || 24) + 8 : 24,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    marginBottom: 4,
  },
  headerTitleHomeLike: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#3498db",
    textAlign: "center",
    flex: 1,
  },
  backBtn: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
    backgroundColor: "#f0f4fa",
    marginRight: 8,
  },
  backBtnText: {
    fontSize: 22,
    color: "#3498db",
    fontWeight: "bold",
    marginTop: -2,
  },
  mainImageWrapper: {
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    backgroundColor: "#f8f8f8",
    borderRadius: 12,
    marginTop: 10,
    marginBottom: 8,
    overflow: "hidden",
  },
  mainImage: {
    width: Dimensions.get("window").width,
    height: 320,
  },
  imageIndicator: {
    position: "absolute",
    bottom: 10,
    right: 18,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 2,
  },
  imageIndicatorText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
  thumbnailList: {
    marginBottom: 10,
    paddingHorizontal: 8,
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 8,
    borderWidth: 2,
    borderColor: "#eee",
    backgroundColor: "#fff",
  },
  thumbnailSelected: {
    borderColor: "#3498db",
    borderWidth: 2.5,
  },
  details: {
    padding: 20,
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 15,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  price: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#2ecc71",
    marginBottom: 15,
  },
  originalPrice: {
    fontSize: 18,
    color: "#95a5a6",
    textDecorationLine: "line-through",
    marginRight: 10,
  },
  discountedPrice: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#e74c3c",
    marginRight: 10,
  },
  promotion: {
    fontSize: 16,
    color: "#e74c3c",
    fontStyle: "italic",
    textAlign: "center",
    marginTop: 4,
    marginBottom: 4,
    paddingHorizontal: 8,
    flexShrink: 1,
    flexWrap: "wrap",
    alignSelf: "center",
    maxWidth: "100%",
    lineHeight: 22,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 20,
  },
  stock: {
    fontSize: 16,
    marginBottom: 20,
    color: "#7f8c8d",
  },
  addToCartButton: {
    backgroundColor: "#3498db",
    borderRadius: 5,
    paddingVertical: 10,
  },
});

export default ProductDetailScreen;
