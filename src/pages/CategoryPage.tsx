import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../database/firebase';
import ProductGrid from '../components/ProductGrid';
import FilterPopover from '../components/FilterPopover';
import type { Product } from '../data/products';
import type { Category } from '../data/categories';
import { ChevronRight, SearchX, ChevronLeft, LayoutGrid } from 'lucide-react';

const CategoryPage: React.FC = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const decodedCategory = decodeURIComponent(categoryId || '');

  const [products, setProducts] = useState<Product[]>([]);
  const [subCategories, setSubCategories] = useState<Category[]>([]);
  const [bannerImage, setBannerImage] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter States
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [availability, setAvailability] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [activeSubCategory, setActiveSubCategory] = useState<string>('All');

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
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
        
        setProducts(fetchedProducts);

        const fetchedCategoriesData = categoriesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Category[];
        
        // Find subcategories belonging to this domain
        const domainCategories = fetchedCategoriesData.filter(c => c.domain === decodedCategory);
        setSubCategories(domainCategories);

        // Reset active subcategory when changing domains
        setActiveSubCategory('All');

        // Find banner image from either domains or categories matching the name
        let foundImage = '';
        domainsSnapshot.forEach(doc => {
          if (doc.data().name === decodedCategory && doc.data().image) {
            foundImage = doc.data().image;
          }
        });
        if (!foundImage) {
          categoriesSnapshot.forEach(doc => {
            if (doc.data().name === decodedCategory && doc.data().image) {
              foundImage = doc.data().image;
            }
          });
        }

        setBannerImage(foundImage || 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?q=80&w=2071&auto=format&fit=crop'); // Fallback image

      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load category data. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [decodedCategory]);

  const handleClearFilters = () => {
    setMinPrice('');
    setMaxPrice('');
    setAvailability('all');
    setSortBy('newest');
    setActiveSubCategory('All');
  };

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  const carouselItems = useMemo(() => {
    return [
      { id: 'all', name: 'All', image: '' },
      ...subCategories
    ];
  }, [subCategories]);

  const processedProducts = useMemo(() => {
    let result = products.filter(p => !p.hidden && (p.category === decodedCategory || p.domain === decodedCategory));

    // Subcategory Filter
    if (activeSubCategory !== 'All') {
      result = result.filter(p => p.category === activeSubCategory);
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

      switch (sortBy) {
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
  }, [products, decodedCategory, minPrice, maxPrice, availability, sortBy, activeSubCategory]);

  return (
    <div className="flex flex-col min-h-screen bg-transparent">
      {/* Category Hero Banner */}
      <div className="relative w-full h-[40vh] min-h-[300px] flex items-center justify-center">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${bannerImage})` }}
        />
        <div className="absolute inset-0 bg-black/50" />
        
        <div className="relative z-10 text-center px-4">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 drop-shadow-md">
            {decodedCategory}
          </h1>
          
          {/* Breadcrumbs */}
          <nav className="flex items-center justify-center space-x-2 text-sm md:text-base font-medium text-white/90">
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-white">{decodedCategory}</span>
          </nav>
        </div>
      </div>

      <main className="flex-1 w-full mx-auto pb-12 pt-8">
        
        {/* Horizontal Category Carousel */}
        {subCategories.length > 0 && (
          <div className="w-full mb-8">
            <div className="max-w-[1600px] mx-auto px-4 md:px-12 relative group/carousel">
              {/* Left Navigation Arrow */}
              <button 
                onClick={scrollLeft}
                className="absolute left-0 md:left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white rounded-full shadow-md border border-[#F5F5F5] flex items-center justify-center text-[#7A7A7A] hover:text-[#E75480] hover:border-[#F48CA8] transition-all duration-300 opacity-0 group-hover/carousel:opacity-100 hidden sm:flex"
                aria-label="Scroll Left"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              {/* Scrollable Container */}
              <div 
                ref={scrollContainerRef}
                className="flex overflow-x-auto gap-4 sm:gap-8 snap-x hide-scrollbar py-4 sm:py-6"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {carouselItems.map((item) => {
                  const isActive = activeSubCategory === item.name;
                  const isAll = item.name === 'All';

                  return (
                    <div 
                      key={item.id}
                      onClick={() => setActiveSubCategory(item.name)}
                      className="flex flex-col items-center gap-3 snap-start cursor-pointer group flex-shrink-0"
                    >
                      <div 
                        className={`w-16 h-16 sm:w-20 sm:h-20 md:w-[110px] md:h-[110px] rounded-full flex items-center justify-center overflow-hidden border-[2px] md:border-[3px] bg-[#FFF5F7] transition-all duration-300 ${
                          isActive 
                            ? 'border-[#E75480] shadow-[0_4px_16px_rgba(231,84,128,0.3)] -translate-y-1' 
                            : 'border-white shadow-sm group-hover:border-[#F48CA8] group-hover:shadow-[0_8px_20px_rgba(244,140,168,0.25)] group-hover:-translate-y-1 md:group-hover:-translate-y-2'
                        }`}
                      >
                        {isAll ? (
                          <LayoutGrid className={`w-6 h-6 md:w-8 md:h-8 ${isActive ? 'text-[#E75480]' : 'text-[#A0A0A0] group-hover:text-[#F48CA8]'} transition-colors duration-300`} strokeWidth={1.5} />
                        ) : (
                          <img 
                            src={item.image} 
                            alt={item.name} 
                            className={`w-full h-full object-cover transition-transform duration-300 ${isActive ? 'scale-105' : 'group-hover:scale-105'}`}
                            loading="lazy"
                          />
                        )}
                      </div>
                      <span 
                        className={`text-sm md:text-base font-medium transition-colors duration-300 ${
                          isActive 
                            ? 'text-[#E75480]' 
                            : 'text-[#7A7A7A] group-hover:text-[#4A4A4A]'
                        }`}
                      >
                        {item.name}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Right Navigation Arrow */}
              <button 
                onClick={scrollRight}
                className="absolute right-0 md:right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white rounded-full shadow-md border border-[#F5F5F5] flex items-center justify-center text-[#7A7A7A] hover:text-[#E75480] hover:border-[#F48CA8] transition-all duration-300 opacity-0 group-hover/carousel:opacity-100 hidden sm:flex"
                aria-label="Scroll Right"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Action Bar (Filters) */}
        <div className="px-4 md:px-12 max-w-[1600px] mx-auto mb-8 flex justify-end">
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
            showClearButton={Boolean(minPrice || maxPrice || availability !== 'all' || sortBy !== 'newest' || activeSubCategory !== 'All')}
          />
        </div>

        {/* Content */}
        <div className="max-w-[1600px] mx-auto px-4 md:px-12">
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
                We couldn't find any products {activeSubCategory !== 'All' ? `in the ${activeSubCategory} category` : `in the ${decodedCategory} domain`}.
              </p>
              <button 
                onClick={handleClearFilters}
                className="px-6 py-2.5 bg-gradient-to-r from-[#F48CA8] to-[#E75480] text-white font-medium rounded-full shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <ProductGrid products={processedProducts} />
          )}
        </div>
      </main>
    </div>
  );
};

export default CategoryPage;
