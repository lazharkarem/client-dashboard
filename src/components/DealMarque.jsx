import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserProfile } from "../store/slices/user";
import '@fortawesome/fontawesome-free/css/all.min.css';
import { fetchDealMarque } from "../store/slices/dealMarque.js";
import Timer from "./Timer";

const DealMarque = ({ Time, data }) => {
  const { marque = [], loading, error } = useSelector((state) => state.marque);
  const { Userprofile } = useSelector((state) => state.user);
  const [objectif, setObjectif] = useState("0");
  const [gain, setGain] = useState("0");

  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(fetchUserProfile());
    dispatch(fetchDealMarque());
  }, [dispatch]);

  const filteredDeals = marque.find(
    (el) => Userprofile && el.ID_client === Userprofile.ID_client && el.ID_deal_offre === data
  );

  useEffect(() => {
    if (!filteredDeals) return;

    if (filteredDeals.compteur_objectif === 3.0) {
      setObjectif("100%");
      setGain(filteredDeals.gain_objectif_3);
    } else if (filteredDeals.compteur_objectif === 2.0) {
      setObjectif("50%");
      setGain(filteredDeals.gain_objectif_2);
    } else if (filteredDeals.compteur_objectif === 1.0) {
      setObjectif("25%");
      setGain(filteredDeals.gain_objectif_1);
    } else {
      setObjectif("0");
      setGain("0");
    }
  }, [filteredDeals]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;
  if (!filteredDeals) return null;

  return (
    <div>
      {filteredDeals.objectif_3 !== filteredDeals.compteur_objectif && (
        <div key={filteredDeals.ID_deal_marque} className="flex flex-col justify-between bg-gray-50 shadow-md rounded-lg">
          <Timer flashSaleTimeLeft={Time} />

          <div className="flex flex-row justify-start m-2 items-center bg-gray-100">
            <div className="w-full h-80 rounded-lg overflow-hidden shadow-lg bg-white flex flex-col">
              <div className="flex items-end justify-end">
                <button className="p-2 bg-purple-600 rounded-xl mx-4 my-1 text-white font-semibold sm:font-normal">
                  Marque
                </button>
              </div>

              <div className="flex flex-row justify-between mt-1">
                <img
                  src={filteredDeals.marqueLogo}
                  alt="Deal"
                  className="w-32 h-24 object-cover p-1"
                />
                <div className="md:font-semibold sm:font-mono text-base text-center mt-4">
                  <p>Gagné jusqu'à</p>
                  <p className="font-bold text-orange-360">{filteredDeals.gain_objectif_3} Dt</p>
                  <p>si vous atteignez l'objectif</p>
                </div>
              </div>

              <div className="p-1 mt-3">
                <div className="w-full rounded-full h-10 mt-2 relative border-2 border-black">
                  <div className="relative h-full">
                    {[1, 2, 3].map((level, index) => {
                      const left = `${25 * level}%`;
                      const gain = filteredDeals[`gain_objectif_${level}`];
                      const objectifValue = parseInt(filteredDeals[`objectif_${level}`]);
                      const compteur = filteredDeals.compteur_objectif;
                      const achieved = compteur >= filteredDeals[`objectif_${level}`];
                      return (
                        <React.Fragment key={level}>
                          <span
                            style={{
                              left,
                              transform: "translateX(-50%) translateY(-50%)",
                              background: achieved
                                ? "linear-gradient(to right, #d19e1d, #ffd86e, #e3a812)"
                                : "gray",
                            }}
                            className="text-white rounded-full w-10 h-10 absolute top-1/2 transform flex items-center justify-center text-lg font-semibold"
                          >
                            {gain}dt
                          </span>
                          <span
                            style={{
                              left,
                              background: "blue",
                            }}
                            className="text-white rounded-full w-12 h-12 absolute top-full mt-2 transform -translate-x-1/2 flex items-center justify-center text-base font-semibold"
                          >
                            {objectifValue}dt
                          </span>
                        </React.Fragment>
                      );
                    })}
                  </div>

                  <div
                    className="bg-green-500 h-9 rounded-full"
                    style={{ width: objectif }}
                  ></div>

                  <div className="mt-3">
                    <i className="fas fa-gift p-1 font-meduim text-base"></i> Mes achats: {gain} DT
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DealMarque;
