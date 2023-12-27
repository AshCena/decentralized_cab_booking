import React, { useState, useEffect } from 'react';
import xrpPassDescriptions from '../components/xrpPasses.json'; // Adjust the path as necessary
import './XRPPasses.css'; // CSS file for styling the cards
import RydeAsset from 'contractsAbi/RydeAsset.json';
import config from "../config/config";
import Transacx from 'contractsAbi/TransacX.json';
import Web3 from "web3";

const XRPPasses = () => {
    const [xrpPasses, setXrpPasses] = useState([]);
    const [web3, setWeb3] = useState(null);
    const [account, setAccount] = useState('');
    const [signedMessage, setSignedMessage] = useState('');

    useEffect(() => {

        const loadWeb3 = async () => {
            if (window.ethereum) {
                const web3Instance = new Web3(window.ethereum);
                try {
                    await window.ethereum.enable();
                    setWeb3(web3Instance);
                } catch (error) {
                    console.error('User denied account access');
                }
            } else if (window.web3) {
                const web3Instance = new Web3(window.web3.currentProvider);
                setWeb3(web3Instance);
            } else {
                console.error('No Ethereum browser extension detected');
            }
        };

        loadWeb3();
    }, []);

    useEffect(() => {
        const loadAccount = async () => {
            if (web3) {
                const accounts = await web3.eth.getAccounts();
                console.log("Acc: ", accounts)
                setAccount(accounts[0]);
            }
        };

        loadAccount();
    }, [web3]);

    useEffect(() => {
        if (web3 && account) {
            console.log("blala")
            fetchXrpPasses();
        }
    }, [web3, account]);

    const constructPaymentMessage = (contractAddress, weiamount) => {
        console.log('Inside Construct Message');
        return web3.utils.soliditySha3(contractAddress, weiamount);
    };
    function stringToBytes(str) {
        const encoder = new TextEncoder();
        const bytes = encoder.encode(str);
        return bytes;
    }
    const constructAndSignMessage = async (tokenId, account) => {
        const weiamount = web3.utils.toWei(tokenId, 'ether');
        // const hexAmount = web3.utils.toHex(weiamount);

        const message = web3.utils.soliditySha3(
        { type: 'address', value: config.passContract },
        { type: 'uint256', value: weiamount }
        );
        
        console.log("type of and tokenid ", tokenId, typeof(tokenId));
        console.log("mesage: ", message, "  type of message ", typeof(message));
        const signedMessage = await web3.eth.sign(message, account);
        return signedMessage;
    };
    const findDescriptionForToken = (tokenId) => {
        const pass = xrpPasses.find(p => Number(p.id) === Number(tokenId));
        return pass ? pass.description : 'Description not found';
      };
    const handleSignedMessage = async (receiver, tokenId) => {
        if(receiver !== account){
            alert('Error in receiver\'s address.');
            return false;
        }
        // if(amount <= 0){
        //     alert('Please correct the amount.');
        //     return false;
        // }
        
        const message = await constructAndSignMessage(parseInt(tokenId), account)
        setSignedMessage(message);

        console.log("message", message)
        const response = await fetch('http://localhost:4000/api/pass/generate-pass', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ passName: findDescriptionForToken(tokenId), userName: account, signedMessage: message, tokenId: tokenId  }),
          });
        
          const blob = await response.blob();
          const downloadUrl = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = downloadUrl;
          link.download = 'pass.pdf';
          document.body.appendChild(link);
          link.click();
          link.remove();

    };



    const signMessage = async (message, amount) => {
        try {
            console.log("Account: ", account);
            console.log("Message: ", message);
            console.log("amount: ", amount);

        
            let signedMessage;
            if (window.ethereum) {
              // If using MetaMask
              signedMessage = await window.ethereum.request({
                method: 'personal_sign',
                params: [message, account],
              });
            } else {
              // Using web3 provider
              signedMessage = await web3.eth.personal.sign(message, account);
            }
            setSignedMessage(signedMessage);
            console.log('Signed Message:', signedMessage);
            // Additional UI handling for displaying the signed message
            console.log("xrPPasses: ", xrpPasses)
            const findDescriptionForToken = (amount) => {
                const pass = xrpPasses.find(p => Number(p.id) === Number(amount));
                return pass ? pass.description : 'Description not found';
              };

            const response = await fetch('http://localhost:4000/api/pass/generate-pass', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ passName: findDescriptionForToken(amount), userName: account, signedMessage: signedMessage, tokenId: amount  }),
              });
            
              const blob = await response.blob();
              const downloadUrl = window.URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = downloadUrl;
              link.download = 'pass.pdf';
              document.body.appendChild(link);
              link.click();
              link.remove();
        } catch (error) {
            console.error("Error in signing the message:", error);
        }
    };

    const fetchXrpPasses = async () => {

        if (!web3) {
            console.log("Web3 is not initialized yet.");
            return;
        }

        const contractAddress = config.transacxContract/* The address of your deployed RydeAsset contract */;
        const rydeAssetContract = new web3.eth.Contract(Transacx.abi, contractAddress);

        const passCount = await rydeAssetContract.methods.getXclusiveRydePassCount(account).call({from:account});
        const passes = [];
        for (let i = 0; i < passCount; i++) {
            const tokens = await rydeAssetContract.methods.getTokens(account).call({from:account});
            const tokenId = tokens[i];
            const price = await rydeAssetContract.methods.xclusivePassPrices(tokenId).call({from:account});
            passes.push({ id: tokenId, price, description: xrpPassDescriptions[tokenId.toString()] });
        }
        console.log("passes", passes);
        setXrpPasses(passes);
    };


    const handleUseXrp = async (tokenId) => {
        await handleSignedMessage(account, tokenId);
        // Call your API here after signing the message
        // Example API call
        
    };


    return (
        <div className="xrp-passes-container">
            {xrpPasses.map(pass => (
                <div key={pass.id} className="xrp-pass-card">
                    <img src={`https://source.unsplash.com/random/200x200?sig=${pass.id}`} alt="XRP Pass" />
                    <div className="pass-info">
                        <h3>XRP Pass # {pass.id.toString()}</h3>
                        <p>Description: {pass.description} Wei</p>

                        <p>Price: {pass.price.toString()} Wei</p>
                        <button onClick={() => handleUseXrp(pass.id.toString())}>Use XRP</button>

                    </div>
                </div>
            ))}
        </div>
    );
};
export default XRPPasses;
