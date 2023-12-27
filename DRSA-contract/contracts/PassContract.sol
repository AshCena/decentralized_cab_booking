// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "./XclusiveRydePass.sol"; // Import the path to the XclusiveRydePass contract

contract PassContract {
    using ECDSA for bytes32;

    XclusiveRydePass public xrpContract; // This will hold the reference to the XclusiveRydePass contract
    mapping(uint256 => bool) public invalidatedTokens;
    address private signer; // Address of the signer
    mapping(address => uint256) private ratings;
    address public owneri;
    bytes public signM;
    uint public tkid;
    bytes32 public signM2;


    constructor(address _xrpAddress) {
        signer = msg.sender; // The deployer is the signer
        xrpContract = XclusiveRydePass(_xrpAddress); // Initialize the XRP contract
    }

   

    function isValidSignedMessage(uint256 amount, bytes memory signedMessage)
        internal
        view
        returns (bool)
    {
        bytes32 message = prefixed(keccak256(abi.encodePacked(this, amount)));
        return recoverSigner(message, signedMessage) == msg.sender;
    }

    function validateSignature(uint256 tokenId, uint256 amount, bytes memory signedMessage) public{
        require(isValidSignedMessage(amount, signedMessage),'Signed message Unmatch');
        xrpContract.burn(tokenId);       

    }

    function splitSignedMessage(bytes memory sig)
        internal
        pure
        returns (uint8 v, bytes32 r, bytes32 s)
    {
        require(sig.length == 65,'Signed message length');
        assembly{
            r := mload(add(sig, 32))
            s := mload(add(sig, 64))
            v := byte(0, mload(add(sig, 96)))
        }
        return (v, r, s);
    }

    function recoverSigner(bytes32 message, bytes memory sig)
        internal
        pure
        returns (address)
    {
        (uint8 v, bytes32 r, bytes32 s) = splitSignedMessage(sig);
        return ecrecover(message, v, r, s);
    }

    function prefixed(bytes32 hash) internal pure returns (bytes32){
        return keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", hash));
    }

    // Function to increment a user's rating
    function incrementRating(address user, uint256 amount) public {
        ratings[user] += amount;
    }

    // Function to decrement a user's rating
    function decrementRating(address user, uint256 amount) public  {
        require(ratings[user] >= amount, "Cannot decrement rating below zero.");
        ratings[user] -= amount;
    }

    // Function to get a user's rating
    function getRating(address user) public view returns (uint256) {
        return ratings[user];
    }
}
