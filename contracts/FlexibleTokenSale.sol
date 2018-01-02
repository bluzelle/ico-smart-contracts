pragma solidity ^0.4.17;

// ----------------------------------------------------------------------------
// FlexibleTokenSale - Token Sale Contract
// Enuma Blockchain Framework
//
// Copyright (c) 2017 Enuma Technologies.
// http://www.enuma.io/
// ----------------------------------------------------------------------------

import "./FinalizableToken.sol";
import "./Finalizable.sol";
import "./OpsManaged.sol";
import "./Math.sol";


contract FlexibleTokenSale is Finalizable, OpsManaged {

   using Math for uint256;

   //
   // Lifecycle
   //
   uint256 public startTime;
   uint256 public endTime;
   bool public suspended;

   //
   // Pricing
   //
   uint256 public tokensPerKEther;
   uint256 public bonus;
   uint256 public maxTokensPerAccount;
   uint256 public contributionMin;
   uint256 public tokenConversionFactor;

   //
   // Wallets
   //
   address public walletAddress;

   //
   // Token
   //
   FinalizableToken public token;

   //
   // Counters
   //
   uint256 public totalTokensSold;
   uint256 public totalEtherCollected;


   //
   // Events
   //
   event Initialized();
   event TokensPerKEtherUpdated(uint256 _newValue);
   event MaxTokensPerAccountUpdated(uint256 _newMax);
   event BonusUpdated(uint256 _newValue);
   event SaleWindowUpdated(uint256 _startTime, uint256 _endTime);
   event WalletAddressUpdated(address _newAddress);
   event SaleSuspended();
   event SaleResumed();
   event TokensPurchased(address _beneficiary, uint256 _cost, uint256 _tokens);
   event TokensReclaimed(uint256 _amount);


   function FlexibleTokenSale(uint256 _startTime, uint256 _endTime, address _walletAddress) public
      OpsManaged()
   {
      require(_endTime > _startTime);

      require(_walletAddress != address(0));
      require(_walletAddress != address(this));

      walletAddress = _walletAddress;

      finalized = false;
      suspended = false;

      startTime = _startTime;
      endTime   = _endTime;

      // Use some defaults config values. Classes deriving from FlexibleTokenSale
      // should set their own defaults
      tokensPerKEther     = 100000;
      bonus               = 10000;
      maxTokensPerAccount = 0;
      contributionMin     = 0.1 ether;

      totalTokensSold     = 0;
      totalEtherCollected = 0;
   }


   function currentTime() public constant returns (uint256) {
      return now;
   }


   // Initialize should be called by the owner as part of the deployment + setup phase.
   // It will associate the sale contract with the token contract and perform basic checks.
   function initialize(FinalizableToken _token) external onlyOwner returns(bool) {
      require(address(token) == address(0));
      require(address(_token) != address(0));
      require(address(_token) != address(this));
      require(address(_token) != address(walletAddress));
      require(isOwnerOrOps(address(_token)) == false);

      token = _token;

      // This factor is used when converting cost <-> tokens.
      // 18 is because of the ETH -> Wei conversion.
      // 3 because prices are in K ETH instead of just ETH.
      // 2 because bonuses are expressed as 10000 for no bonus, 12500 for 25%, etc.
      tokenConversionFactor = 10**(uint256(18).sub(_token.decimals()).add(3).add(4));
      require(tokenConversionFactor > 0);

      Initialized();

      return true;
   }


   //
   // Owner Configuation
   //

   // Allows the owner to change the wallet address which is used for collecting
   // ether received during the token sale.
   function setWalletAddress(address _walletAddress) external onlyOwner returns(bool) {
      require(_walletAddress != address(0));
      require(_walletAddress != address(this));
      require(_walletAddress != address(token));
      require(isOwnerOrOps(_walletAddress) == false);

      walletAddress = _walletAddress;

      WalletAddressUpdated(_walletAddress);

      return true;
   }


   // Allows the owner to set an optional limit on the amount of tokens that can be purchased
   // by a contributor. It can also be set to 0 to remove limit.
   function setMaxTokensPerAccount(uint256 _maxTokens) external onlyOwner returns(bool) {

      maxTokensPerAccount = _maxTokens;

      MaxTokensPerAccountUpdated(_maxTokens);

      return true;
   }


   // Allows the owner to specify the conversion rate for ETH -> tokens.
   // For example, passing 1,000,000 would mean that 1 ETH would purchase 1000 tokens.
   function setTokensPerKEther(uint256 _tokensPerKEther) external onlyOwner returns(bool) {
      require(_tokensPerKEther > 0);

      tokensPerKEther = _tokensPerKEther;

      TokensPerKEtherUpdated(_tokensPerKEther);

      return true;
   }


   // Allows the owner to set a bonus to apply to all purchases.
   // For example, setting it to 12000 means that instead of receiving 200 tokens,
   // for a given price, contributors would receive 240 tokens.
   function setBonus(uint256 _bonus) external onlyOwner returns(bool) {
      require(_bonus >= 10000);
      require(_bonus <= 20000);

      bonus = _bonus;

      BonusUpdated(_bonus);

      return true;
   }


   // Allows the owner to set a sale window which will allow the sale (aka buyTokens) to
   // receive contributions between _startTime and _endTime. Once _endTime is reached,
   // the sale contract will automatically stop accepting incoming contributions.
   function setSaleWindow(uint256 _startTime, uint256 _endTime) external onlyOwner returns(bool) {
      require(_startTime > 0);
      require(_endTime > _startTime);

      startTime = _startTime;
      endTime   = _endTime;

      SaleWindowUpdated(_startTime, _endTime);

      return true;
   }


   // Allows the owner to suspend the sale until it is manually resumed at a later time.
   function suspend() external onlyOwner returns(bool) {
      if (suspended == true) {
          return false;
      }

      suspended = true;

      SaleSuspended();

      return true;
   }


   // Allows the owner to resume the sale.
   function resume() external onlyOwner returns(bool) {
      if (suspended == false) {
          return false;
      }

      suspended = false;

      SaleResumed();

      return true;
   }


   //
   // Contributions
   //

   // Default payable function which can be used to purchase tokens.
   function () payable public {
      buyTokens(msg.sender);
   }


   function buyTokens(address beneficiary) public payable returns (bool) {
      require(!finalized);
      require(!suspended);
      require(currentTime() >= startTime);
      require(currentTime() <= endTime);
      require(msg.value >= contributionMin);
      require(beneficiary != address(0));
      require(beneficiary != address(this));
      require(beneficiary != address(token));

      // We don't want to allow the wallet collecting ETH to
      // directly be used to purchase tokens.
      require(msg.sender != address(walletAddress));

      // Check how many tokens are still available for sale.
      uint256 saleBalance = token.balanceOf(address(this));
      require(saleBalance > 0);

      // Calculate how many tokens the contributor could purchase based on ETH received.
      uint256 tokens = msg.value.mul(tokensPerKEther).mul(bonus).div(tokenConversionFactor);
      require(tokens > 0);

      uint256 cost = msg.value;
      uint256 refund = 0;

      // Calculate what is the maximum amount of tokens that the contributor
      // should be allowed to purchase
      uint256 maxTokens = saleBalance;

      if (maxTokensPerAccount > 0) {
         // There is a maximum amount of tokens per account in place.
         // Check if the user already hit that limit.
         uint256 userBalance = token.balanceOf(beneficiary);
         require(userBalance < maxTokensPerAccount);

         uint256 quotaBalance = maxTokensPerAccount.sub(userBalance);

         if (quotaBalance < saleBalance) {
            maxTokens = quotaBalance;
         }
      }

      require(maxTokens > 0);

      if (tokens > maxTokens) {
         // The contributor sent more ETH than allowed to purchase.
         // Limit the amount of tokens that they can purchase in this transaction.
         tokens = maxTokens;

         // Calculate the actual cost for that new amount of tokens.
         cost = tokens.mul(tokenConversionFactor).div(tokensPerKEther.mul(bonus));

         if (msg.value > cost) {
            // If the contributor sent more ETH than needed to buy the tokens,
            // the balance should be refunded.
            refund = msg.value.sub(cost);
         }
      }

      // This is the actual amount of ETH that can be sent to the wallet.
      uint256 contribution = msg.value.sub(refund);
      walletAddress.transfer(contribution);

      // Update our stats counters.
      totalTokensSold     = totalTokensSold.add(tokens);
      totalEtherCollected = totalEtherCollected.add(contribution);

      // Transfer tokens to the beneficiary.
      require(token.transfer(beneficiary, tokens));

      // Issue a refund for the excess ETH, as needed.
      if (refund > 0) {
         msg.sender.transfer(refund);
      }

      TokensPurchased(beneficiary, cost, tokens);

      return true;
   }


   // Allows the owner to take back the tokens that are assigned to the sale contract.
   function reclaimTokens() external onlyOwner returns (bool) {
      uint256 tokens = token.balanceOf(address(this));

      if (tokens == 0) {
         return false;
      }

      address tokenOwner = token.owner();
      require(tokenOwner != address(0));

      require(token.transfer(tokenOwner, tokens));

      TokensReclaimed(tokens);

      return true;
   }
}

