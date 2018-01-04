pragma solidity ^0.4.18;

// ----------------------------------------------------------------------------
// OpsManaged - Implements an Owner and Ops Permission Model
// Enuma Blockchain Platform
//
// Copyright (c) 2017 Enuma Technologies.
// https://www.enuma.io/
// ----------------------------------------------------------------------------


import "./Owned.sol";


//
// Implements a security model with owner and ops.
//
contract OpsManaged is Owned {

   address public opsAddress;

   event OpsAddressUpdated(address indexed _newAddress);


   function OpsManaged() public
      Owned()
   {
   }


   modifier onlyOwnerOrOps() {
      require(isOwnerOrOps(msg.sender));
      _;
   }


   function isOps(address _address) public view returns (bool) {
      return (opsAddress != address(0) && _address == opsAddress);
   }


   function isOwnerOrOps(address _address) public view returns (bool) {
      return (isOwner(_address) || isOps(_address));
   }


   function setOpsAddress(address _newOpsAddress) public onlyOwner returns (bool) {
      require(_newOpsAddress != owner);
      require(_newOpsAddress != address(this));

      opsAddress = _newOpsAddress;

      OpsAddressUpdated(opsAddress);

      return true;
   }
}
