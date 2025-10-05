import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserProfile } from "../store/slices/user";
import { fetchAnniversaire } from "../store/slices/anniversaire";
import dealAnniversaire from "../assets/images/dealAnniversaire.png";
import Timer from "./Timer";
import DealEnded from "./DealEnded";

const DealAnniversaire = ({ Time, data }) => {
  const { anniversaire = [], loading, error } = useSelector((state) => state.anniversaire);
  const { Userprofile } = useSelector((state) => state.user);
  const [objectif, setObjectif] = useState(0);
  const [gain, setGain] = useState(0);
  const dispatch = useDispatch();
 
  useEffect(() => {
    dispatch(fetchUserProfile());
    dispatch(fetchAnniversaire());
  }, [dispatch]);

  const filteredDeal = anniversaire.find(
    (el) =>
      Userprofile && el.ID_client === Userprofile.ID_client && el.ID_deal_offre === data
  );


  useEffect(() => {
    if (filteredDeal) {
      const { compteur_objectif, objectif_1, objectif_2, objectif_3, gain_objectif_1, gain_objectif_2, gain_objectif_3 } = filteredDeal;

      if (compteur_objectif >= objectif_3) {
        setObjectif("100%");
        setGain(gain_objectif_3);
      } else if (compteur_objectif >= objectif_2) {
        setObjectif("50%");
        setGain(gain_objectif_2);
      } else if (compteur_objectif >= objectif_1) {
        setObjectif("25%");
        setGain(gain_objectif_1);
      } else {
        setObjectif(0);
        setGain(0);
      }
    }
  }, [filteredDeal]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;
  if (!filteredDeal) return null;

  const { compteur_objectif, objectif_1, objectif_2, objectif_3, gain_objectif_1, gain_objectif_2, gain_objectif_3 } = filteredDeal;

  const renderMarker = (position, objectifValue, gainValue) => {
    const achieved = compteur_objectif >= objectifValue;
    return (
      <>
        <span
          style={{
            left: `${position}%`,
            transform: "translateX(-50%) translateY(-50%)",
            background: achieved
              ? "linear-gradient(to right, #d19e1d, #ffd86e, #e3a812)"
              : "gray",
          }}
          className="text-white rounded-full w-10 h-10 absolute top-1/2 transform -translate-y-1/2 flex items-center justify-center text-sm font-semibold"
        >
          {parseInt(gainValue)}dt
        </span>
        <span
          style={{
            left: `${position}%`,
            background: "blue",
          }}
          className="text-white rounded-full w-12 h-12 absolute top-full mt-2 transform -translate-x-1/2 flex items-center justify-center text-base font-semibold"
        >
          {parseInt(objectifValue)}dt
        </span>
      </>
    );
  };

  return (
    <div>
      {compteur_objectif !== objectif_3 && Time!= ["00", "00" ,"00" ,"00"] && (
        <div className="flex flex-col justify-between bg-gray-50 shadow-md rounded-lg">
          <Timer flashSaleTimeLeft={Time} />
          <div className="flex flex-row justify-start m-2 items-center bg-gray-100">
            <div className="w-full h-80 rounded-lg overflow-hidden shadow-lg bg-white flex flex-col">
              <div className="flex items-end justify-end">
                <button className="p-2 bg-purple-600 rounded-xl mx-3 mt-1 text-white font-semibold sm:font-normal">
                  Anniversaire
                </button>
              </div>
              <div className="flex flex-row justify-between">
                <img src={dealAnniversaire} alt="Deal" className="w-32 h-24 object-cover p-1" />
                <div className="md:font-semibold sm:font-mono text-base text-center mt-4">
                  <p>Gagné jusqu'à</p>
                  <p className="text-orange-360">{gain_objectif_3} Dt</p>
                  <p>si vous atteignez l'objectif</p>
                </div>
              </div>
              <div className="px-2 mt-7">
                <div className="w-full rounded-full h-10 mt-2 relative border-2 border-black">
                  {renderMarker(25, objectif_1, gain_objectif_1)}
                  {renderMarker(50, objectif_2, gain_objectif_2)}
                  {renderMarker(75, objectif_3, gain_objectif_3)}

                  <div className="bg-green-500 h-9 rounded-full" style={{ width: `${objectif}` }}></div>
                  <div className="mt-8">
                    <i className="fas fa-gift p-2 mt-4"></i> Mes achats: {compteur_objectif}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) }
    </div>
  );
};

export default DealAnniversaire;
