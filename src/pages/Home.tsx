import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import CategoryTabs from '../components/CategoryTabs';
import DomainTabs from '../components/DomainTabs';
import ProductGrid from '../components/ProductGrid';
import { collection, getDocs } from "firebase/firestore";
import { db } from "../database/firebase";
import type { Product } from '../data/products';
import type { Category, Domain } from '../data/categories';
import { SearchX } from 'lucide-react';
import FilterPopover from '../components/FilterPopover';

const Home: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const searchQuery = searchParams.get('search') || '';

  const [activeDomain, setActiveDomain] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState('All Products');
  
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

  // Clear Domain/Category filters if global search is used
  useEffect(() => {
    if (searchQuery) {
      setActiveDomain(null);
      setActiveCategory('All Products');
    }
  }, [searchQuery]);

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

  const handleDomainSelect = (domain: string | null) => {
    setActiveDomain(domain);
    setActiveCategory('All Products'); // Reset category filter when domain changes
    if (searchQuery) {
      navigate('/'); // Clear search query when explicitly selecting a domain
    }
  };

  const handleClearFilters = () => {
    setMinPrice('');
    setMaxPrice('');
    setAvailability('all');
    setSortBy('newest');
    setActiveDomain(null);
    setActiveCategory('All Products');
    if (searchQuery) {
      navigate('/');
    }
  };

  const processedProducts = useMemo(() => {
    let result = products.filter(p => !p.hidden);

    // Domain & Category
    if (activeDomain) {
      result = result.filter(p => p.domain === activeDomain || p.category === activeDomain); // fallback for older data
    }
    if (activeCategory !== 'All Products') {
      result = result.filter(p => p.category === activeCategory);
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
  }, [products, activeDomain, activeCategory, searchQuery, minPrice, maxPrice, availability, sortBy]);

  // Get categories belonging to the selected domain
  const filteredCategoriesForDomain = [
    { name: 'All Products', isAll: true },
    ...categories.filter(c => c.domain === activeDomain)
  ];

  return (
    <div className="flex flex-col min-h-screen bg-transparent">
      <main className="flex-1 w-full max-w-7xl mx-auto pb-12 min-h-[500px]">
        
        {/* Domain Selection */}
        <DomainTabs 
          activeDomain={activeDomain}
          onSelectDomain={handleDomainSelect}
          domains={domains}
        />

        {/* Category Selection (only if Domain is selected and no active search) */}
        {activeDomain && !searchQuery && (
          <div className="mb-6 border-b border-[#F3D6DC]/50 pb-2">
            <CategoryTabs 
              activeCategory={activeCategory} 
              onSelectCategory={setActiveCategory}
              categories={filteredCategoriesForDomain}
            />
          </div>
        )}

        {/* Action Bar (Search Header + Filters) */}
        <div className="px-4 md:px-8 mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex flex-col">
            {searchQuery && (
              <div className="flex items-center gap-3">
                <h2 className="text-xl md:text-2xl font-bold text-[#2B2B2B]">
                  Search results for "{searchQuery}"
                </h2>
                <button 
                  onClick={() => navigate('/')}
                  className="text-[#E75480] hover:text-[#d8406c] text-sm font-medium transition-colors"
                >
                  Clear Search
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
              showClearButton={Boolean(minPrice || maxPrice || availability !== 'all' || sortBy !== 'newest' || activeDomain || searchQuery)}
            />
          </div>
        </div>

        {/* Content */}
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
      </main>
    </div>
  );
};

export default Home;
