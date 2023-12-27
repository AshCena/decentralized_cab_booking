import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import './PassValidator.css'; // CSS file for styling the cards
import config from "../config/config";
import PassContract from 'contractsAbi/PassContract.json';


const PassValidator = () => {
  const [tokenId, setTokenId] = useState('');
  const [web3, setWeb3] = useState(null);
  const [account, setAccount] = useState('');
  const [signedMessage, setSignedMessage] = useState('');
  const [_vMessage, set_vMessage] = useState('');
  const [_rMessage, set_rMessage] = useState('');
  const [_sMessage, set_sMessage] = useState('');

  const [validationMessage, setValidationMessage] = useState('');
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


  const contractAddress = config.passContract; // Replace with your contract address

  function stringToBytes(str) {
    const encoder = new TextEncoder();
    const bytes = encoder.encode(str);
    return bytes;
}
const stringToBytes32 = (str) => {
    return web3.utils.fromAscii(str);
  };

const handleValidation = async () => {
    try {
      const passContract = new web3.eth.Contract(PassContract.abi, contractAddress);
      const accounts = await web3.eth.getAccounts();

    const weiamount = web3.utils.toWei(parseInt(tokenId), 'ether');
    const hexAmount = web3.utils.toHex(weiamount);
    console.log("Accounts: ", accounts)
    const receipt = await passContract.methods.validateSignature(parseInt(tokenId), weiamount, stringToBytes(signedMessage)).call({ from: account }); // Assuming accounts[1] is the receiver
    console.log("receipt :", receipt);
    

  
  
      setValidationMessage('Pass validated successfully.');
    } catch (error) {
      setValidationMessage(`Validation failed: ${error.message}`);
    }
  };

 

  return (
    <div className="validation-page">
      <h2>Validate Pass Signature</h2>
      <input
        type="text"
        value={tokenId}
        onChange={(e) => setTokenId(e.target.value)}
        placeholder="Enter Token ID"
      />
      <textarea
        value={signedMessage}
        onChange={(e) => setSignedMessage(e.target.value)}
        placeholder="Enter hashed Message"
      />
      <button onClick={handleValidation}>Validate Signature</button>

      {validationMessage && <p>{validationMessage}</p>}
    </div>
  );
};

export default PassValidator;
