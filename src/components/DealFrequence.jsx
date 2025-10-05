import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserProfile } from "../store/slices/user";
import frequencesImg from "../assets/images/frequencesImg.png";
import { fetchDealFrequence } from "../store/slices/frequence.js";
import '@fortawesome/fontawesome-free/css/all.min.css';
import DealEnded from "./DealEnded.jsx";
import Timer from "./Timer.jsx";

const DealFrequence = ({ Time, data }) => {
  const { frequence = [], loading, error } = useSelector((state) => state.frequence);
  const { Userprofile } = useSelector((state) => state.user);
  const [objectif, setObjectif] = useState(0);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchUserProfile());
    dispatch(fetchDealFrequence());
  }, [dispatch]);

  const filteredDeals = frequence.filter(
    (el) => Userprofile && el.ID_client === Userprofile.ID_client && el.ID_deal_offre === data
  );

  const currentDeal = filteredDeals[0];

  useEffect(() => {
    if (currentDeal) {
      const progress = (currentDeal.compteur_frequence / currentDeal.objectif_frequence) * 100;
      setObjectif(progress);
    }
  }, [currentDeal]);

  if (loading) return <div className="spinner">Loading...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!currentDeal) return <div>Aucune offre trouvée</div>;

  const renderMarkers = (deal) => {
    const markers = [];
    for (let i = 1; i <= deal.objectif_frequence; i++) {
      const isDone = deal.compteur_frequence >= i;
      markers.push(
        <div key={i}>
          <span
            style={{
              left: `${((i / deal.objectif_frequence) * 100) - i}%`,
              transform: "translateX(-50%) translateY(-50%)",
              background: isDone ? "linear-gradient(to right, #d19e1d, #ffd86e, #e3a812)" : "gray",
            }}
            className="text-white rounded-full w-10 h-10 absolute top-1/2 flex items-center justify-center text-sm font-medium"
          >
            {i}
          </span>
          <span
            style={{
              left: `${((i / deal.objectif_frequence) * 100) - i}%`,
              background: "blue",
            }}
            className="mt-2 text-white rounded-full w-12 h-12 absolute top-full transform -translate-x-1/2 flex items-center justify-center text-sm font-medium"
          >
            {parseInt(deal.panier_moyen)} dt
          </span>
        </div>
      );
    }
    return markers;
  };

  if (currentDeal.compteur_frequence >= currentDeal.objectif_frequence) {
    return (
      <div>
        <DealEnded gain={currentDeal.gain} image={frequencesImg} />
      </div>
    );
  }

  return (
    <div className="h-auto">
      <div className="flex flex-col justify-between bg-gray-50 shadow-md rounded-lg">
        <Timer flashSaleTimeLeft={Time} />
        <div className="flex flex-row justify-start m-2 items-center bg-gray-100">
          <div className="w-full h-80 rounded-lg overflow-hidden shadow-lg bg-white flex flex-col">
            <div className="flex items-end justify-end">
              <button className="p-2 bg-purple-600 rounded-xl mx-3 mt-1 text-white font-semibold">
                Fréquence
              </button>
            </div>

            <div className="flex flex-row justify-around">
              <img src={frequencesImg} alt="Deal" className="w-32 h-24 object-cover " />
              <div className="font-mono text-base text-center">
                <p>Gagné {currentDeal.gain} Dt</p>
                <p>si vous atteignez l'objectif</p>
                <p className="text-orange-360">
                  {parseInt(currentDeal.objectif_frequence)} visites avec un montant minimum par commande {parseInt(currentDeal.panier_moyen)} Dt
                </p>
              </div>
            </div>

            <div className="px-2 ">
              <div className="w-full rounded-full h-10  relative border-2 border-black">
                {renderMarkers(currentDeal)}
                <div
                  className="bg-green-600 h-9 rounded-full"
                  style={{ width: `${objectif}%` }}
                ></div>
                <div className="mt-8">
                  <i className="fas fa-gift p-2 mt-4"></i> Mes visites : {parseInt(currentDeal.compteur_frequence)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DealFrequence;
