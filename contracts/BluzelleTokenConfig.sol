pragma solidity ^0.4.18;

// ----------------------------------------------------------------------------
// BluzelleTokenConfig - Token Contract Configuration
//
// Copyright (c) 2017 Bluzelle Networks Pte Ltd.
// http://www.bluzelle.com/
//
// The MIT Licence.
// ----------------------------------------------------------------------------


contract BluzelleTokenConfig {

    string  public constant TOKEN_SYMBOL      = "BLZ";
    string  public constant TOKEN_NAME        = "Bluzelle Token";
    uint8   public constant TOKEN_DECIMALS    = 18;

    uint256 public constant DECIMALSFACTOR    = 10**uint256(TOKEN_DECIMALS);
    uint256 public constant TOKEN_TOTALSUPPLY = 500000000 * DECIMALSFACTOR;
}

