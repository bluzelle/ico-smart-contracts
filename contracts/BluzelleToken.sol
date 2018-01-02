pragma solidity ^0.4.17;

// ----------------------------------------------------------------------------
// BluzelleToken - ERC20 Compatible Token
//
// Copyright (c) 2017 Bluzelle Networks Pte Ltd.
// http://www.bluzelle.com/
//
// The MIT Licence.
// ----------------------------------------------------------------------------

import "./FinalizableToken.sol";
import "./BluzelleTokenConfig.sol";


// ----------------------------------------------------------------------------
// The Bluzelle token is a standard ERC20 token with the addition of a few
// concepts such as:
//
// 1. Finalization
// Tokens can only be transfered by contributors after the contract has
// been finalized.
//
// 2. Ops Managed Model
// In addition to owner, there is a ops role which is used during the sale,
// by the sale contract, in order to transfer tokens.
// ----------------------------------------------------------------------------
contract BluzelleToken is FinalizableToken, BluzelleTokenConfig {

   function BluzelleToken() public
      FinalizableToken(TOKEN_NAME, TOKEN_SYMBOL, TOKEN_DECIMALS, TOKEN_TOTALSUPPLY)
   {
   }
}

