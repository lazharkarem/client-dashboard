import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserProfile } from "../store/slices/user";
import moneyGainImage from "../assets/images/moneygain.png";
import '@fortawesome/fontawesome-free/css/all.min.css';
import { fetchDealDepense } from "../store/slices/deal";
import Timer from "./Timer";
import DealEnded from "./DealEnded";

const Depense = ({ Time, data }) => {
  const { deal = [], loading, error } = useSelector((state) => state.deal);
  const { Userprofile } = useSelector((state) => state.user);
  const [objectif, setObjectif] = useState("0%");
  const [gain, setGain] = useState(0);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(fetchUserProfile());
    dispatch(fetchDealDepense());
  }, [dispatch]);

  const filteredDeals = deal.filter(
    (el) =>
      Userprofile &&
      el.ID_client === Userprofile.ID_client &&
      el.ID_deal_offre === data
  );

  const currentDeal = filteredDeals[0]; // 

  useEffect(() => {
    if (!currentDeal) return;

    const compteur = parseInt(currentDeal.compteur_objectif);

    if (compteur >= parseInt(currentDeal.objectif_3)) {
      setObjectif("100%");
      setGain(parseInt(currentDeal.gain_objectif_3));
    } else if (compteur >= parseInt(currentDeal.objectif_2)) {
      setObjectif("50%");
      setGain(parseInt(currentDeal.gain_objectif_2));
    } else if (compteur >= parseInt(currentDeal.objectif_1)) {
      setObjectif("25%");
      setGain(parseInt(currentDeal.gain_objectif_1));
    } else {
      setObjectif("0%");
      setGain(0);
    }
  }, [currentDeal]);

  const renderMarker = (left, objectifValue, gainValue, currentValue) => {
    const achieved = Number(currentValue) >= objectifValue;
    console.log(currentValue)
    return (
      <div key={left}>
        <span
          style={{
            left: `${left}%`,
            transform: "translateX(-50%) translateY(-50%)",
            background: achieved
              ? "linear-gradient(to right, #d19e1d, #ffd86e, #e3a812)"
              : "gray",
          }}
          className="text-white rounded-full w-10 h-10 absolute top-1/2 flex items-center justify-center text-sm font-semibold"
        >
          {gainValue}dt
        </span>
        <span
          style={{
            left: `${left}%`,
            background: "blue",
          }}
          className="text-white rounded-full w-12 h-12 absolute top-full mt-2 transform -translate-x-1/2 flex items-center justify-center text-base font-semibold"
        >
          {parseInt(objectifValue)}dt
        </span>
      </div>
    );
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      {currentDeal && parseInt(currentDeal.compteur_objectif) < parseInt(currentDeal.objectif_3) ? (
        <div
          key={currentDeal.ID_deal}
          className="flex flex-col justify-between w-full bg-gray-50 shadow-md rounded-lg"
        >
          <Timer flashSaleTimeLeft={Time} />

          <div className="flex flex-row justify-start m-2 items-center bg-gray-100">
            <div className="w-full h-80 rounded-lg overflow-hidden shadow-lg bg-white flex flex-col">
              <div className="flex items-end justify-end">
                <button className="p-2 bg-purple-600 rounded-xl mx-4 my-1 text-white md:font-semibold sm:font-normal">
                  Dépense
                </button>
              </div>

              <div className="flex flex-row justify-
              
              mt-1">
                <img
                  src={moneyGainImage}
                  alt="Deal"
                  className="w-32 h-24 object-cover p-1"
                />
                <div className="md:font-semibold sm:font-mono text-base text-center mt-4">
                  <p>Gagné jusqu'à</p>
                  <p className="font-bold text-orange-360">{currentDeal.gain_objectif_3} Dt</p>
                  <p>si vous atteignez l'objectif</p>
                </div>
                
              </div>

              <div className="p-1 mt-3">
              <div className="w-full rounded-full h-10 mt-2 relative border-2 border-black">
                  {renderMarker(
                    25,
                    currentDeal.objectif_1,
                    currentDeal.gain_objectif_1,
                    currentDeal.compteur_objectif
                  )}
                  {renderMarker(
                    50,
                    currentDeal.objectif_2,
                    currentDeal.gain_objectif_2,
                    currentDeal.compteur_objectif
                  )}
                  {renderMarker(
                    75,
                    currentDeal.objectif_3,
                    currentDeal.gain_objectif_3,
                    currentDeal.compteur_objectif
                  )}

                  <div
                    className="bg-green-500 h-9 rounded-full"
                    style={{ width: objectif }}
                  ></div>
                </div>
                <div className="mt-12">
                  <i className="fas fa-gift p-1 font-meduim text-base"></i>
                  Mes achats: {currentDeal.compteur_objectif} dt
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <DealEnded
          key={currentDeal?.ID_deal}
          gain={gain}
          image={moneyGainImage}
        />
      )}
    </div>
  );
};

export default Depense;


