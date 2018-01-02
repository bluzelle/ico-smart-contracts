pragma solidity ^0.4.17;

// ----------------------------------------------------------------------------
// BluzelleTokenSaleMock - Mock Token Sale Contract
//
// Copyright (c) 2017 Bluzelle Networks Pte Ltd.
// http://www.bluzelle.com/
//
// The MIT Licence.
// ----------------------------------------------------------------------------

import "./BluzelleTokenSale.sol";


contract BluzelleTokenSaleMock is BluzelleTokenSale {

   uint256 public _now;


   function BluzelleTokenSaleMock(address wallet, uint256 _currentTime) public
      BluzelleTokenSale(wallet)
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


