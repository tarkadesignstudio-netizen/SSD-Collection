import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ProductGrid from '../components/ProductGrid';
import { collection, getDocs } from "firebase/firestore";
import { db } from "../database/firebase";
import type { Product } from '../data/products';
import type { Category, Domain } from '../data/categories';
import { SearchX } from 'lucide-react';
import FilterPopover from '../components/FilterPopover';
import HeroBanner from '../components/HeroBanner';
import CategoryShowcase, { type ShowcaseItem } from '../components/CategoryShowcase';
import CuratedForYou from '../components/CuratedForYou';
import TestimonialSection from '../components/TestimonialSection';
import ProductModal from '../components/ProductModal';

const Home: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const searchQuery = searchParams.get('search') || '';
  const isViewAll = searchParams.get('view') === 'all';
  const categoryFilter = searchParams.get('category');
  
  // Modal state for CuratedForYou since ProductGrid handles its own modal
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false); 
  
  // Filter States
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [availability, setAvailability] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');
  
  const [domains, setDomains] = useState<Domain[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsSnapshot, categoriesSnapshot, domainsSnapshot] = await Promise.all([
          getDocs(collection(db, "products")),
          getDocs(collection(db, "categories")),
          getDocs(collection(db, "domains"))
        ]);
        
        const fetchedProducts = productsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Product[];
        
        const fetchedCategoriesData = categoriesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Category[];
        
        const fetchedDomainsData = domainsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Domain[];
        
        setDomains(fetchedDomainsData);
        setCategories(fetchedCategoriesData);
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

  const handleClearFilters = () => {
    setMinPrice('');
    setMaxPrice('');
    setAvailability('all');
    setSortBy('newest');
    if (searchQuery) {
      navigate('/');
    }
  };

  const showcaseItems: ShowcaseItem[] = useMemo(() => {
    let baseItems = domains.length > 0 ? domains : categories;
    
    // Filter out "bottle" or "bottles" category
    baseItems = baseItems.filter(item => {
      const name = item.name.toLowerCase();
      return name !== 'bottle' && name !== 'bottles';
    });

    const finalItems = baseItems.map(item => {
      const count = products.filter(p => p.domain === item.name || p.category === item.name).length;
      return {
        id: item.id || item.name,
        name: item.name,
        image: item.image || '',
        count
      };
    });

    // Swap 'Perfumes' and 'Schooling' so that Schooling gets the featured large card
    const perfumesIndex = finalItems.findIndex(i => i.name.toLowerCase() === 'perfumes' || i.name.toLowerCase() === 'perfume');
    const schoolingIndex = finalItems.findIndex(i => i.name.toLowerCase() === 'schooling');

    if (perfumesIndex !== -1 && schoolingIndex !== -1) {
      const temp = finalItems[perfumesIndex];
      finalItems[perfumesIndex] = finalItems[schoolingIndex];
      finalItems[schoolingIndex] = temp;
    }

    return finalItems;
  }, [domains, categories, products]);

  const processedProducts = useMemo(() => {
    let result = products.filter(p => !p.hidden);

    // Category Filter (from URL param)
    if (categoryFilter && categoryFilter !== 'All') {
      result = result.filter(p => p.category === categoryFilter || p.domain === categoryFilter);
    }

    // Global Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(p => 
        (p.name?.toLowerCase().includes(q)) ||
        (p.category?.toLowerCase().includes(q)) ||
        (p.domain?.toLowerCase().includes(q)) ||
        (p.description?.toLowerCase().includes(q))
      );
    }

    // Price
    if (minPrice && !isNaN(Number(minPrice))) {
      result = result.filter(p => (p.sellingPrice || p.price || 0) >= Number(minPrice));
    }
    if (maxPrice && !isNaN(Number(maxPrice))) {
      result = result.filter(p => (p.sellingPrice || p.price || 0) <= Number(maxPrice));
    }

    // Availability
    if (availability === 'in_stock') {
      result = result.filter(p => !p.outOfStock);
    } else if (availability === 'out_of_stock') {
      result = result.filter(p => p.outOfStock);
    }

    // Sort
    result.sort((a, b) => {
      const priceA = a.sellingPrice || a.price || 0;
      const priceB = b.sellingPrice || b.price || 0;
      const dateA = a.createdAt?.seconds || 0;
      const dateB = b.createdAt?.seconds || 0;
      const nameA = a.name?.toLowerCase() || '';
      const nameB = b.name?.toLowerCase() || '';

      switch(sortBy) {
        case 'price_asc': return priceA - priceB;
        case 'price_desc': return priceB - priceA;
        case 'newest': return dateB - dateA;
        case 'oldest': return dateA - dateB;
        case 'alpha_asc': return nameA.localeCompare(nameB);
        case 'alpha_desc': return nameB.localeCompare(nameA);
        default: return 0;
      }
    });

    return result;
  }, [products, searchQuery, minPrice, maxPrice, availability, sortBy, categoryFilter]);

  const hasActiveFilters = Boolean(minPrice || maxPrice || availability !== 'all' || sortBy !== 'newest' || searchQuery || categoryFilter);
  const showFullListing = isViewAll || hasActiveFilters;

  return (
    <div className="flex flex-col min-h-screen bg-transparent">
      {/* Hero Banner Section (Hidden if there is an active search to prevent distraction from search results) */}
      {!searchQuery && <HeroBanner />}

      <main 
        className="flex-1 w-full pb-12 min-h-[500px] bg-fixed bg-center bg-cover bg-no-repeat relative"
        style={{ backgroundImage: `url('/parallax_bg.png')` }}
      >
        <div className="flex flex-col gap-6 md:gap-16 pt-6 md:pt-16 max-w-screen-2xl mx-auto px-2 sm:px-4 md:px-8">
          
          {/* Category Showcase (Only shown if no search query) */}
          {!searchQuery && (
            <div className="bg-[#FFF5F7]/95 rounded-[2.5rem] shadow-xl overflow-hidden backdrop-blur-sm border border-white/60">
              <CategoryShowcase items={showcaseItems} />
            </div>
          )}

          {/* Curated For You Section (Default view if no filters and not view all) */}
          {!showFullListing && !isLoading && !error && (
            <div className="bg-[#FFF5F7]/95 rounded-[2.5rem] shadow-xl overflow-hidden backdrop-blur-sm border border-white/60">
              <CuratedForYou
                products={products}
                categories={categories}
                domains={domains}
                onProductClick={(product) => {
                  setSelectedProduct(product);
                  setIsModalOpen(true);
                }}
              />
            </div>
          )}

          {/* Testimonial Section (Default view if no filters and not view all) */}
          {!showFullListing && !isLoading && !error && (
            <div className="bg-[#FFF5F7]/95 rounded-[2.5rem] shadow-xl overflow-hidden backdrop-blur-sm border border-white/60">
              <TestimonialSection />
            </div>
          )}

          {/* Action Bar & Product Grid (Shown only if view all or filters applied) */}
          {showFullListing && (
            <div className="bg-[#FFF5F7]/95 rounded-[2.5rem] shadow-xl overflow-hidden backdrop-blur-sm border border-white/60 py-8 md:py-12">
              <div className="px-4 md:px-8 max-w-7xl mx-auto mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex flex-col">
                {(searchQuery || isViewAll) && (
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl md:text-2xl font-bold text-[#2B2B2B]">
                      {searchQuery 
                        ? `Search results for "${searchQuery}"` 
                        : categoryFilter && categoryFilter !== 'All' 
                          ? `${categoryFilter} Products` 
                          : "All Products"
                      }
                    </h2>
                    <button 
                      onClick={() => navigate('/')}
                      className="text-[#E75480] hover:text-[#d8406c] text-sm font-medium transition-colors"
                    >
                      {searchQuery ? "Clear Search" : "Back to Curated"}
                    </button>
                  </div>
                )}
              </div>

              <div className="flex-shrink-0 ml-auto md:ml-0">
                <FilterPopover
                  minPrice={minPrice}
                  setMinPrice={setMinPrice}
                  maxPrice={maxPrice}
                  setMaxPrice={setMaxPrice}
                  availability={availability}
                  setAvailability={setAvailability}
                  sortBy={sortBy}
                  setSortBy={setSortBy}
                  onClear={handleClearFilters}
                  showClearButton={hasActiveFilters}
                />
              </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 md:px-8">
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
              ) : processedProducts.length === 0 ? (
                <div className="w-full flex flex-col items-center justify-center py-20 px-4 text-center">
                  <div className="bg-white p-6 rounded-full shadow-sm border border-[#F3D6DC] mb-4">
                    <SearchX className="w-12 h-12 text-[#E75480] opacity-80" />
                  </div>
                  <h3 className="text-xl font-bold text-[#2B2B2B] mb-2">No products found</h3>
                  <p className="text-[#7A7A7A] max-w-sm mb-6">
                    We couldn't find any products matching your search or filter criteria. Try adjusting your filters.
                  </p>
                  <button 
                    onClick={handleClearFilters}
                    className="px-6 py-2.5 bg-gradient-to-r from-[#F48CA8] to-[#E75480] text-white font-medium rounded-full shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all"
                  >
                    Clear All Filters
                  </button>
                </div>
              ) : (
                <ProductGrid products={processedProducts} />
              )}
            </div>
          </div>
        )}
        </div>
      </main>

      {/* Shared Product Modal for CuratedForYou section */}
      {selectedProduct && (
        <ProductModal 
          key={`curated-${selectedProduct.id}`}
          product={selectedProduct}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
};

export default Home;
