pragma solidity ^0.4.18;

// ----------------------------------------------------------------------------
// FlexibleTokenSaleMock - Mock Token Sale Contract
// Enuma Blockchain Platform
//
// Copyright (c) 2017 Enuma Technologies.
// https://www.enuma.io/
// ----------------------------------------------------------------------------

import "./FlexibleTokenSale.sol";


contract FlexibleTokenSaleMock is FlexibleTokenSale {

   uint256 public _now;


   function FlexibleTokenSaleMock(uint256 _startTime, uint256 _endTime, address _walletAddress, uint256 _currentTime) public
      FlexibleTokenSale(_startTime, _endTime, _walletAddress)
   {
      _now = _currentTime;
   }


   function currentTime() public view returns (uint256) {
      return _now;
   }


   function changeTime(uint256 _newTime) public onlyOwner returns (bool) {
      _now = _newTime;

      return true;
   }
}


