pragma solidity ^0.4.18;

// ----------------------------------------------------------------------------
// BluzelleTokenSale - Token Sale Contract
//
// Copyright (c) 2017 Bluzelle Networks Pte Ltd.
// http://www.bluzelle.com/
//
// The MIT Licence.
// ----------------------------------------------------------------------------

import "./Enuma/FlexibleTokenSale.sol";
import "./BluzelleTokenSaleConfig.sol";


contract BluzelleTokenSale is FlexibleTokenSale, BluzelleTokenSaleConfig {

   //
   // Whitelist
   //

   // This is the stage or whitelist group that is currently in effect.
   // Everybody that's been whitelisted for earlier stages should be able to
   // contribute in the current stage.
   uint256 public currentStage;

   // Keeps track of the amount of bonus to apply for a given stage. If set
   // to 0, the base class bonus will be used.
   mapping(uint256 => uint256) public stageBonus;

   // Keeps track of the amount of tokens that a specific account has received.
   mapping(address => uint256) public accountTokensPurchased;

   // This a mapping of address -> stage that they are allowed to participate in.
   // For example, if someone has been whitelisted for stage 2, they will be able
   // to participate for stages 2 and above but they would not be able to participate
   // in stage 1. A stage value of 0 means that the participant is not whitelisted.
   mapping(address => uint256) public whitelist;


   //
   // Events
   //
   event CurrentStageUpdated(uint256 _newStage);
   event StageBonusUpdated(uint256 _stage, uint256 _bonus);
   event WhitelistedStatusUpdated(address indexed _address, uint256 _stage);


   function BluzelleTokenSale(address wallet) public
      FlexibleTokenSale(INITIAL_STARTTIME, INITIAL_ENDTIME, wallet)
   {
      currentStage        = INITIAL_STAGE;
      tokensPerKEther     = TOKENS_PER_KETHER;
      bonus               = BONUS;
      maxTokensPerAccount = TOKENS_ACCOUNT_MAX;
      contributionMin     = CONTRIBUTION_MIN;
   }


   // Allows the admin to determine what is the current stage for
   // the sale. It can only move forward.
   function setCurrentStage(uint256 _stage) public onlyOwner returns(bool) {
      require(_stage > 0);

      if (currentStage == _stage) {
         return false;
      }

      currentStage = _stage;

      CurrentStageUpdated(_stage);

      return true;
   }


   // Allows the admin to set a bonus amount to apply for a specific stage.
   function setStageBonus(uint256 _stage, uint256 _bonus) public onlyOwner returns(bool) {
      require(_stage > 0);
      require(_bonus <= 10000);

      if (stageBonus[_stage] == _bonus) {
         // Nothing to change.
         return false;
      }

      stageBonus[_stage] = _bonus;

      StageBonusUpdated(_stage, _bonus);

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
   function setWhitelistedBatch(address[] _addresses, uint256 _stage) public onlyOwnerOrOps returns (bool) {
      require(_addresses.length > 0);

      for (uint256 i = 0; i < _addresses.length; i++) {
         require(setWhitelistedStatusInternal(_addresses[i], _stage));
      }

      return true;
   }


   // This is an extension to the buyToken function in FlexibleTokenSale which also takes
   // care of checking contributors against the whitelist. Since buyTokens supports proxy payments
   // we check that both the sender and the beneficiary have been whitelisted.
   function buyTokensInternal(address _beneficiary, uint256 _bonus) internal returns (uint256) {
      require(whitelist[msg.sender] > 0);
      require(whitelist[_beneficiary] > 0);
      require(currentStage >= whitelist[msg.sender]);

      uint256 _beneficiaryStage = whitelist[_beneficiary];
      require(currentStage >= _beneficiaryStage);

      uint256 applicableBonus = stageBonus[_beneficiaryStage];
      if (applicableBonus == 0) {
         applicableBonus = _bonus;
      }

      uint256 tokensPurchased = super.buyTokensInternal(_beneficiary, applicableBonus);

      accountTokensPurchased[_beneficiary] = accountTokensPurchased[_beneficiary].add(tokensPurchased);

      return tokensPurchased;
   }


   // Returns the number of tokens that the user has purchased. We keep a separate balance from
   // the token contract in case we'd like to do additional sales with new purchase limits.
   function getUserTokenBalance(address _beneficiary) internal view returns (uint256) {
      return accountTokensPurchased[_beneficiary];
   }
}

