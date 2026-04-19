import React, { useState, useEffect } from 'react';
import CategoryTabs from '../components/CategoryTabs';
import ProductGrid from '../components/ProductGrid';
import { collection, getDocs } from "firebase/firestore";
import { db } from "../database/firebase";
import type { Product } from '../data/products';
import type { Category } from '../data/categories';

const Home: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('All Products');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsSnapshot, categoriesSnapshot] = await Promise.all([
          getDocs(collection(db, "products")),
          getDocs(collection(db, "categories"))
        ]);
        
        const fetchedProducts = productsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Product[];
        
        const fetchedCategoriesData = categoriesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Category[];
        
        // Add "All Products" to the beginning
        const allProductsCategory: Category = { name: 'All Products', isAll: true };
        setCategories([allProductsCategory, ...fetchedCategoriesData]);
        
        setProducts(fetchedProducts);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to load products. Please check your connection and try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredProducts = activeCategory === 'All Products'
    ? products
    : products.filter((p) => p.category === activeCategory);

  return (
    <div className="flex flex-col min-h-screen bg-transparent">
      <main className="flex-1 w-full max-w-7xl mx-auto pb-12 min-h-[500px]">
        <CategoryTabs 
          activeCategory={activeCategory} 
          onSelectCategory={setActiveCategory}
          categories={categories}
        />
        {isLoading ? (
          <div className="w-full flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E75480]"></div>
          </div>
        ) : error ? (
          <div className="w-full flex justify-center py-20 text-center">
            <div className="bg-red-50 text-red-500 px-6 py-4 rounded-xl max-w-md border border-red-100 shadow-sm">
              <p className="font-medium text-lg mb-2">Oops! Something went wrong.</p>
              <p className="text-sm">{error}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="mt-4 px-4 py-2 bg-white border border-red-200 text-red-600 rounded-lg text-sm hover:bg-red-50 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : (
          <ProductGrid products={filteredProducts} />
        )}
      </main>
    </div>
  );
};

export default Home;
