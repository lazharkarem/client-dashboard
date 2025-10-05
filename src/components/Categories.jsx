import React, { useState, useEffect, useCallback, memo, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCategories } from "../store/slices/categorie";
import { Link, useNavigate } from "react-router-dom";
import SubCategory from "./SubCategory";

// Constants for better maintainability
const CONSTANTS = {
  HOVER_DELAY: 200,
  TRANSITION_DURATION: 500,
  AUTO_SLIDE_INTERVAL: 8000,
  TOUCH_THRESHOLD: 50,
  BREAKPOINTS: {
    MOBILE:100,
    TABLET: 1024,
    DESKTOP: 1280
  }
};

// Loading skeleton component with enhanced animation
const CategorySkeleton = memo(() => (
  <div className="w-full py-4">
    <div className="w-full ">
      <div className="flex justify-center ">
        {[...Array(5)].map((_, index) => (
          <div
            key={index}
            className="flex-shrink-0 group"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="w-40 sm:w-48 lg:w-56 h-48 bg-gradient-to-br from-gray-100 via-gray-50 to-gray-100 rounded-3xl overflow-hidden relative">
              {/* Shimmer effect */}
              <div className=" bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse transform -skew-x-12" 
                   style={{ animation: 'shimmer 2s infinite' }} />
              
              {/* Content placeholder */}
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-sm">
                <div className="h-4 bg-gray-200 rounded-md mb-2 animate-pulse" />
                <div className="h-3 bg-gray-150 rounded-md w-2/3 animate-pulse" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
));

CategorySkeleton.displayName = 'CategorySkeleton';

// Enhanced error state component
const CategoryError = memo(({ onRetry }) => (
  <div className="w-full py-16">
    <div className="max-w-md mx-auto text-center px-4">
      <div className="relative mb-8">
        {/* Error icon with modern styling */}
        <div className="w-20 h-20 mx-auto bg-gradient-to-br from-red-50 to-red-100 rounded-2xl flex items-center justify-center shadow-lg">
          <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.081 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        {/* Decorative elements */}
        <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-100 rounded-full opacity-60"></div>
        <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-red-50 rounded-full opacity-80"></div>
      </div>
      
      <h3 className="text-2xl font-bold text-gray-900 mb-3">
        Oups ! Quelque chose s'est mal passé
      </h3>
      <p className="text-gray-600 mb-8 leading-relaxed">
        Impossible de charger les catégories. Vérifiez votre connexion internet et réessayez.
      </p>
      
      <button
        onClick={onRetry}
        className="group inline-flex items-center px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl hover:from-blue-700 hover:to-blue-800 focus:ring-4 focus:ring-blue-200 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
      >
        <svg className="w-4 h-4 mr-2 group-hover:rotate-180 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        Réessayer
      </button>
    </div>
  </div>
));

CategoryError.displayName = 'CategoryError';

// Premium navigation button component
const NavButton = memo(({ direction, onClick, disabled, isVisible }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className={`
      absolute top-1/2 -translate-y-1/2 z-30
      w-14 h-14 rounded-2xl 
      bg-white/95 backdrop-blur-lg border border-white/20 shadow-2xl
      flex items-center justify-center
      hover:bg-white hover:scale-110 hover:shadow-3xl hover:border-blue-200/30
      active:scale-95
      focus:outline-none focus:ring-4 focus:ring-blue-200/50
      transition-all duration-300 ease-out
      disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100
      ${direction === 'prev' ? '-left-7' : '-right-7'}
      ${isVisible ? 'translate-x-0 opacity-100' : direction === 'prev' ? '-translate-x-6 opacity-0' : 'translate-x-6 opacity-0'}
    `}
    style={{
      backdropFilter: 'blur(20px)',
      background: 'rgba(255, 255, 255, 0.95)',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.2)',
    }}
    aria-label={direction === 'prev' ? 'Catégories précédentes' : 'Catégories suivantes'}
  >
    <svg 
      className={`w-6 h-6 text-gray-700 transition-all duration-200 group-hover:text-blue-600 ${
        direction === 'prev' ? 'rotate-180' : ''
      }`}
      fill="none" 
      stroke="currentColor" 
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  </button>
));

NavButton.displayName = 'NavButton';

// Premium category card component
const CategoryCard = memo(({ 
  category, 
  onMouseEnter, 
  onMouseLeave, 
  onClick,
  isVisible = true,
  index = 0 
}) => {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleImageLoad = useCallback(() => {
    setIsLoading(false);
  }, []);

  const handleImageError = useCallback(() => {
    setImageError(true);
    setIsLoading(false);
  }, []);

  const imageUrl = `https://tn360-lqd25ixbvq-ew.a.run.app/uploads/${category.picture}`;
  const truncatedTitle = category.title.length > 20 
    ? `${category.title.slice(0, 20)}...` 
    : category.title;

  return (
    <article
      className={`
        group relative flex-shrink-0 cursor-pointer
        w-40 h-28 sm:w-48  lg:w-56 lg:h-28 rounded-3xl overflow-hidden
        transform transition-all duration-700 ease-out
        hover:scale-105 hover:-translate-y-3 hover:rotate-1
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
        bg-white border border-gray-100/50 shadow-lg hover:shadow-2xl
      `}
      style={{ 
        transitionDelay: `${index * 100}ms`,
        background: !imageError ? `linear-gradient(135deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.3) 100%), url(${imageUrl})` : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        boxShadow: '0 10px 20px -10px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.1)',
      }}
      onMouseEnter={() => onMouseEnter(category.id, category.title)}
      onMouseLeave={onMouseLeave}
      onClick={() => onClick(category)}
      role="button"
      tabIndex={0}
      aria-label={`Catégorie ${category.title}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick(category);
        }
      }}
    >
      {/* Loading state with enhanced animation */}
      {isLoading && (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-100 via-gray-50 to-gray-100 flex items-center justify-center">
          <div className="w-8 h-8 border-3 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
        </div>
      )}

      {/* Error fallback with modern design */}
      {imageError && (
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col items-center justify-center">
          <div className="text-slate-400 text-center">
            <div className="w-16 h-16 mx-auto mb-3 bg-slate-200 rounded-2xl flex items-center justify-center">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="text-sm font-medium">Image indisponible</p>
          </div>
        </div>
      )}

      {/* Hidden image for loading detection */}
      {!imageError && (
        <img
          src={imageUrl}
          alt={category.title}
          className="hidden"
          onLoad={handleImageLoad}
          onError={handleImageError}
        />
      )}

      {/* Enhanced gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent group-hover:from-black/60 transition-all duration-500" />
      
      {/* Premium hover overlay with color shift */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 via-purple-500/0 to-pink-500/0 group-hover:from-blue-500/20 group-hover:via-purple-500/10 group-hover:to-pink-500/20 transition-all duration-700" />

      {/* Floating particles effect on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <div className="absolute top-4 right-4 w-1 h-1 bg-white rounded-full animate-ping" style={{ animationDelay: '0s' }}></div>
        <div className="absolute top-8 left-6 w-1 h-1 bg-blue-200 rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></div>
        <div className="absolute bottom-16 right-8 w-1 h-1 bg-purple-200 rounded-full animate-ping" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Content with improved typography */}
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <div className="bg-white/95 backdrop-blur-lg rounded-2xl px-4 py-3 transform translate-y-0 group-hover:-translate-y-2 transition-all duration-500 shadow-lg border border-white/20">
          <h3 className="text-sm sm:text-base font-bold text-gray-800 leading-tight text-center group-hover:text-gray-900 transition-colors">
            {truncatedTitle}
          </h3>
          {/* Subtle category indicator */}
          <div className="mt-1 flex justify-center">
            <div className="w-8 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full opacity-60 group-hover:opacity-100 transition-opacity"></div>
          </div>
        </div>
      </div>

      {/* Enhanced selection indicator */}
      <div className="absolute top-4 right-4 w-3 h-3 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full opacity-0 group-hover:opacity-100 transform scale-0 group-hover:scale-100 transition-all duration-300 shadow-lg" />
      
      {/* Corner accent */}
      <div className="absolute top-0 right-0 w-8 h-8 bg-gradient-to-br from-white/20 to-transparent rounded-bl-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </article>
  );
});

CategoryCard.displayName = 'CategoryCard';

// Enhanced dots indicator
const DotsIndicator = memo(({ currentIndex, totalSlides, onDotClick }) => (
  <div className="flex justify-center mt-8 space-x-3">
    {[...Array(totalSlides)].map((_, index) => (
      <button
        key={index}
        onClick={() => onDotClick(index)}
        className={`
          relative transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-400/50 rounded-full
          ${currentIndex === index 
            ? 'w-8 h-3 bg-gradient-to-r from-blue-500 to-blue-600 shadow-lg' 
            : 'w-3 h-3 bg-gray-300 hover:bg-gray-400 hover:scale-125'
          }
          rounded-full
        `}
        style={{
          borderRadius: currentIndex === index ? '12px' : '50%'
        }}
        aria-label={`Aller au groupe ${index + 1}`}
      >
        {currentIndex === index && (
          <div className="absolute inset-0 bg-white/30 rounded-full animate-pulse"></div>
        )}
      </button>
    ))}
  </div>
));

DotsIndicator.displayName = 'DotsIndicator';

const Categories = () => {
  const { categories = [], loading, error } = useSelector((state) => state.categorie);
  const [subCategory, setSubCategory] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerRow, setItemsPerRow] = useState(5);
  const [showSubCategory, setShowSubCategory] = useState(false);
  const [categoryTitle, setCategoryTitle] = useState("");
  const [isHovered, setIsHovered] = useState(false);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const hoverTimeoutRef = useRef(null);
  const autoSlideTimeoutRef = useRef(null);
  const containerRef = useRef(null);

  // Responsive items calculation
  const getItemsPerRow = useCallback(() => {
    const width = window.innerWidth;
    if (width < CONSTANTS.BREAKPOINTS.MOBILE) return 1;
    if (width < CONSTANTS.BREAKPOINTS.TABLET) return 2;
    if (width < CONSTANTS.BREAKPOINTS.DESKTOP) return 3;
    return 4;
  }, []);

  // Update items per row on resize
  useEffect(() => {
    const updateItemsPerRow = () => {
      setItemsPerRow(getItemsPerRow());
    };

    updateItemsPerRow();
    const handleResize = () => {
      updateItemsPerRow();
      setCurrentIndex(0);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [getItemsPerRow]);

  // Fetch categories
  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  // Filter and group categories
  const filteredCategories = React.useMemo(() => {
    return categories.filter(
      (category) => category.parent_id === 0 && category.id !== 1
    );
  }, [categories]);

  const slides = React.useMemo(() => {
    return filteredCategories.reduce((acc, category, index) => {
      const slideIndex = Math.floor(index / itemsPerRow);
      if (!acc[slideIndex]) {
        acc[slideIndex] = [];
      }
      acc[slideIndex].push(category);
      return acc;
    }, []);
  }, [filteredCategories, itemsPerRow]);

  // Navigation functions
  const prevSlide = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
    setTimeout(() => setIsTransitioning(false), 500);
  }, [slides.length, isTransitioning]);

  const nextSlide = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    setTimeout(() => setIsTransitioning(false), 500);
  }, [slides.length, isTransitioning]);

  const goToSlide = useCallback((index) => {
    if (isTransitioning || currentIndex === index) return;
    setIsTransitioning(true);
    setCurrentIndex(index);
    setTimeout(() => setIsTransitioning(false), 500);
  }, [currentIndex, isTransitioning]);

  // Auto-slide functionality
  useEffect(() => {
    if (slides.length <= 1 || isHovered || showSubCategory) return;

    autoSlideTimeoutRef.current = setTimeout(() => {
      nextSlide();
    }, CONSTANTS.AUTO_SLIDE_INTERVAL);

    return () => {
      if (autoSlideTimeoutRef.current) {
        clearTimeout(autoSlideTimeoutRef.current);
      }
    };
  }, [currentIndex, slides.length, isHovered, showSubCategory, nextSlide]);

  // Touch handling
  const handleTouchStart = useCallback((e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  }, []);

  const handleTouchMove = useCallback((e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > CONSTANTS.TOUCH_THRESHOLD;
    const isRightSwipe = distance < -CONSTANTS.TOUCH_THRESHOLD;

    if (isLeftSwipe) nextSlide();
    if (isRightSwipe) prevSlide();
  }, [touchStart, touchEnd, nextSlide, prevSlide]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (event) => {
      if (showSubCategory) return;

      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault();
          prevSlide();
          break;
        case 'ArrowRight':
          event.preventDefault();
          nextSlide();
          break;
        case 'Home':
          event.preventDefault();
          goToSlide(0);
          break;
        case 'End':
          event.preventDefault();
          goToSlide(slides.length - 1);
          break;
        case 'Escape':
          if (showSubCategory) {
            setShowSubCategory(false);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [prevSlide, nextSlide, goToSlide, slides.length, showSubCategory]);

  // Enhanced hover handlers
  const handleMouseEnter = useCallback((id, title) => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }

    const subcategories = categories.filter((category) => category.parent_id === id);
    if (subcategories.length > 0) {
      setSubCategory(subcategories);
      setCategoryTitle(title);
      setShowSubCategory(true);
    }
  }, [categories]);

  const handleMouseLeave = useCallback(() => {
    hoverTimeoutRef.current = setTimeout(() => {
      setShowSubCategory(false);
    }, CONSTANTS.HOVER_DELAY);
  }, []);

  const clearHoverTimeout = useCallback(() => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
  }, []);

  // Category click handler
  const handleCategoryClick = useCallback((category) => {
    navigate(`/category/${category.id}/${category.title}`);
  }, [navigate]);

  // Retry handler
  const handleRetry = useCallback(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  // Loading state
  if (loading) {
    return (
      <section className="w-full bg-gradient-to-br from-gray-50 via-white to-gray-50" aria-label="Catégories en cours de chargement">
        <CategorySkeleton />
      </section>
    );
  }

  // Error state
  if (error) {
    return (
      <section className="w-full bg-gradient-to-br from-gray-50 via-white to-gray-50" aria-label="Erreur de chargement des catégories">
        <CategoryError onRetry={handleRetry} />
      </section>
    );
  }

  // Empty state
  if (filteredCategories.length === 0) {
    return (
      <section className="w-full py-20 bg-gradient-to-br from-gray-50 via-white to-gray-50" aria-label="Aucune catégorie disponible">
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Aucune catégorie disponible</h3>
          <p className="text-gray-600">Les catégories seront bientôt disponibles.</p>
        </div>
      </section>
    );
  }

  return (
    <section 
      className="w-full relative bg-gradient-to-br from-gray-50/50 via-white to-blue-50/30 py-4"
      aria-label="Navigation des catégories"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      ref={containerRef}
    >
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-100/30 to-purple-100/30 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-pink-100/30 to-yellow-100/30 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>
      </div>

      {/* Main carousel */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative px-8">
          {/* Slides container */}
          <div className="overflow-hidden rounded-3xl">
            {slides.map((slide, slideIndex) => (
              <div
                key={slideIndex}
                className={`
                  transition-all duration-700 ease-out
                  ${currentIndex === slideIndex ? 'block opacity-100' : 'hidden opacity-0'}
                `}
                role="tabpanel"
                aria-label={`Groupe de catégories ${slideIndex + 1} sur ${slides.length}`}
              >
                <div className="flex justify-center gap-6 py-8">
                  {slide.map((category, index) => (
                    <CategoryCard
                      key={category.id}
                      category={category}
                      onMouseEnter={handleMouseEnter}
                      onMouseLeave={handleMouseLeave}
                      onClick={handleCategoryClick}
                      isVisible={currentIndex === slideIndex}
                      index={index}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Navigation buttons */}
          {slides.length > 1 && (
            <>
              <NavButton 
                direction="prev" 
                onClick={prevSlide}
                disabled={isTransitioning}
                isVisible={isHovered}
              />
              <NavButton 
                direction="next" 
                onClick={nextSlide}
                disabled={isTransitioning}
                isVisible={isHovered}
              />
            </>
          )}
        </div>

        {/* Dots indicator */}
        {slides.length > 1 && (
          <DotsIndicator
            currentIndex={currentIndex}
            totalSlides={slides.length}
            onDotClick={goToSlide}
          />
        )}

        {/* Enhanced subcategories panel */}
        <div 
          className={`
            transition-all duration-700 ease-out transform
            ${showSubCategory 
              ? 'opacity-100 translate-y-0 max-h-96 scale-100' 
              : 'opacity-0 -translate-y-8 max-h-0 scale-95'
            }
            overflow-hidden
          `}
          onMouseEnter={clearHoverTimeout}
          onMouseLeave={handleMouseLeave}
        >
          {showSubCategory && subCategory.length > 0 && (
            <div className="mt-3 mx-4 p-6 bg-white/90 backdrop-blur-xl rounded-2xl border border-white/20 shadow-xl">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-transparent to-purple-50/30 rounded-2xl"></div>
              <div className="relative">
                <SubCategory 
                  data={subCategory} 
                  categorie={categoryTitle}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Screen reader announcements */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {slides.length > 0 && `Groupe ${currentIndex + 1} sur ${slides.length} affiché`}
        {showSubCategory && `Sous-catégories de ${categoryTitle} affichées`}
      </div>

      {/* Keyboard shortcuts help */}
      <div className="sr-only">
        Raccourcis : Flèches pour naviguer, Échap pour fermer les sous-catégories, 
        Début/Fin pour premier/dernier groupe
      </div>

      {/* Custom styles for animations */}
      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%) skewX(-12deg); }
          100% { transform: translateX(300%) skewX(-12deg); }
        }
      `}</style>
    </section>
  );
};

export default memo(Categories);