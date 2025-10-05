import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { loginSuccess } from "../store/slices/authSlice";
import toast from 'react-hot-toast';
import { signUp } from '../store/slices/user';
const Register = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const dispatch =useDispatch();
  const navigate =useNavigate()
  const [userData, setUserData] = useState({
    nom_et_prenom: '',
    tel: '',
    email: '',
    password: '',
    civilite: '',
    dateN: '',
    adresse: '',
    profession: '',
    situation_familiale: '',
    enfants: '',
    nom_enfant_1: '',
    nom_enfant_2: '',
    nom_enfant_3: '',
    nom_enfant_4: '',
  });
  
  const [isAgreed, setIsAgreed] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [show, setShow] = useState(false);
  const [errors, setErrors] = useState({});

  // Validation functions
  const validateStep1 = () => {
    const newErrors = {};
    
    if (!userData.nom_et_prenom.trim()) {
      newErrors.nom_et_prenom = 'Le nom et prénom sont requis';
    }
    
    if (!userData.tel.trim()) {
      newErrors.tel = 'Le téléphone est requis';
    } else if (!/^\d{8}$/.test(userData.tel.trim())) {
      newErrors.tel = 'Le téléphone doit contenir exactement 8 chiffres';
    }
    
    if (!userData.email.trim()) {
      newErrors.email = 'L\'email est requis';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email)) {
      newErrors.email = 'Format d\'email invalide';
    }
    
    if (!userData.password.trim()) {
      newErrors.password = 'Le mot de passe est requis';
    } else if (userData.password.length < 6) {
      newErrors.password = 'Le mot de passe doit contenir au moins 6 caractères';
    }
    
    if (!userData.civilite) {
      newErrors.civilite = 'La civilité est requise';
    }
    
    if (!userData.dateN) {
      newErrors.dateN = 'La date de naissance est requise';
    }
    
    return newErrors;
  };

  const validateStep2 = () => {
    const newErrors = {};
    
    if (!userData.adresse) {
      newErrors.adresse = 'L\'adresse est requise';
    }
    
    if (!userData.profession) {
      newErrors.profession = 'La profession est requise';
    }
    
    if (!userData.situation_familiale) {
      newErrors.situation_familiale = 'La situation familiale est requise';
    }
    
    // Si marié ou divorcé, les enfants sont requis
    if (userData.situation_familiale !== 'Célebataire' && userData.situation_familiale !== '') {
      if (userData.enfants === '') {
        newErrors.enfants = 'Le nombre d\'enfants est requis';
      }
    }
    
    return newErrors;
  };

  const validateStep3 = () => {
    const newErrors = {};
    
    // Validation des noms d'enfants si nécessaire
    if (userData.situation_familiale !== 'Célebataire' && userData.enfants && parseInt(userData.enfants) > 0) {
      for (let i = 1; i <= parseInt(userData.enfants); i++) {
        const enfantField = `nom_enfant_${i}`;
        if (!userData[enfantField]?.trim()) {
          newErrors[enfantField] = `Le nom de l'enfant ${i} est requis`;
        }
      }
    }
    
    if (!isAgreed) {
      newErrors.conditions = 'Vous devez accepter les conditions générales';
    }
    
    return newErrors;
  };

  // Handle input change
  const changeHandler = (e) => {
    const { name, value } = e.target;
    setUserData({ ...userData, [name]: value });
    
    // Clear error for this field
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }

    // Reset enfants when situation changes to Célebataire
    if (name === 'situation_familiale' && value === 'Célebataire') {
      setUserData(prev => ({
        ...prev,
        [name]: value,
        enfants: '',
        nom_enfant_1: '',
        nom_enfant_2: '',
        nom_enfant_3: '',
        nom_enfant_4: ''
      }));
    }
  };

  // Move to the next step
  const handleNextStep = () => {
    let stepErrors = {};
    
    if (currentStep === 1) {
      stepErrors = validateStep1();
    } else if (currentStep === 2) {
      stepErrors = validateStep2();
    }
    
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      return;
    }
    
    setErrors({});
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  // Go back to the previous step
  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setErrors({});
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();  
    dispatch(signUp({ userData, navigate }))
    const step3Errors = validateStep3();
    if (Object.keys(step3Errors).length > 0) {
      setErrors(step3Errors); 
      return;
    }
    
    console.log('Form submitted:', userData);
    
    // Afficher une notification de succès moderne
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transform transition-all duration-300 ease-in-out';
    notification.innerHTML = `
      <div class="flex items-center space-x-2">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
        </svg>
        <span class="font-medium">Inscription réussie !</span>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    // Animation d'entrée
    setTimeout(() => {
      notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Suppression automatique après 4 secondes
    setTimeout(() => {
      notification.style.transform = 'translateX(100%)';
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification);
        }
      }, 300);
    }, 4000);
    
    // Reset form
    setCurrentStep(1);
    setUserData({
      nom_et_prenom: '',
      tel: '',
      email: '',
      password: '',
      civilite: '',
      dateN: '',
      adresse: '',
      profession: '',
      situation_familiale: '',
      enfants: '',
      nom_enfant_1: '',
      nom_enfant_2: '',
      nom_enfant_3: '',
      nom_enfant_4: '',
    });
    setIsAgreed(false);
    setErrors({});
  };

  const handleCheckboxChange = (e) => {
    setIsAgreed(e.target.checked);
    if (errors.conditions) {
      setErrors({ ...errors, conditions: '' });
    }
  };

  const handleShowModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const showHandler = (e) => {
    e.preventDefault();
    setShow(!show);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Progress indicator */}
          <div className="flex justify-center mb-6">
            <div className="flex items-center">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    currentStep >= step ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
                  }`}>
                    {step}
                  </div>
                  {step < 3 && (
                    <div className={`w-16 h-0.5 ${
                      currentStep > step ? 'bg-blue-600' : 'bg-gray-300'
                    }`}></div>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          {/* Step 1 */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <h1 className="text-2xl font-bold text-gray-900 mb-6">
                Inscrivez-vous
              </h1>

              {/* Nom et Prénom */}
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-900">
                  Nom et Prénom *
                </label>
                <input
                  type="text"
                  name="nom_et_prenom"
                  value={userData.nom_et_prenom}
                  className={`w-full p-2.5 border rounded-lg ${errors.nom_et_prenom ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="Nom et Prénom"
                  onChange={changeHandler}
                />
                {errors.nom_et_prenom && <p className="text-red-500 text-xs mt-1">{errors.nom_et_prenom}</p>}
              </div>

              {/* Téléphone */}
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-900">
                  Téléphone *
                </label>
                <input
                  type="text"
                  name="tel"
                  value={userData.tel}
                  className={`w-full p-2.5 border rounded-lg ${errors.tel ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="12345678"
                  maxLength={8}
                  onChange={changeHandler}
                />
                {errors.tel && <p className="text-red-500 text-xs mt-1">{errors.tel}</p>}
              </div>

              {/* Email */}
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-900">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={userData.email}
                  className={`w-full p-2.5 border rounded-lg ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="exemple@email.com"
                  onChange={changeHandler}
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>

              {/* Mot de passe */}
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-900">
                  Mot de passe *
                </label>
                <div className="relative">
                  <input
                    type={show ? "text" : "password"}
                    name="password"
                    value={userData.password}
                    placeholder="••••••••"
                    className={`w-full p-2.5 pr-10 border rounded-lg ${errors.password ? 'border-red-500' : 'border-gray-300'}`}
                    onChange={changeHandler}
                  />
                  <button 
                    type="button"
                    onClick={showHandler}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1"
                  >
                    <i className={`fa-solid ${show ? 'fa-eye' : 'fa-eye-slash'} text-gray-500`}></i>
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
              </div>

              {/* Civilité */}
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-900">
                  Civilité *
                </label>
                <select
                  name="civilite"
                  value={userData.civilite}
                  className={`w-full p-2.5 border rounded-lg ${errors.civilite ? 'border-red-500' : 'border-gray-300'}`}
                  onChange={changeHandler}
                >
                  <option value="">Sélectionner...</option>
                  <option value="Mr">Monsieur</option>
                  <option value="Md">Madame</option>
                  <option value="Mlle">Mademoiselle</option>
                </select>
                {errors.civilite && <p className="text-red-500 text-xs mt-1">{errors.civilite}</p>}
              </div>

              {/* Date de naissance */}
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-900">
                  Date de naissance *
                </label>
                <input
                  type="date"
                  name="dateN"
                  value={userData.dateN}
                  className={`w-full p-2.5 border rounded-lg ${errors.dateN ? 'border-red-500' : 'border-gray-300'}`}
                  onChange={changeHandler}
                />
                {errors.dateN && <p className="text-red-500 text-xs mt-1">{errors.dateN}</p>}
              </div>
            </div>
          )}

          {/* Step 2 */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <h1 className="text-2xl font-bold text-gray-900 mb-6">
                Informations Complémentaires
              </h1>

              {/* Adresse */}
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-900">
                  Adresse *
                </label>
                <select 
                  name="adresse"
                  value={userData.adresse}
                  className={`w-full p-2.5 border rounded-lg ${errors.adresse ? 'border-red-500' : 'border-gray-300'}`}
                  onChange={changeHandler}
                >
                  <option value="">Sélectionner...</option>
                  <option value="ariana">Ariana</option>
                  <option value="beja">Béja</option>
                  <option value="ben arous">Ben Arous</option>
                  <option value="bizerte">Bizerte</option>
                  <option value="gabes">Gabès</option>
                  <option value="gafsa">Gafsa</option>
                  <option value="jendouba">Jendouba</option>
                  <option value="kairouan">Kairouan</option>
                  <option value="kasserine">Kasserine</option>
                  <option value="kebili">Kébili</option>
                  <option value="le kef">Le Kef</option>
                  <option value="mahdia">Mahdia</option>
                  <option value="la mannouba">La Mannouba</option>
                  <option value="medenine">Médenine</option>
                  <option value="monastir">Monastir</option>
                  <option value="nabeul">Nabeul</option>
                  <option value="sfax">Sfax</option>
                  <option value="sidi bouzid">Sidi Bouzid</option>
                  <option value="siliana">Siliana</option>
                  <option value="sousse">Sousse</option>
                  <option value="tataouine">Tataouine</option>
                  <option value="tozeur">Tozeur</option>
                  <option value="tunis">Tunis</option>
                  <option value="zaghouan">Zaghouan</option>
                </select>
                {errors.adresse && <p className="text-red-500 text-xs mt-1">{errors.adresse}</p>}
              </div>

              {/* Profession */}
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-900">
                  Profession *
                </label>
                <select 
                  name="profession"
                  value={userData.profession}
                  className={`w-full p-2.5 border rounded-lg ${errors.profession ? 'border-red-500' : 'border-gray-300'}`}
                  onChange={changeHandler}
                >
                  <option value="">Sélectionner...</option>
                  <option value="Agriculture / Arisans">Agriculture / Arisans</option>
                  <option value="Commerçant">Commerçant</option>
                  <option value="Chef d'entreprise">Chef d'entreprise</option>
                  <option value="Profession libérale">Profession libérale</option>
                  <option value="Cadre supérieur">Cadre supérieur</option>
                  <option value="Cadre moyen">Cadre moyen</option>
                  <option value="Enseignant, Professeur, Professions scientifique">Enseignant, Professeur, Professions scientifique</option>
                  <option value="Ingénieurs / Cadre technique d'entreprise">Ingénieurs / Cadre technique d'entreprise</option>
                  <option value="Technicien / Agent de maîtrise">Technicien / Agent de maîtrise</option>
                  <option value="Policier / Militaire">Policier / Militaire</option>
                  <option value="Fonction publique">Fonction publique</option>
                  <option value="Employés administratifs d'entreprise">Employés administratifs d'entreprise</option>
                  <option value="Ouvriers / Chauffeur">Ouvriers / Chauffeur</option>
                  <option value="Femme au foyer">Femme au foyer</option>
                  <option value="Elèves, Etudiants">Elèves, Etudiants</option>
                  <option value="Sans emploi">Sans emploi</option>
                  <option value="Autres">Autres</option>
                </select>
                {errors.profession && <p className="text-red-500 text-xs mt-1">{errors.profession}</p>}
              </div>

              {/* Situation familiale */}
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-900">
                  Situation familiale *
                </label>
                <select 
                  name="situation_familiale"
                  value={userData.situation_familiale}
                  className={`w-full p-2.5 border rounded-lg ${errors.situation_familiale ? 'border-red-500' : 'border-gray-300'}`}
                  onChange={changeHandler}
                >
                  <option value="">Sélectionner...</option>
                  <option value="Célebataire">Célibataire</option>
                  <option value="Marié">Marié</option>
                  <option value="Divorce">Divorcé</option>
                </select>
                {errors.situation_familiale && <p className="text-red-500 text-xs mt-1">{errors.situation_familiale}</p>}
              </div>

              {/* Enfants (si marié ou divorcé) */}
              {userData.situation_familiale !== "Célebataire" && userData.situation_familiale !== "" && (
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-900">
                    Nombre d'enfants *
                  </label>
                  <select 
                    name="enfants"
                    value={userData.enfants}
                    className={`w-full p-2.5 border rounded-lg ${errors.enfants ? 'border-red-500' : 'border-gray-300'}`}
                    onChange={changeHandler}
                  >
                    <option value="">Sélectionner...</option>
                    <option value="0">0</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                  </select>
                  {errors.enfants && <p className="text-red-500 text-xs mt-1">{errors.enfants}</p>}
                </div>
              )}
            </div>
          )}

          {/* Step 3 */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <h1 className="text-2xl font-bold text-gray-900 mb-6">
                Confirmation
              </h1>
              <p className="mb-4">Vérifiez vos informations avant de soumettre.</p>

              {/* Noms des enfants si nécessaire */}
              {userData.situation_familiale !== 'Célebataire' && userData.enfants && parseInt(userData.enfants) > 0 && (
                <div className="space-y-3">
                  <label className="block mb-2 text-sm font-medium text-gray-900">
                    Nom des enfants *
                  </label>
                  {Array.from({ length: parseInt(userData.enfants) }, (_, index) => {
                    const fieldName = `nom_enfant_${index + 1}`;
                    return (
                      <div key={index}>
                        <input
                          type="text"
                          name={fieldName}
                          value={userData[fieldName]}
                          className={`w-full p-2.5 border rounded-lg ${errors[fieldName] ? 'border-red-500' : 'border-gray-300'}`}
                          placeholder={`Nom de l'Enfant ${index + 1}`}
                          onChange={changeHandler}
                        />
                        {errors[fieldName] && <p className="text-red-500 text-xs mt-1">{errors[fieldName]}</p>}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Conditions générales */}
              <div className="bg-gray-50 border border-gray-300 rounded-lg p-4">
                <div className="flex items-start space-x-2">
                  <input
                    type="checkbox"
                    id="conditions"
                    checked={isAgreed}
                    className="w-4 h-4 mt-1 accent-blue-600"
                    onChange={handleCheckboxChange}
                  />
                  <div className="flex-1">
                    <span className="text-sm">En cochant cette case, vous{" "}
                      <button
                        type="button"
                        onClick={handleShowModal}
                        className="text-blue-500 hover:underline"
                      >
                        déclarez avoir lu et accepté nos conditions générales de vente.
                      </button>
                    </span>
                  </div>
                </div>
                {errors.conditions && <p className="text-red-500 text-xs mt-1">{errors.conditions}</p>}
              </div>
            </div>
          )}

          {/* Navigation buttons */}
          <div className="flex justify-between pt-6">
            {currentStep > 1 && (
              <button
                type="button"
                className="px-6 py-2 text-white bg-gray-500 font-medium rounded-lg text-sm hover:bg-gray-600 transition-colors"
                onClick={handlePreviousStep}
              >
                Précédent
              </button>
            )}
            
            {currentStep < 3 ? (
              <button
                type="button"
                className="px-6 py-2 text-white bg-blue-600 font-medium rounded-lg text-sm hover:bg-blue-700 transition-colors ml-auto"
                onClick={handleNextStep}
              >
                Suivant
              </button>
            ) : (
              <button 
                onClick={handleSubmit}
                className="px-6 py-2 text-white bg-green-600 font-medium rounded-lg text-sm hover:bg-green-700 transition-colors ml-auto"
              >
                Soumettre
              </button>
            )}
          </div>
        </div>

        {/* Modal pour les conditions */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg shadow-lg max-w-md w-full max-h-96 overflow-y-auto mx-4">
              <div className="flex justify-between items-center bg-blue-600 p-4">
                <h2 className="font-semibold text-xl text-white">
                  Conditions Générales
                </h2>
                <button onClick={handleCloseModal} className="text-white hover:text-gray-200">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="p-4">
                <p className="text-sm text-gray-600 leading-relaxed">
                  Conditions générales de vente du magasin MG. En utilisant nos services, vous acceptez les termes suivants...
                  <br /><br />
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                </p>
              </div>
              <div className="flex justify-end p-4">
                <button
                  onClick={handleCloseModal}
                  className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Register;