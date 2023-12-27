import React, { useState } from 'react';
import './App.css';
import Navbar from './components/Navbar';
import {BrowserRouter as Router, Route} from 'react-router-dom';
import { Routes } from "react-router-dom";
import Register from './pages/Register';
import RiderScreen from './pages/Rider';
import DriverScreen from "./pages/Driver";
import Admin from "./pages/Admin";
import AssetManagement from "./pages/AssetManagement";
import XRPPasses from "./pages/XRPPasses";
import { RideKoinProvider } from './pages/RideKoinContext';
import { RidePassProvider } from './pages/RidePassContext';
import { RideCreditProvider } from './pages/RideCreditsContext';
import { NftTokenProvider } from './pages/NFTTokenContext';
import Confetti from 'react-confetti';
import PassValidator from './pages/PassValidator';







function App(){

  const [showRedemptionCard, setShowRedemptionCard] = useState(false);
  const [redeemedTokenAmt, setRedeemedTokenAmt] = useState(0); // Add this state

  // This function could be passed down to the Navbar or any other component that needs to trigger the redemption card
  const redeemToken = (tokenAmt) => {
    setRedeemedTokenAmt(tokenAmt);
    setShowRedemptionCard(true);
    setTimeout(() => setShowRedemptionCard(false), 5000); // Hide after 3 seconds
  };
  console.log('redeemToken function:', redeemToken);


  return (
      <RideKoinProvider>
        <RidePassProvider>
          <RideCreditProvider>
            <NftTokenProvider>

              <Router>
              <Navbar redeemToken={redeemToken} />
                {showRedemptionCard && (
                  <div className="redemption-overlay">
                    <Confetti
                      width={window.width}
                      height={window.height}
                    />
                    <div className="redemption-card">
                      Hurray! You have redeemed the token! And you recieved {redeemedTokenAmt} RideKoins! 
                    </div>
                  </div>
                )}              
                <Routes>
                <Route path="/" element={<Register />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/rider" element={<RiderScreen />} />
                <Route path="/driver" element={<DriverScreen />} />
                <Route path="/payment" element={<AssetManagement />} />
                <Route path="/xrp" element={<XRPPasses />} />
                <Route path="/validate" element={<PassValidator />} />

              </Routes>
              </Router>
                  
            </NftTokenProvider>
          </RideCreditProvider>
        </RidePassProvider>
      </ RideKoinProvider>
          );
}

export default App;
