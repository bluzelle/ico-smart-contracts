pragma solidity ^0.4.17;

// ----------------------------------------------------------------------------
// BluzelleTokenSaleConfig - Token Sale Configuration
//
// Copyright (c) 2017 Bluzelle Networks Pte Ltd.
// http://www.bluzelle.com/
//
// The MIT Licence.
// ----------------------------------------------------------------------------

import "./BluzelleTokenConfig.sol";


contract BluzelleTokenSaleConfig is BluzelleTokenConfig {

    //
    // Time
    //

    uint256 public constant STAGE1_STARTTIME      = 1511870400; // 2017-11-28, 12:00:00 UTC
    uint256 public constant STAGE1_ENDTIME        = 1512043200; // 2017-11-30, 12:00:00 UTC


    //
    // Token Supply
    //
    uint256 public constant DECIMALSFACTOR        = 10**18;
    uint256 public constant TOKENS_TOTAL          = 500000000 * DECIMALSFACTOR;
    uint256 public constant TOKENS_SALE           = 200000000 * DECIMALSFACTOR;
    uint256 public constant TOKENS_FOUNDERS       = 50000000  * DECIMALSFACTOR;
    uint256 public constant TOKENS_PARTNERS       = 50000000  * DECIMALSFACTOR;
    uint256 public constant TOKENS_FUTURE         = 200000000 * DECIMALSFACTOR;


    //
    // Purchases
    //

    // Minimum amount of ETH that can be used for purchase.
    uint256 public constant CONTRIBUTION_MIN      = 0.1 ether;

    // Price of tokens, based on the 1 ETH = 1700 BLZ conversion ratio.
    uint256 public constant TOKENS_PER_KETHER     = 1700000;

    // Amount of bonus applied to the sale. 12000 = 20% bonus, 10750 = 7.5% bonus, 10000 = no bonus.
    uint256 public constant BONUS                 = 12000;

    // Maximum amount of tokens that can be purchased for each account.
    uint256 public constant TOKENS_ACCOUNT_MAX    = 17000 * DECIMALSFACTOR;
}

