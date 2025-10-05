import { useEffect, useState, useCallback, useMemo } from "react";
import { getPopularProducts } from "../services/api";
import { FaHeart, FaShoppingCart, FaEye, FaSearch, FaFilter } from "react-icons/fa";
import toast from "react-hot-toast";

function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [favorites, setFavorites] = useState([]);

  // Charger les favoris depuis localStorage au démarrage
  useEffect(() => {
    const savedFavorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    setFavorites(savedFavorites);
  }, []);

  // Fonction pour récupérer les produits avec gestion d'erreur améliorée
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getPopularProducts();
      
      // Validation des données reçues
      if (!Array.isArray(data)) {
        throw new Error("Format de données invalide");
      }
      
      setProducts(data);
    } catch (error) {
      console.error("Erreur lors de la récupération des produits:", error);
      setError(error.message || "Impossible de charger les produits");
      toast.error("Erreur lors du chargement des produits");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Fonction de filtrage et tri avec mémoisation
  const filteredAndSortedProducts = useMemo(() => {
    let filtered = products.filter(product =>
      product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Tri des produits
    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      // Gestion spéciale pour le prix (conversion en nombre)
      if (sortBy === 'price') {
        aValue = parseFloat(aValue) || 0;
        bValue = parseFloat(bValue) || 0;
      }

      // Gestion spéciale pour les chaînes
      if (typeof aValue === 'string') {
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
  }, [products, searchTerm, sortBy, sortOrder]);

  // Gestion des favoris
  const toggleFavorite = useCallback((productId) => {
    setFavorites(prev => {
      const newFavorites = prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId];
      
      localStorage.setItem('favorites', JSON.stringify(newFavorites));
      
      const isAdding = !prev.includes(productId);
      toast.success(
        isAdding ? "Ajouté aux favoris" : "Retiré des favoris",
        { duration: 2000 }
      );
      
      return newFavorites;
    });
  }, []);

  // Fonction pour ajouter au panier (simulée)
  const addToCart = useCallback((product) => {
    // Ici vous pourriez implémenter la vraie logique d'ajout au panier
    toast.success(`${product.name} ajouté au panier!`);
  }, []);

  // Fonction pour voir les détails
  const viewDetails = useCallback((product) => {
    // Navigation vers la page de détails du produit
    console.log("Voir détails:", product);
    toast.info("Redirection vers les détails...");
  }, []);

  // Fonction de retry en cas d'erreur
  const handleRetry = useCallback(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Composant ProductCard pour éviter la répétition
  const ProductCard = ({ product }) => {
    const isFavorite = favorites.includes(product.id);
    const formattedPrice = typeof product.price === 'number' 
      ? product.price.toFixed(2) 
      : parseFloat(product.price || 0).toFixed(2);

    return (
      <div className="group bg-white border border-gray-200 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden">
        {/* Image placeholder ou vraie image si disponible */}
        <div className="relative h-48 bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
          ) : null}
          <div className="flex items-center justify-center w-full h-full text-gray-400">
            <FaEye size={32} />
          </div>
          
          {/* Badge de favoris */}
          <button
            onClick={() => toggleFavorite(product.id)}
            className={`absolute top-3 right-3 p-2 rounded-full transition-all duration-200 ${
              isFavorite
                ? "bg-red-500 text-white scale-110"
                : "bg-white/80 text-gray-600 hover:bg-red-500 hover:text-white"
            }`}
            aria-label={isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
          >
            <FaHeart size={14} />
          </button>
        </div>

        {/* Contenu de la carte */}
        <div className="p-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">
            {product.name || "Produit sans nom"}
          </h2>
          
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {product.description || "Aucune description disponible"}
          </p>
          
          <div className="flex items-center justify-between mb-4">
            <span className="text-2xl font-bold text-green-600">
              {formattedPrice} DT
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-sm text-gray-400 line-through">
                {parseFloat(product.originalPrice).toFixed(2)} DT
              </span>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={() => addToCart(product)}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center justify-center gap-2"
            >
              <FaShoppingCart size={14} />
              Ajouter
            </button>
            
            <button
              onClick={() => viewDetails(product)}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 px-3 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center justify-center gap-2"
            >
              <FaEye size={14} />
              Voir
            </button>
          </div>
        </div>
      </div>
    );
  };

  // États de chargement
  if (loading) {
    return (
      <div className="p-4 max-w-7xl mx-auto">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement des produits populaires...</p>
          </div>
        </div>
      </div>
    );
  }

  // État d'erreur
  if (error) {
    return (
      <div className="p-4 max-w-7xl mx-auto">
        <div className="text-center py-12">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Oops! Une erreur est survenue</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={handleRetry}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-7xl mx-auto">
      {/* En-tête avec titre et stats */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Produits Populaires</h1>
            <p className="text-gray-600 mt-1">
              {filteredAndSortedProducts.length} produit{filteredAndSortedProducts.length !== 1 ? 's' : ''} 
              {searchTerm && ` trouvé${filteredAndSortedProducts.length !== 1 ? 's' : ''} pour "${searchTerm}"`}
            </p>
          </div>
          
          {favorites.length > 0 && (
            <div className="text-sm text-gray-500 flex items-center gap-2">
              <FaHeart className="text-red-500" />
              {favorites.length} favori{favorites.length !== 1 ? 's' : ''}
            </div>
          )}
        </div>
      </div>

      {/* Barre de recherche et filtres */}
      <div className="mb-6 bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Recherche */}
          <div className="flex-1 relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher des produits..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            )}
          </div>

          {/* Tri */}
          <div className="flex gap-3">
            <div className="flex items-center gap-2">
              <FaFilter className="text-gray-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="name">Nom</option>
                <option value="price">Prix</option>
              </select>
            </div>

            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="asc">Croissant</option>
              <option value="desc">Décroissant</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grille des produits */}
      {filteredAndSortedProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredAndSortedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucun produit trouvé</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm 
              ? `Aucun produit ne correspond à votre recherche "${searchTerm}"`
              : "Il semble qu'il n'y ait aucun produit disponible pour le moment."
            }
          </p>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="text-green-600 hover:text-green-700 font-medium"
            >
              Effacer la recherche
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default Products;