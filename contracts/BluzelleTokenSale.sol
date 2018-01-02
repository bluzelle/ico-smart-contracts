pragma solidity ^0.4.17;

// ----------------------------------------------------------------------------
// BluzelleTokenSale - Token Sale Contract
//
// Copyright (c) 2017 Bluzelle Networks Pte Ltd.
// http://www.bluzelle.com/
//
// The MIT Licence.
// ----------------------------------------------------------------------------

import "./FlexibleTokenSale.sol";
import "./BluzelleTokenSaleConfig.sol";


contract BluzelleTokenSale is FlexibleTokenSale, BluzelleTokenSaleConfig {

   //
   // Whitelist
   //

   // This is the stage or whitelist group that is currently in effect.
   // Everybody that's been whitelisted for earlier stages should be able to
   // contribute in the current stage.
   uint256 public currentStage;

   // This a mapping of address -> stage that they are allowed to participate in.
   // For example, if someone has been whitelisted for stage 2, they will be able
   // to participate for stages 2 and above but they would not be able to participate
   // in stage 1. A stage value of 0 means that the participant is not whitelisted.
   mapping(address => uint256) public whitelist;


   //
   // Events
   //
   event CurrentStageUpdated(uint256 _newStage);
   event WhitelistedStatusUpdated(address indexed _address, uint256 _stage);


   function BluzelleTokenSale(address wallet) public
      FlexibleTokenSale(STAGE1_STARTTIME, STAGE1_ENDTIME, wallet)
   {
      currentStage        = 1;
      tokensPerKEther     = TOKENS_PER_KETHER;
      bonus               = BONUS;
      maxTokensPerAccount = TOKENS_ACCOUNT_MAX;
      contributionMin     = CONTRIBUTION_MIN;
   }


   // Allows the admin to determine what is the current stage for
   // the sale. It can only move forward.
   function setCurrentStage(uint256 _stage) public onlyOwner returns(bool) {
      require(_stage >= currentStage);

      if (currentStage == _stage) {
         return false;
      }

      currentStage = _stage;

      CurrentStageUpdated(_stage);

      return true;
   }


   // Allows the owner or ops to add/remove people from the whitelist.
   function setWhitelistedStatus(address _address, uint256 _stage) public onlyOwnerOrOps returns (bool) {
      return setWhitelistedStatusInternal(_address, _stage);
   }


   function setWhitelistedStatusInternal(address _address, uint256 _stage) private returns (bool) {
      require(_address != address(0));
      require(_address != address(this));
      require(_address != walletAddress);

      whitelist[_address] = _stage;

      WhitelistedStatusUpdated(_address, _stage);

      return true;
   }


   // Allows the owner or ops to add/remove people from the whitelist, in batches. This makes
   // it easier/cheaper/faster to upload whitelist data in bulk. Note that the function is using an
   // unbounded loop so the call should take care to not exceed the tx gas limit or block gas limit.
   function setWhitelistedBatch(address[] _addresses, uint256[] _stages) public onlyOwnerOrOps returns (bool) {
      require(_addresses.length > 0);
      require(_addresses.length == _stages.length);

      for (uint256 i = 0; i < _addresses.length; i++) {
         require(setWhitelistedStatusInternal(_addresses[i], _stages[i]));
      }

      return true;
   }


   // This is an extension to the buyToken function in FlexibleTokenSale which also takes
   // care of checking contributors against the whitelist. Since buyTokens supports proxy payments
   // we check that both the sender and the beneficiary have been whitelisted.
   function buyTokens(address beneficiary) public payable returns (bool) {
      require(whitelist[msg.sender] > 0);
      require(whitelist[beneficiary] > 0);
      require(currentStage >= whitelist[msg.sender]);
      require(currentStage >= whitelist[beneficiary]);

      return super.buyTokens(beneficiary);
   }
}

