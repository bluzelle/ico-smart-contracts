pragma solidity ^0.4.18;

// ----------------------------------------------------------------------------
// MathTest - Simple wrapper contract to test the Math library
// Enuma Blockchain Platform
//
// Copyright (c) 2017 Enuma Technologies.
// https://www.enuma.io/
// ----------------------------------------------------------------------------


import "./Math.sol";


contract MathTest {

   using Math for uint256;


   function MathTest() public
   {
   }


   function add(uint256 a, uint256 b) public pure returns (uint256) {
      return a.add(b);
   }


   function sub(uint256 a, uint256 b) public pure returns (uint256) {
      return a.sub(b);
   }


   function mul(uint256 a, uint256 b) public pure returns (uint256) {
      return a.mul(b);
   }


   function div(uint256 a, uint256 b) public pure returns (uint256) {
      return a.div(b);
   }
}
