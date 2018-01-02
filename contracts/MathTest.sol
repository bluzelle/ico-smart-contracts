pragma solidity ^0.4.17;

// ----------------------------------------------------------------------------
// MathTest - Simple wrapper contract to test the Math library
// Enuma Blockchain Framework
//
// Copyright (c) 2017 Enuma Technologies.
// http://www.enuma.io/
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
