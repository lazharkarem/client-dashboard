import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import PropTypes from 'prop-types';

import { fetchUserProfile, updateUserProfile } from "../store/slices/user";
import jackpotImage from "../assets/jackpotImage.png";
import levelUp from "../assets/levelup.png";
import SuperDeals from "../assets/superdeals.png";

// Constants
const API_BASE_URL = "https://tn360-lqd25ixbvq-ew.a.run.app";
const DEFAULT_AVATAR = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQZXNuwvzjUvZEQzX5xm0TJllYkRjXwOUlirQ&s";

const FORM_FIELDS = [
  { label: "Nom et Prénom", name: "nom_et_prenom", type: "text", required: true },
  { label: "Email", name: "email", type: "email", required: true },
  { label: "Téléphone", name: "tel", type: "tel", required: false },
  { label: "Date de naissance", name: "date_de_naissance", type: "date", required: false },
  { label: "Adresse", name: "address", type: "text", required: false },
];

const PROFILE_ACTIONS = [
  { icon: jackpotImage, label: "Jackpot", key: "cagnotte_balance" },
  { icon: levelUp, label: "Level Up", key: null },
  { icon: SuperDeals, label: "Super Deals", key: null, action: "/MesDeals" },
];

// Utility Functions
const formatFieldValue = (value, fieldName) => {
  if (!value) return "Non renseigné";
  
  if (fieldName === "date_de_naissance") {
    return new Date(value).toLocaleDateString("fr-FR");
  }
  
  return value;
};

const validateForm = (formData) => {
  const errors = {};
  
  FORM_FIELDS.forEach(field => {
    if (field.required && !formData[field.name]?.trim()) {
      errors[field.name] = `${field.label} est requis`;
    }
    
    if (field.name === "email" && formData[field.name]) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData[field.name])) {
        errors[field.name] = "Format d'email invalide";
      }
    }
  });
  
  return errors;
};

// Sub-components
const ProfileAvatar = ({ imageUrl, name, email }) => (
  <div className="flex flex-col items-center text-center md:w-1/3 -mt-16">
    <img
      src={imageUrl ? `${API_BASE_URL}/uploads/${imageUrl}` : DEFAULT_AVATAR}
      alt={`Photo de profil de ${name || 'utilisateur'}`}
      className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 rounded-full object-cover shadow-lg border-4 border-white"
      onError={(e) => { e.target.src = DEFAULT_AVATAR; }}
      loading="lazy"
    />
    <h1 className="mt-4 text-xl font-semibold text-gray-800">{name || "Nom non renseigné"}</h1>
    <p className="text-gray-600">{email || "Email non renseigné"}</p>
  </div>
);

ProfileAvatar.propTypes = {
  imageUrl: PropTypes.string,
  name: PropTypes.string,
  email: PropTypes.string,
};

const ProfileActions = ({ userProfile, onActionClick }) => (
  <div className="grid grid-cols-3 gap-4 sm:gap-6 justify-items-center md:justify-start">
    {PROFILE_ACTIONS.map((item, index) => (
      <div
        key={`${item.label}-${index}`}
        className="flex flex-col items-center cursor-pointer transform hover:scale-105 transition-transform duration-200"
        onClick={() => item.action && onActionClick(item.action)}
        role={item.action ? "button" : "presentation"}
        tabIndex={item.action ? 0 : -1}
        onKeyDown={(e) => {
          if (item.action && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            onActionClick(item.action);
          }
        }}
      >
        <div
          className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl shadow-md bg-cover bg-center flex items-end justify-center"
          style={{ backgroundImage: `url(${item.icon})` }}
        >
          {item.key && userProfile?.[item.key] && (
            <p className="text-white font-bold text-sm bg-black/50 px-2 py-1 rounded">
              {userProfile[item.key]}
            </p>
          )}
        </div>
        <p className="mt-2 text-sm font-medium text-gray-700">{item.label}</p>
      </div>
    ))}
  </div>
);

ProfileActions.propTypes = {
  userProfile: PropTypes.object,
  onActionClick: PropTypes.func.isRequired,
};

const FormField = ({ field, value, onChange, error }) => (
  <div className="flex flex-col bg-gray-50 p-4 rounded-xl shadow-sm border border-gray-200">
    <label 
      htmlFor={field.name} 
      className="text-gray-700 font-medium mb-1"
    >
      {field.label}
      {field.required && <span className="text-red-500 ml-1">*</span>}
    </label>
    <input
      id={field.name}
      name={field.name}
      value={value}
      onChange={onChange}
      type={field.type}
      required={field.required}
      className={`px-3 py-2 rounded-md border transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
        error ? 'border-red-500 bg-red-50' : 'border-gray-300'
      }`}
      aria-describedby={error ? `${field.name}-error` : undefined}
    />
    {error && (
      <span id={`${field.name}-error`} className="text-red-500 text-sm mt-1">
        {error}
      </span>
    )}
  </div>
);

FormField.propTypes = {
  field: PropTypes.object.isRequired,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  error: PropTypes.string,
};

const ProfileInfoField = ({ label, value, fieldName }) => (
  <div className="flex flex-col bg-gray-50 p-4 rounded-xl shadow-sm border border-gray-200">
    <span className="text-gray-700 font-medium mb-1">{label}</span>
    <span className="text-gray-900">{formatFieldValue(value, fieldName)}</span>
  </div>
);

ProfileInfoField.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.string,
  fieldName: PropTypes.string.isRequired,
};

