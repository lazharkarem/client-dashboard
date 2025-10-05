import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllProduct } from "../store/slices/product.js";
import { useNavigate } from "react-router-dom";
import { FaStar, FaGift, FaTimes, FaEye, FaChevronLeft, FaChevronRight, FaSearch, FaFilter, FaSortAmountUp, FaSortAmountDown } from "react-icons/fa";
import toast from "react-hot-toast";

const DISCOUNT_OPTIONS = [5, 10, 15, 20, 25, 30, 50];
const PRODUCTS_PER_PAGE_OPTIONS = [8, 16, 24, 32];

const Catalogue = () => {
  const { product = {}, loading, error } = useSelector((state) => state.product);
  const allProducts = product.products || [];
  
  // États pour la roue de la fortune
  const [showWheel, setShowWheel] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [discount, setDiscount] = useState(null);
  const [discountExpiry, setDiscountExpiry] = useState(null);
  
  // États pour la pagination et le filtrage
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage, setProductsPerPage] = useState(8);
  const [searchTerm, setSearchTerm] = useState("");
  const [showSearchFilters, setShowSearchFilters] = useState(false);
  const [showPriceSort, setShowPriceSort] = useState(false);
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [priceRange, setPriceRange] = useState({ min: 0, max: Infinity });
  
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Chargement des données et récupération de la remise sauvegardée
  useEffect(() => {
    dispatch(fetchAllProduct());
    
    // Récupérer la remise sauvegardée
    const savedDiscount = localStorage.getItem('wheelDiscount');
    const savedExpiry = localStorage.getItem('discountExpiry');
    
    if (savedDiscount && savedExpiry) {
      const now = new Date().getTime();
      if (now < parseInt(savedExpiry)) {
        setDiscount(parseInt(savedDiscount));
        setDiscountExpiry(parseInt(savedExpiry));
      } else {
        localStorage.removeItem('wheelDiscount');
        localStorage.removeItem('discountExpiry');
      }
    }
  }, [dispatch]);

  // Calcul de la plage de prix des produits
  const priceStats = useMemo(() => {
    if (allProducts.length === 0) return { min: 0, max: 100 };
    
    const prices = allProducts.map(p => parseFloat(p.price) || 0);
    return {
      min: Math.floor(Math.min(...prices)),
      max: Math.ceil(Math.max(...prices))
    };
  }, [allProducts]);

  // Initialiser la plage de prix
  useEffect(() => {
    if (priceRange.max === Infinity && priceStats.max > 0) {
      setPriceRange({ min: priceStats.min, max: priceStats.max });
    }
  }, [priceStats, priceRange.max]);

  // Filtrage et tri des produits
  const filteredAndSortedProducts = useMemo(() => {
    let filtered = allProducts.filter(product => {
      const matchesSearch = product.name?.toLowerCase().includes(searchTerm.toLowerCase());
      const price = parseFloat(product.price) || 0;
      const matchesPrice = price >= priceRange.min && price <= priceRange.max;
      return matchesSearch && matchesPrice;
    });

    // Tri
    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      if (sortBy === 'price') {
        aValue = parseFloat(aValue) || 0;
        bValue = parseFloat(bValue) || 0;
      } else if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [allProducts, searchTerm, sortBy, sortOrder, priceRange]);

  // Calculs pour la pagination
  const totalPages = Math.ceil(filteredAndSortedProducts.length / productsPerPage);
  const startIndex = (currentPage - 1) * productsPerPage;
  const currentProducts = filteredAndSortedProducts.slice(startIndex, startIndex + productsPerPage);

  // Réinitialiser la page lors du changement de filtres
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortBy, sortOrder, priceRange, productsPerPage]);

  // Fonction pour tourner la roue
  const spinWheel = useCallback(() => {
    if (spinning) return;

    setSpinning(true);
    const randomDiscount = DISCOUNT_OPTIONS[Math.floor(Math.random() * DISCOUNT_OPTIONS.length)];
    const randomIndex = DISCOUNT_OPTIONS.indexOf(randomDiscount);
    const newRotation = 3600 + randomIndex * (360 / DISCOUNT_OPTIONS.length);

    setRotation(newRotation);
    
    setTimeout(() => {
      setSpinning(false);
      setDiscount(randomDiscount);
      
      // Sauvegarder la remise avec une expiration de 24h
      const expiry = new Date().getTime() + 24 * 60 * 60 * 1000;
      setDiscountExpiry(expiry);
      localStorage.setItem('wheelDiscount', randomDiscount.toString());
      localStorage.setItem('discountExpiry', expiry.toString());
      
      setShowWheel(false);
      toast.success(`🎉 Félicitations ! Vous avez gagné ${randomDiscount}% de réduction !`, {
        duration: 5000
      });
    }, 4000);
  }, [spinning]);

  // Fonction pour naviguer vers les détails du produit
  const handleViewProduct = useCallback((productId) => {
    const state = discount ? { subId: 2 } : {}; // subId pour appliquer la remise
    navigate(`/product/${productId}`, { state });
  }, [navigate, discount]);

  // Fonctions de pagination
  const handlePageChange = useCallback((newPage) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Calcul du prix avec remise
  const getDiscountedPrice = useCallback((originalPrice) => {
    if (!discount) return null;
    return (originalPrice * (1 - discount / 100)).toFixed(2);
  }, [discount]);

  // Formatage du temps restant pour la remise
  const getTimeRemaining = useCallback(() => {
    if (!discountExpiry) return null;
    
    const now = new Date().getTime();
    const timeLeft = discountExpiry - now;
    
    if (timeLeft <= 0) return null;
    
    const hours = Math.floor(timeLeft / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m`;
  }, [discountExpiry]);

  // Fonction pour trier par prix
  const handlePriceSort = useCallback((order) => {
    setSortBy('price');
    setSortOrder(order);
    setShowPriceSort(false);
  }, []);

  // Composant de la roue de la fortune
  const WheelModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl text-center max-w-md w-full p-8 relative">
        <button
          onClick={() => setShowWheel(false)}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 lg:text-lg sm:text-sm"
        >
          <FaTimes />
        </button>
        
        <h2 className="lg:text-lg sm:text-sm font-bold mb-3 text-gray-800">
          🎰 Roue de la Fortune
        </h2>
        
        <div className="flex justify-center mb-3">
          <div
            className="relative border-8 border-yellow-400 rounded-full shadow-lg"
            style={{
              width: "280px",
              height: "280px",
              background: `conic-gradient(
                #ff6b6b 0 51.4deg,
                #ffd93d 51.4deg 102.8deg,
                #6bcf7f 102.8deg 154.2deg,
                #4ecdc4 154.2deg 205.6deg,
                #45b7d1 205.6deg 257deg,
                #96ceb4 257deg 308.4deg,
                #ffeaa7 308.4deg 360deg
              )`,
              transform: `rotate(${rotation}deg)`,
              transition: spinning ? "transform 4s cubic-bezier(0.23, 1, 0.32, 1)" : "none",
            }}
          >
            {/* Segments avec pourcentages */}
            <div className="absolute inset-0">
              {DISCOUNT_OPTIONS.map((discount, index) => (
                <div
                  key={discount}
                  className="absolute text-white font-bold text-lg"
                  style={{
                    top: "50%",
                    left: "50%",
                    transform: `translate(-50%, -50%) rotate(${index * (360 / DISCOUNT_OPTIONS.length) + 25}deg) translateY(-80px)`,
                  }}
                >
                  {discount}%
                </div>
              ))}
            </div>
            
            {/* Flèche indicatrice */}
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <div className="w-0 h-0 border-l-6 border-l-transparent border-r-6 border-r-transparent border-b-12 border-b-red-600"></div>
            </div>
          </div>
        </div>
        
        <button
          onClick={spinWheel}
          disabled={spinning}
          className={`px-8 py-3   rounded-full font-semibold text-white  sm:text-sm lg:text-lg transition-all duration-200 ${
            spinning
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 transform hover:scale-105"
          }`}
        >
          {spinning ? "🎲 En rotation..." : "🎯 Tourner la roue"}
        </button>
        
        <p className="text-sm text-gray-600 mt-2">
          Gagnez jusqu'à 50% de réduction sur vos achats !
        </p>
      </div>
    </div>
  );

  // États de chargement et d'erreur
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="lg:text-lg sm:text-sm text-gray-600">Chargement du catalogue...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-2">⚠️</div>
          <h2 className="lg:text-lg sm:text-sm font-bold text-gray-900 mb-2">Erreur de chargement</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => dispatch(fetchAllProduct())}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  const timeRemaining = getTimeRemaining();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-2 py-6">
        {/* En-tête */}
        <div className="flex flex-row  lg:items-center lg:justify-between gap-6 mb-8">
          <div>
            <h1 className="lg:text-2xl sm:text-xl font-bold text-gray-900 mb-2">
              🛍️ Notre Catalogue
            </h1>
            <p className="text-gray-600 text-sm ">
              Découvrez {allProducts.length} produits exceptionnels
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            {discount && timeRemaining && (
              <div className="bg-orange-360 text-white px-1  rounded-lg flex items-center gap-1">
                <FaGift />
                <span className="font-semibold text-sm">{discount}% de réduction active ({timeRemaining})</span>
                
              </div>
            )}
            
            <button
              onClick={() => setShowWheel(true)}
              className="bg-blue-360 hover:to-pink-700 text-white px-6 py-2 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 flex items-center gap-2 text-sm"
            >
              <FaGift />
              {discount ? "Nouvelle chance !" : "Jouer pour gagner !"}
            </button>
          </div>
        </div>

        {/* Barre de filtres avec boutons */}
        <div className="bg-white rounded-xl shadow-sm border p-4 mb-6">
          <div className="flex flex-wrap items-center gap-3">
            {/* Bouton Recherche */}
            <div className="relative">
              <button
                onClick={() => setShowSearchFilters(!showSearchFilters)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 font-medium transition-all duration-200 ${
                  showSearchFilters || searchTerm
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                }`}
              >
                <FaSearch />
                <span>Rechercher</span>
                {searchTerm && (
                  <span className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs">
                    {filteredAndSortedProducts.length}
                  </span>
                )}
              </button>
            </div>

            {/* Bouton Tri par Prix */}
            <div className="relative">
              <button
                onClick={() => setShowPriceSort(!showPriceSort)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 font-medium transition-all duration-200 ${
                  sortBy === 'price'
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                }`}
              >
                {sortBy === 'price' && sortOrder === 'asc' ? <FaSortAmountUp /> : <FaSortAmountDown />}
                <span>Prix</span>
                {sortBy === 'price' && (
                  <span className="text-xs">
                    {sortOrder === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </button>

              {/* Menu déroulant pour le tri par prix */}
              {showPriceSort && (
                <div className="absolute top-full left-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 z-10 min-w-40">
                  <button
                    onClick={() => handlePriceSort('asc')}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-2 border-b border-gray-100"
                  >
                    <FaSortAmountUp className="text-green-600" />
                    <span>Croissant</span>
                  </button>
                  <button
                    onClick={() => handlePriceSort('desc')}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-2"
                  >
                    <FaSortAmountDown className="text-red-600" />
                    <span>Décroissant</span>
                  </button>
                </div>
              )}
            </div>

            {/* Produits par page */}
            <select
              value={productsPerPage}
              onChange={(e) => setProductsPerPage(Number(e.target.value))}
              className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
            >
              {PRODUCTS_PER_PAGE_OPTIONS.map(option => (
                <option key={option} value={option}>{option} par page</option>
              ))}
            </select>

            {/* Bouton Reset */}
            {(searchTerm || sortBy === 'price' || priceRange.min > priceStats.min || priceRange.max < priceStats.max) && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setSortBy("name");
                  setSortOrder("asc");
                  setPriceRange({ min: priceStats.min, max: priceStats.max });
                  setShowSearchFilters(false);
                  setShowPriceSort(false);
                }}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <FaTimes />
                Réinitialiser
              </button>
            )}
          </div>

          {/* Panel de recherche */}
          {showSearchFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Champ de recherche */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rechercher un produit
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Tapez le nom du produit..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pl-10"
                    />
                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    {searchTerm && (
                      <button
                        onClick={() => setSearchTerm("")}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        <FaTimes />
                      </button>
                    )}
                  </div>
                </div>

                {/* Filtre de prix */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    prix ({priceRange.min} DT- {priceRange.max === Infinity ? priceStats.max : priceRange.max} DT)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Prix min"
                      value={priceRange.min}
                      onChange={(e) => setPriceRange(prev => ({ ...prev, min: Number(e.target.value) || 0 }))}
                      className="w-1/2 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="number"
                      placeholder="Prix max"
                      value={priceRange.max === Infinity ? '' : priceRange.max}
                      onChange={(e) => setPriceRange(prev => ({ ...prev, max: Number(e.target.value) || Infinity }))}
                      className="w-1/2 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Résultats */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              <span className="font-semibold">{filteredAndSortedProducts.length}</span> produit{filteredAndSortedProducts.length !== 1 ? 's' : ''} trouvé{filteredAndSortedProducts.length !== 1 ? 's' : ''}
              {searchTerm && ` pour "${searchTerm}"`}
            </p>
          </div>
        </div>

        {/* Grille des produits */}
        {currentProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-12">
            {currentProducts.map((product) => {
              const originalPrice = parseFloat(product.price) || 0;
              const discountedPrice = getDiscountedPrice(originalPrice);

              return (
                <div
                  key={product.id}
                  className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group"
                >
                  {/* Image du produit */}
                  <div className="relative h-32 bg-gray-100 overflow-hidden">
                  <img
                      src={`https://tn360-lqd25ixbvq-ew.a.run.app/uploads/${product.img}`}
                      alt={product.name}
                      className="w-full h-32 object-cover group-hover:scale-110 transition-transform duration-300"
                      onError={(e) => {
                        e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMDAgMTAwTDEwMCAxMDBaIiBzdHJva2U9IiM5Q0E0QUYiIHN0cm9rZS13aWR0aD0iMiIvPgo8L3N2Zz4=';
                      }}
                    />
                    
                    {discount && (
                      <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded-full text-sm font-bold">
                        -{discount}%
                      </div>
                    )}
                  </div>

                  {/* Contenu de la carte */}
                  <div className="p-2">
                    <h3 className="font-medium text-gray-900 mb-2 line-clamp-2">
                      {product.name}
                    </h3>
                    
                    {/* Prix */}
                    <div className="mb-4">
                      {discountedPrice ? (
                        <div className="flex items-center gap-2">
                          <span className="line-through text-gray-400 text-sm">
                            {originalPrice.toFixed(2)}DT
                          </span>
                          <span className="text-md font-bold text-green-600">
                            {discountedPrice}DT
                          </span>
                        </div>
                      ) : (
                        <span className="text-md font-bold text-gray-900">
                          {originalPrice.toFixed(2)}DT
                        </span>
                      )}
                    </div>

                    {/* Bouton d'action */}
                    <button
                      onClick={() => handleViewProduct(product.id)}
                      className="w-full bg-blue-360 hover:to-purple-700 text-white py-1 px-1 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-2"
                    >
                      <FaEye />
                      Voir détails
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-gray-400 text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">Aucun produit trouvé</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              {searchTerm 
                ? `Aucun produit ne correspond à votre recherche "${searchTerm}"`
                : "Essayez d'ajuster vos filtres pour voir plus de produits."
              }
            </p>
            <button
              onClick={() => {
                setSearchTerm("");
                setPriceRange({ min: priceStats.min, max: priceStats.max });
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Effacer les filtres
            </button>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-gray-600">
              Affichage de {startIndex + 1} à {Math.min(startIndex + productsPerPage, filteredAndSortedProducts.length)} sur {filteredAndSortedProducts.length} produits
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  currentPage === 1
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                }`}
              >
                <FaChevronLeft />
                Précédent
              </button>

              <div className="flex gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = i + 1;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`px-3 py-2 rounded-lg font-medium transition-colors ${
                        currentPage === pageNum
                          ? "bg-blue-600 text-white"
                          : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  currentPage === totalPages
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                }`}
              >
                Suivant
                <FaChevronRight />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal de la roue */}
      {showWheel && <WheelModal />}
    </div>
  );
};

export default Catalogue;