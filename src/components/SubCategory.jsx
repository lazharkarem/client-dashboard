import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const SubCategory = ({ data }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedSubCategory, setSelectedSubCategory] = useState(null);
  const [itemsPerRow, setItemsPerRow] = useState(getItemsPerRow());
  const [isPaused, setIsPaused] = useState(false);

  // Mise à jour des items par ligne sur resize
  useEffect(() => {
    const handleResize = () => {
      setItemsPerRow(getItemsPerRow());
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Déterminer le nombre d'items par ligne
  function getItemsPerRow() {
    if (window.innerWidth < 640) return 1; // sm
    if (window.innerWidth < 1024) return 3; // md
    return 4; // lg
  }

  // Organiser les données en slides
  const slides = [];
  for (let i = 0; i < data.length; i += itemsPerRow) {
    slides.push(data.slice(i, i + itemsPerRow));
  }

  // Gestion du clic sur sous-catégorie
  const handleSubCategoryClick = (id, title) => {
    setSelectedSubCategory({ id, title });
  };

  // Navigation vers la page produits
  useEffect(() => {
    if (selectedSubCategory) {
      navigate('/products', {
        state: { subId: selectedSubCategory.id, subTitle: selectedSubCategory.title },
      });
    }
  }, [selectedSubCategory, navigate]);

  // Navigation carrousel
  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  // Auto-slide avec pause
  useEffect(() => {
    if (!isPaused && slides.length > 1) {
      const slideInterval = setInterval(nextSlide, 3000);
      return () => clearInterval(slideInterval);
    }
  }, [currentIndex, isPaused, slides.length]);

  return (
    <div className="container ">
      <div
        className="relative"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Conteneur du carrousel */}
        <div className="aspect-[3/2] sm:aspect-[5/2] lg:aspect-[7/1]  rounded-md">
          {slides.map((subcategoryGroup, slideIndex) => (
            <div
              key={slideIndex}
              className={`absolute inset-0 transition-all duration-500 ease-in-out ${
                currentIndex === slideIndex ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
              } flex justify-center items-start`}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-1.5 sm:gap-3 lg:gap-4">
                {subcategoryGroup.map((subcategory) => (
                  <div
                    key={subcategory.id}
                    className="group relative bg-white dark:bg-gray-800 shadow-sm rounded-md overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
                  >
                    <div className="relative aspect-[4/3] ">
                      <img
                        loading="lazy"
                        className="w-32 h-32 object-cover rounded-t-md group-hover:scale-102 transition-transform duration-400"
                        src={`https://tn360-lqd25ixbvq-ew.a.run.app/uploads/${subcategory.picture}`}
                        srcSet={`
                          https://tn360-lqd25ixbvq-ew.a.run.app/uploads/${subcategory.picture}?
                          https://tn360-lqd25ixbvq-ew.a.run.app/uploads/${subcategory.picture}
                          https://tn360-lqd25ixbvq-ew.a.run.app/uploads/${subcategory.picture}?
                        `}
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 33.33vw, 25vw"
                        alt={`Image de la sous-catégorie ${subcategory.title}`}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-gray-900/40 via-transparent to-transparent opacity-0 group-hover:opacity-50 transition-opacity duration-400 flex items-end p-1.5 sm:p-2">
                        <h3 className="text-white font-semibold text-xs sm:text-sm">
                          {subcategory.title}
                        </h3>
                      </div>
                    </div>
                    <div className="">
                      <button
                        aria-label={`Explorer les produits de ${subcategory.title}`}
                        onClick={() => handleSubCategoryClick(subcategory.id, subcategory.title)}
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md w-32 font-medium text-xs sm:text-sm hover:bg-opacity-90 focus-visible:ring-2 focus-visible:ring-indigo-300 transition"
                      >
                        Explorer
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Boutons de navigation */}
        {slides.length > 1 && (
          <div className="absolute top-1/2 -translate-y-1/2 left-0.5 right-0.5 flex justify-between">
            <button
              onClick={prevSlide}
              aria-label="Diapositive précédente"
              className="bg-gray-900/70 text-white p-1 sm:p-1.5 rounded-full hover:bg-gray-900 focus-visible:ring-2 focus-visible:ring-indigo-300 transition backdrop-blur-sm"
            >
              <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={nextSlide}
              aria-label="Diapositive suivante"
              className="bg-gray-900/70 text-white p-1 sm:p-1.5 rounded-full hover:bg-gray-900 focus-visible:ring-2 focus-visible:ring-indigo-300 transition backdrop-blur-sm"
            >
              <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}

        {/* Indicateurs de diapositive (dots) */}
        {slides.length > 1 && (
          <div className="flex justify-center mt-1.5 sm:mt-2 space-x-1">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                aria-label={`Aller à la diapositive ${index + 1}`}
                className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${
                  currentIndex === index ? 'bg-indigo-600' : 'bg-gray-300'
                } hover:bg-indigo-400 transition`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SubCategory;