// Main Component
const Profile = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { Userprofile: userProfile, loading, error } = useSelector((state) => state.user);

  const [formData, setFormData] = useState({
    nom_et_prenom: "",
    email: "",
    tel: "",
    date_de_naissance: "",
    profession: "",
    situation_familiale: "",
    address: "",
    image: "",
  });

  const [isEditing, setIsEditing] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form data when user profile is loaded
  useEffect(() => {
    if (userProfile) {
      const initialFormData = Object.keys(formData).reduce((acc, key) => {
        acc[key] = userProfile[key] || "";
        return acc;
      }, {});
      setFormData(initialFormData);
    }
  }, [userProfile]);

  // Fetch user profile on component mount
  useEffect(() => {
    dispatch(fetchUserProfile());
  }, [dispatch]);

  // Handlers
  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field if it exists
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: null }));
    }
  }, [formErrors]);

  const handleEditToggle = useCallback(() => {
    setIsEditing(prev => !prev);
    setFormErrors({});
  }, []);

  const handleActionClick = useCallback((action) => {
    navigate(action);
  }, [navigate]);

  const handleFormSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    const errors = validateForm(formData);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsSubmitting(true);
    try {
      await dispatch(updateUserProfile(formData)).unwrap();
      await dispatch(fetchUserProfile()).unwrap();
      setIsEditing(false);
      setFormErrors({});
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil:', error);
      setFormErrors({ submit: 'Erreur lors de la mise à jour. Veuillez réessayer.' });
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, dispatch]);

  // Memoized values
  const profileImageUrl = useMemo(() => 
    userProfile?.image ? `${API_BASE_URL}/uploads/${userProfile.image}` : DEFAULT_AVATAR
  , [userProfile?.image]);

  const displayFields = useMemo(() => [
    { label: "Nom et Prénom", value: formData?.nom_et_prenom, fieldName: "nom_et_prenom" },
    { label: "Email", value: formData?.email, fieldName: "email" },
    { label: "Téléphone", value: formData?.tel, fieldName: "tel" },
    { label: "Adresse", value: formData?.address, fieldName: "address" },
    { label: "Date de naissance", value: formData?.date_de_naissance, fieldName: "date_de_naissance" },
  ], [formData]);

  if (loading && !userProfile) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement du profil...</p>
        </div>
      </div>
    );
  }

  if (error && !userProfile) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center bg-white p-8 rounded-lg shadow-lg">
          <p className="text-red-500 mb-4">Erreur lors du chargement du profil</p>
          <button 
            onClick={() => dispatch(fetchUserProfile())}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-gray-50">
      {/* Decorative Header */}
      <header className="relative h-64 md:h-96 w-full bg-gradient-to-tr from-blue-360 to-orange-360 overflow-hidden">
        <div className="absolute inset-0" aria-hidden="true">
          <span className="absolute w-32 h-32 bottom-20 -left-10 rounded-full bg-white/10"></span>
          <span className="absolute w-24 h-24 bottom-28 -right-10 rounded-full bg-white/20"></span>
          <span className="absolute w-20 h-20 bottom-52 left-1/3 rounded-full bg-white/15"></span>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-5xl mx-auto -mt-32 px-4 md:px-0">
        <div className="bg-white shadow-xl rounded-3xl p-6 md:p-10 flex flex-col md:flex-row md:items-start gap-6 relative">
          
          {/* Profile Avatar */}
          <ProfileAvatar 
            imageUrl={userProfile?.image}
            name={userProfile?.nom_et_prenom}
            email={userProfile?.email}
          />

          {/* Profile Content */}
          <div className="flex-1 flex flex-col md:pl-8 gap-6">
            
            {/* Profile Actions */}
            <ProfileActions 
              userProfile={userProfile}
              onActionClick={handleActionClick}
            />

            {/* Update Button */}
            {!isEditing && (
              <div className="flex justify-center md:justify-end mt-4">
                <button
                  onClick={handleEditToggle}
                  className="bg-blue-360 text-white font-semibold px-6 py-2 rounded-lg shadow hover:scale-105 transition-transform duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Mettre à jour le profil
                </button>
              </div>
            )}

            {/* Personal Information Section */}
            <section className="mt-4">
              <h2 className="text-blue-360 text-lg font-bold mb-4">
                Informations personnelles
              </h2>

              {isEditing ? (
                <form onSubmit={handleFormSubmit} className="space-y-4">
                  {formErrors.submit && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                      {formErrors.submit}
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {FORM_FIELDS.map((field) => (
                      <FormField
                        key={field.name}
                        field={field}
                        value={formData[field.name]}
                        onChange={handleInputChange}
                        error={formErrors[field.name]}
                      />
                    ))}
                  </div>

                  <div className="flex gap-4 justify-end mt-6">
                    <button
                      type="button"
                      onClick={handleEditToggle}
                      disabled={isSubmitting}
                      className="bg-gray-500 text-white font-bold px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors duration-200 disabled:opacity-50"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="bg-blue-360 text-white font-bold px-6 py-2 rounded-lg hover:bg-blue-500 transition-colors duration-200 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {isSubmitting ? 'Sauvegarde...' : 'Sauvegarder'}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {displayFields.map((field, index) => (
                    <ProfileInfoField
                      key={`${field.fieldName}-${index}`}
                      label={field.label}
                      value={field.value}
                      fieldName={field.fieldName}
                    />
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;