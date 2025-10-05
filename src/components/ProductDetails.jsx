import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { fetchProductById } from "../store/slices/product";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import { FaPlus, FaMinus, FaShoppingCart, FaHeart, FaArrowLeft } from "react-icons/fa";

const ProductDetails = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  console.log({id})
  // Validation et extraction sécurisée du subId
  const subId = location.state?.subId || null;
  
  const { product = {}, loading, error } = useSelector((state) => state.product);

  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  // Vérification si le produit est éligible à la remise
  const isDiscountEligible = useMemo(() => {
    const eligibleSubIds = [2, 3];
    return subId && eligibleSubIds.includes(Number(subId));
  }, [subId]);

  // Calculs des prix avec mémoisation
  const priceCalculations = useMemo(() => {
    const basePrice = product.price || 0;
    const totalPrice = (basePrice * quantity).toFixed(2);
    const discountedPrice = isDiscountEligible 
      ? (totalPrice * 0.9).toFixed(2) 
      : totalPrice;
    
    return { basePrice, totalPrice, discountedPrice };
  }, [product.price, quantity, isDiscountEligible]);

  // Chargement initial du produit
  useEffect(() => {
    if (id && (!product.id || product.id !== Number(id))) {
      dispatch(fetchProductById(id));
    }
  }, [dispatch, id, product.id]);

  // Vérification si le produit est déjà en favoris (simulation)
  useEffect(() => {
    if (product.id) {
      const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
      setIsFavorite(favorites.includes(product.id));
    }
  }, [product.id]);

  // Handlers avec useCallback pour éviter les re-renders inutiles
  const handleQuantityChange = useCallback((delta) => {
    setQuantity(prev => {
      const newQuantity = prev + delta;
      return newQuantity < 1 ? 1 : newQuantity > 99 ? 99 : newQuantity;
    });
  }, []);

  const handleQuantityInput = useCallback((e) => {
    const value = parseInt(e.target.value) || 1;
    setQuantity(value < 1 ? 1 : value > 99 ? 99 : value);
  }, []);

  const addToCart = useCallback(async () => {
    if (quantity <= 0) {
      toast.error("Quantité invalide");
      return;
    }

    if (!product.id) {
      toast.error("Produit non disponible");
      return;
    }

    setIsAddingToCart(true);
    
    try {
      const cart = JSON.parse(Cookies.get("cart") || "[]");
      const finalPrice = parseFloat(priceCalculations.discountedPrice);
      
      const newItem = {
        id: product.id,
        name: product.name,
        image: product.img,
        unitPrice: product.price,
        finalPrice: finalPrice / quantity, // Prix unitaire après remise
        quantity,
        total: finalPrice,
        addedAt: new Date().toISOString(),
        hasDiscount: isDiscountEligible
      };

      const existingIndex = cart.findIndex((item) => item.id === product.id);
      
      if (existingIndex !== -1) {
        // Mise à jour de l'item existant
        cart[existingIndex].quantity += quantity;
        cart[existingIndex].total = (
          parseFloat(cart[existingIndex].total) + finalPrice
        ).toFixed(2);
      } else {
        cart.push(newItem);
      }

      Cookies.set("cart", JSON.stringify(cart), { expires: 7 });
      toast.success(`${quantity} ${quantity > 1 ? 'produits ajoutés' : 'produit ajouté'} au panier !`);
      
      // Navigation après un court délai pour permettre à l'utilisateur de voir le toast
      setTimeout(() => navigate("/cart-shopping"), 1000);
      
    } catch (error) {
      console.error("Erreur lors de l'ajout au panier:", error);
      toast.error("Erreur lors de l'ajout au panier");
    } finally {
      setIsAddingToCart(false);
    }
  }, [quantity, product, priceCalculations.discountedPrice, isDiscountEligible, navigate]);

  const toggleFavorite = useCallback(() => {
    if (!product.id) return;
    
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    const newFavorites = isFavorite
      ? favorites.filter(id => id !== product.id)
      : [...favorites, product.id];
    
    localStorage.setItem('favorites', JSON.stringify(newFavorites));
    setIsFavorite(!isFavorite);
    
    toast.success(
      isFavorite ? "Retiré des favoris" : "Ajouté aux favoris",
      { duration: 2000 }
    );
  }, [product.id, isFavorite]);

  const goBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  // États de chargement et d'erreur
  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-2 py-6">
        <div className="flex justify-center items-center min-h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          <span className="ml-3 text-gray-600">Chargement du produit...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto px-2 py-6">
        <div className="text-center">
          <div className="text-red-500 text-lg mb-4">❌ {error}</div>
          <button
            onClick={goBack}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
          >
            Retour
          </button>
        </div>
      </div>
    );
  }

  if (!product.id) {
    return (
      <div className="max-w-6xl mx-auto px-2 py-6">
        <div className="text-center">
          <div className="text-gray-500 text-lg mb-4">Produit non trouvé</div>
          <button
            onClick={goBack}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
          >
            Retour
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-2 py-12">
      {/* Bouton retour */}
      <button
        onClick={goBack}
        className="flex items-center gap-2 mb-3 text-gray-600 hover:text-gray-800 transition"
      >
        <FaArrowLeft />
        <span>Retour</span>
      </button>

      <div className="grid grid-cols-2  gap-6 bg-white shadow-xl rounded-2xl p-2">
        {/* Section Image */}
        <div className="flex justify-center items-center">
          <div className="relative group">
            <img
              src={`https://tn360-lqd25ixbvq-ew.a.run.app/uploads/${product.img}`}
              alt={product.name || 'Produit'}
              className="w-full max-w-sm  h-full object-contain rounded-xl transform transition-all duration-300 group-hover:scale-105 shadow-lg"
              onError={(e) => {
                e.target.src = '/placeholder-image.jpg'; // Image de fallback
                e.target.onerror = null;
              }}
            />
            {isDiscountEligible && (
              <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                -10%
              </div>
            )}
          </div>
        </div>

        {/* Section Informations */}
        <div className="flex flex-col justify-between space-y-6">
          <div>
            <h1 className="text-xl font-bold text-gray-900 mb-4">
              {product.name}
            </h1>
            
            {product.description && (
              <p className="text-gray-600 text-sm lg:text-lg leading-relaxed mb-6">
                {product.description}
              </p>
            )}

            {/* Section Prix */}
            <div className="bg-gray-50 p-1 rounded-lg mb-6">
              <div className="flex items-baseline gap-4">
                {isDiscountEligible ? (
                  <>
                    <span className="line-through text-gray-400 text-sm lg:text-lg">
                      {priceCalculations.totalPrice} DT
                    </span>
                    <span className="text-sm lg:text-lg font-bold text-blue-360">
                      {priceCalculations.discountedPrice} DT
                    </span>
                    <span className="bg-orange-360 p-1 rounded-md text-sm font-medium">
                      Économie: {(priceCalculations.totalPrice - priceCalculations.discountedPrice).toFixed(2)} DT
                    </span>
                  </>
                ) : (
                  <span className="text-3xl font-bold text-blue-360">
                    {priceCalculations.totalPrice} DT
                  </span>
                )}
              </div>
              {priceCalculations.basePrice > 0 && (
                <div className="text-sm text-gray-500 mt-2">
                  Prix unitaire: {Number(priceCalculations.basePrice).toFixed(2)} DT
                </div>
              )}
            </div>
          </div>

          {/* Section Actions */}
          <div className="space-y-4">
            {/* Sélecteur de quantité */}
            <div className="flex items-center gap-4">
              <label className="font-medium text-gray-700">Quantité:</label>
              <div className="flex items-center border-2 border-gray-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  aria-label="Diminuer la quantité"
                >
                  <FaMinus />
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={handleQuantityInput}
                  min="1"
                  max="99"
                  className="w-16 text-center py-2 font-medium bg-white border-0 focus:outline-none"
                />
                <button
                  onClick={() => handleQuantityChange(1)}
                  disabled={quantity >= 99}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  aria-label="Augmenter la quantité"
                >
                  <FaPlus />
                </button>
              </div>
            </div>

            {/* Boutons d'action */}
            <div className="flex gap-4">
              <button
                onClick={addToCart}
                disabled={isAddingToCart || quantity <= 0}
                className={`flex-grow flex items-center justify-center gap-1 px-2 py-1 rounded-lg font-semibold text-white transition-all duration-200 ${
                  isAddingToCart || quantity <= 0
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-360 hover:scale-105 hover:shadow-lg active:scale-95"
                }`}
              >
                <FaShoppingCart className={isAddingToCart ? "animate-bounce" : ""} />
                {isAddingToCart ? "Ajout en cours..." : "Ajouter au panier"}
              </button>

              <button
                onClick={toggleFavorite}
                className={`p-3 rounded-lg transition-all duration-200 ${
                  isFavorite
                    ? "bg-red-500 text-white shadow-lg scale-105"
                    : "bg-gray-100 text-gray-600 hover:bg-red-500 hover:text-white hover:scale-105"
                }`}
                aria-label={isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
              >
                <FaHeart />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;