pragma solidity ^0.4.17;

// ----------------------------------------------------------------------------
// Finalizable - Basic implementation of the finalization pattern
// Enuma Blockchain Framework
//
// Copyright (c) 2017 Enuma Technologies.
// http://www.enuma.io/
// ----------------------------------------------------------------------------


import "./Owned.sol";


contract Finalizable is Owned {

   bool public finalized;

   event Finalized();


   function Finalizable() public
      Owned()
   {
      finalized = false;
   }


   function finalize() public onlyOwner returns (bool) {
      require(!finalized);

      finalized = true;

      Finalized();

      return true;
   }
}
