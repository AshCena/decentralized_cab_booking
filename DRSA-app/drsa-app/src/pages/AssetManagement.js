import React, { useState, useEffect, useRef } from 'react';
import { initializeWeb3 } from '../utils/web3';
import RydeAsset from 'contractsAbi/Rydeasset.json';
import RydePass from 'contractsAbi/XclusiveRydePass.json'

import './AssetManagement.css'; // Import the CSS file
import { useRideKoin } from './RideKoinContext';
import config from '../config/config'; // Adjust the path based on your file structure


function AssetManagement() {
    // State for each input and the receiver's address
    const { setRideKoins } = useRideKoin();


    const [web3, setWeb3] = useState(null);
    const [account, setAccount] = useState('');
    const [buyRideKoin, setBuyRideKoin] = useState('');
    const [viewXRTPasses, setviewXRTPasses] = useState('');
    const [XRTPassid, setXRTPassid] = useState('');
    const [createRideAsset, setCreateRideAsset] = useState('');
    const [sendRideKoin, setSendRideKoin] = useState('');
    const [sendXRTPasses, setSendXRTPasses] = useState('');
    const [sendRideAsset, setSendRideAsset] = useState('');
    const [receiverAddress, setReceiverAddress] = useState('');
    const [contractInstance, setContractInstance] = useState(null);
    const [userRole, setUserRole] = useState(null); // State to store user role
    const [createXRPValue, setCreateXRPValue] = useState(''); // State for XRP Pass creation value

    const [xrpPassIdToSetPrice, setXrpPassIdToSetPrice] = useState('');
    const [xrpPassPrice, setXrpPassPrice] = useState('');

    useEffect(() => {
        // Fetch user role from the contract
        const fetchUserRole = async () => {
            if (web3 && account) {
                const contractInstance = new web3.eth.Contract(RydeAsset.abi, config.rydeAssetContractAddress);
                const role = await contractInstance.methods.getUserRole(account).call({ from: account });
                setUserRole(Number(role)); // Set user role (1 for driver, 2 for rider)
                console.log("Heya! ", role);
            }
        };

        fetchUserRole();
    }, [web3, account]);


    useEffect(() => {
        const loadWeb3 = async () => {
          try {
            const web3Instance = await initializeWeb3();
            setWeb3(web3Instance);
          } catch (error) {
            console.error('Error initializing web3:', error);
          }
        };
    
        loadWeb3();
      }, []);

      useEffect(() => {
        const loadAccount = async () => {
          if (web3) {
            const accounts = await web3.eth.getAccounts();
            setAccount(accounts[0]);
          }
        };
    
        loadAccount();
      }, [web3]);

    // Handlers for each button click
    // Add your logic here

    const handleBuyRideKoin = async () => {
        try {
            const contractAddress = config.rydeAssetContractAddress;
            const contractInstance = new web3.eth.Contract(RydeAsset.abi, contractAddress);
            setContractInstance(contractInstance);


            // Convert input value to a BigNumber if necessary
            const tokenAmount = buyRideKoin;
            const tokenAmountInWei = tokenAmount * 10;

            // Call the smart contract function
            await contractInstance.methods.buyRideKoin(tokenAmount).send({ from: account, value: tokenAmountInWei });

            console.log('Transaction successful for buyRideKoin');
            setRideKoins(previousKoins => previousKoins + parseInt(tokenAmount));

        } catch (error) {
            console.error('Error in buyRideKoin transaction:', error);
        }
    };

    const handleViewXRTPasses = async () => {
        const contractAddress = config.rydeAssetContractAddress;;
        const contractInstance = new web3.eth.Contract(RydeAsset.abi, contractAddress);
        setContractInstance(contractInstance);
        try {
            if (contractInstance) {
                // Call the smart contract function
                const tokens = await contractInstance.methods.getTokens(account).call({ from: account });
                console.log('Tokens owned:', tokens);
                setviewXRTPasses(tokens);
            } else {
                console.error('Contract instance not available');
            }
        } catch (error) {
            console.error('Error in getTokens call:', error);
        }
    };
    
    const handleCreateRideAsset = () => { /* logic */ };


    const handleSendRideKoin = async () => {
        const contractAddress = config.rydeAssetContractAddress;;
        const contractInstance = new web3.eth.Contract(RydeAsset.abi, contractAddress);
        setContractInstance(contractInstance);
        try {
            if (contractInstance) {
                // Call the smart contract function
                const val = sendRideKoin;
                const receiver = receiverAddress;
                console.log("methods", contractInstance.methods);
                const ride_koins = await contractInstance.methods.transferRideKoins(account, receiver, val).send({ from: account });
                console.log('Ride koins sent:', ride_koins);
                setSendRideKoin(ride_koins);
            } else {
                console.error('Contract instance not available');
            }
        } catch (error) {
            console.error('Error in sending tokens call:', error);
        }
    };

    const handleSendXRTPasses = async () => {
        const contractAddress = config.xrtPassContract;
        const contractInstance = new web3.eth.Contract(RydePass.abi, contractAddress);
        setContractInstance(contractInstance);
        try {
            if (contractInstance) {
                // Convert input values to appropriate types
                console.log("XRTPassid", XRTPassid)
                const passId = XRTPassid;
                //const passId = parseInt(XRTPassid, 10); // assuming passId is an integer
                const receiver = receiverAddress;
                console.log("receiver ", receiver)

                // Call the smart contract function
                await contractInstance.methods.transferToken(receiver,account, passId).send({ from: account });

                console.log(`Transaction successful for transferring Xclusive Ryde Pass with ID ${passId} to ${receiver}`);
            } else {
                console.error('Contract instance not available');
            }
        } catch (error) {
            console.error('Error in transferXclusiveRydePass call:', error);
        }
    };

    const handleSendRideAsset = () => { /* logic */ };

    const handleCreateXRPPass = async () => {
        if (userRole === 1) { // Check if user is a driver
            try {
                const contractInstance = new web3.eth.Contract(RydeAsset.abi, config.rydeAssetContractAddress);
                // Logic to create XRP Pass and set its value
                console.log("account: ", account);
                await contractInstance.methods.mintXclusiveRydePass(account).send({ from: account, value: 10 });
                console.log("XRP Pass created with value: ", createXRPValue);
            } catch (error) {
                console.error('Error creating XRP Pass:', error);
            }
        } else {
            alert("Only drivers can create XRP Passes.");
        }
    };

    const handleSetXRPPrice = async () => {
        if (!xrpPassIdToSetPrice || !xrpPassPrice) {
            alert("Please enter both the XRP Pass ID and the price to set");
            return;
        }

        try {
            const contractInstance = new web3.eth.Contract(RydeAsset.abi, config.rydeAssetContractAddress);
            await contractInstance.methods.setXclusivePassPrice(xrpPassIdToSetPrice, xrpPassPrice).send({ from: account });
            alert(`Price for XRP Pass ID ${xrpPassIdToSetPrice} set to ${xrpPassPrice}`);
        } catch (error) {
            console.error('Error setting XRP Pass price:', error);
            alert('Failed to set price for XRP Pass.');
        }
    };

    const XRPBox = () => (
        <div className="card">
            <div className="row">
                <button onClick={handleCreateXRPPass}>Create XRP Pass</button>
            </div>
        </div>
    );

    return (
        <div className="asset-management">
            {userRole === 1 && <XRPBox />} {/* Render XRP Box if userRole is 1 */}
            {userRole === 1 && <div className="card">
                <div className="row">
                    <input type="text" value={xrpPassIdToSetPrice} onChange={(e) => setXrpPassIdToSetPrice(e.target.value)} placeholder="Enter XRP Pass ID" />
                    <input type="text" value={xrpPassPrice} onChange={(e) => setXrpPassPrice(e.target.value)} placeholder="Set Price" />
                    <button onClick={handleSetXRPPrice}>Set Price</button>
                </div>
            </div>}
            <div className="card">
                <div className="row">
                    <input type="text" value={buyRideKoin} onChange={(e) => setBuyRideKoin(e.target.value)} placeholder="Buy RideKoin" />
                    <button onClick={handleBuyRideKoin}>Buy</button>
                </div>
            </div>
            <div className="card">
                <div className="row">
                    <input type="text" value={viewXRTPasses} onChange={(e) => setviewXRTPasses(e.target.value)} placeholder="View XRT Passes" />
                    <button onClick={handleViewXRTPasses }>View</button>
                </div>
            </div>
            <div className="card">
                <div className="row">
                    <input type="text" value={createRideAsset} onChange={(e) => setCreateRideAsset(e.target.value)} placeholder="Create RideAsset" />
                    <button onClick={handleCreateRideAsset}>Create</button>
                </div>
            </div>
            <div className="card">
                <div className="row">
                    <input type="text" value={sendRideKoin} onChange={(e) => setSendRideKoin(e.target.value)} placeholder="Send RideKoin" />
                    <input type="text" value={receiverAddress} onChange={(e) => setReceiverAddress(e.target.value)} placeholder="Receiver's Address" />
                    <button onClick={handleSendRideKoin}>Send</button>
                </div>
            </div>
            <div className="card">
                <div className="row">
                    <input type="text" value={XRTPassid} onChange={(e) => setXRTPassid(e.target.value)} placeholder="Enter XRT PassID" />
                    <input type="text" value={receiverAddress} onChange={(e) => setReceiverAddress(e.target.value)} placeholder="Receiver's Address" />
                    <button onClick={handleSendXRTPasses}>Send</button>
                </div>
            </div>
            <div className="card">
                <div className="row">
                    <input type="text" value={sendRideAsset} onChange={(e) => setSendRideAsset(e.target.value)} placeholder="Send RideAsset" />
                    <input type="text" value={receiverAddress} onChange={(e) => setReceiverAddress(e.target.value)} placeholder="Receiver's Address" />
                    <button onClick={handleSendRideAsset}>Send</button>
                </div>
            </div>
        </div>
    );
}

export default AssetManagement;
