import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  TextInput,
  Text,
  ActivityIndicator,
} from "react-native";
import { useCart } from "../../contexts/CartContext";
import api, { fetchCategories } from "../../services/api";
import { Product, Category } from "../../types";
import ProductCard from "../../components/ProductCard";

const HomeScreen = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const { addToCart } = useCart();
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  useEffect(() => {
    const getCategories = async () => {
      try {
        const data = await fetchCategories();
        setCategories(data);
      } catch (err) {
        // ignore
      }
    };
    getCategories();
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  useEffect(() => {
    setPage(0);
  }, [debouncedSearchQuery, selectedCategory]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        if (page === 0) setLoading(true);
        const params: any = { page, size: 10 };
        if (debouncedSearchQuery) params.keyword = debouncedSearchQuery;
        if (selectedCategory) params.categoryId = selectedCategory;
        const response = await api.get("/api/products", { params });
        if (page === 0) {
          setProducts(response.data.content);
        } else {
          setProducts((prev) => [...prev, ...response.data.content]);
        }
        setTotalPages(response.data.totalPages);
      } catch (err) {
        setError("Failed to load products");
      } finally {
        setLoading(false);
        setIsLoadingMore(false);
      }
    };
    fetchProducts();
  }, [debouncedSearchQuery, selectedCategory, page]);

  const handleLoadMore = () => {
    if (
      !loading &&
      !isLoadingMore &&
      selectedCategory === null &&
      page + 1 < totalPages
    ) {
      setIsLoadingMore(true);
      setPage((prev) => prev + 1);
    }
  };

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.filterContainer}>
        <Text style={styles.filterLabel}>Categories:</Text>
        <FlatList
          data={[{ id: null, name: "All" }, ...categories]}
          horizontal
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <Text
              style={[
                styles.categoryItem,
                selectedCategory === item.id
                  ? styles.categoryItemSelected
                  : null,
              ]}
              onPress={() => setSelectedCategory(item.id)}
            >
              {item.id === null ? "All" : item.name}
            </Text>
          )}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryList}
        />
      </View>
      <TextInput
        style={styles.search}
        placeholder="Search products..."
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholderTextColor="#888"
      />
      {loading ? (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#3498db" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      ) : products.length > 0 ? (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <ProductCard product={item} onAddToCart={() => addToCart(item)} />
          )}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.2}
          ListFooterComponent={
            isLoadingMore ? (
              <ActivityIndicator
                size="small"
                color="#3498db"
                style={{ marginVertical: 16 }}
              />
            ) : null
          }
        />
      ) : (
        <View style={styles.emptyResultsContainer}>
          <Text style={styles.emptyResultsText}>No products found.</Text>
        </View>
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
  search: {
    height: 44,
    borderColor: "#e0e0e0",
    borderWidth: 1,
    paddingHorizontal: 16,
    marginBottom: 14,
    borderRadius: 22,
    backgroundColor: "#fff",
    fontSize: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 2,
  },
  filterContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  filterLabel: {
    fontWeight: "bold",
    marginRight: 10,
    fontSize: 15,
  },
  categoryList: {
    flexDirection: "row",
  },
  categoryItem: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 18,
    backgroundColor: "#e0e7ef",
    marginRight: 8,
    fontSize: 15,
    color: "#333",
    overflow: "hidden",
  },
  categoryItemSelected: {
    backgroundColor: "#3498db",
    color: "#fff",
  },
  list: {
    paddingBottom: 20,
  },
  error: {
    color: "red",
    textAlign: "center",
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
  emptyResultsContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyResultsText: {
    fontSize: 16,
    color: "#555",
  },
  loadingOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default HomeScreen;
