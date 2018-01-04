// ----------------------------------------------------------------------------
// Standard Contract Testing Utility Library
// Enuma Blockchain Platform
//
// Copyright (c) 2017 Enuma Technologies.
// https://www.enuma.io/
// ----------------------------------------------------------------------------


const TestLib = require('../../../tools/testlib.js')


module.exports.tokensFromWei = function (tokensPerKEther, weiAmount, bonus) {
   return tokensFromWei(tokensPerKEther, weiAmount, bonus)
}


function tokensFromWei(tokensPerKEther, weiAmount, bonus) {
   return weiAmount.mul(tokensPerKEther).mul(bonus.add(10000)).div(1000).div(10000)
}


module.exports.weiFromTokens = function (tokensPerKEther, tokenAmount, bonus) {
   return weiFromTokens(tokensPerKEther, tokenAmount, bonus)
}


function weiFromTokens(tokensPerKEther, tokenAmount, bonus) {
   return tokenAmount.mul(1000).mul(10000).div(tokensPerKEther.mul(bonus.add(10000)))
}


module.exports.checkTransfer = (receipt, from, to, value) => {

   TestLib.checkStatus(receipt)

   assert.equal(Object.keys(receipt.events).length, 1)
   assert.equal(typeof receipt.events.Transfer, 'object')
   const eventArgs = receipt.events.Transfer.returnValues
   assert.equal(Object.keys(eventArgs).length, 6)
   assert.equal(eventArgs._from, from)
   assert.equal(eventArgs._to, to)
   assert.equal(new BigNumber(eventArgs._value), value)
}


module.exports.checkApprove = (receipt, owner, spender, value) => {

   TestLib.checkStatus(receipt)

   assert.equal(Object.keys(receipt.events).length, 1)
   assert.equal(typeof receipt.events.Approval, 'object')
   const eventArgs = receipt.events.Approval.returnValues
   assert.equal(Object.keys(eventArgs).length, 6)
   assert.equal(eventArgs._owner, owner)
   assert.equal(eventArgs._spender, spender)
   assert.equal(new BigNumber(eventArgs._value), value)
}


module.exports.checkInitiateOwnershipTransfer = (receipt, proposedOwner) => {

   TestLib.checkStatus(receipt)

   assert.equal(Object.keys(receipt.events).length, 1)
   assert.equal(typeof receipt.events.OwnershipTransferInitiated, 'object')
   const eventArgs = receipt.events.OwnershipTransferInitiated.returnValues
   assert.equal(Object.keys(eventArgs).length, 2)
   assert.equal(eventArgs._proposedOwner, proposedOwner)
}


module.exports.checkCompleteOwnershipTransfer = (receipt, newOwner) => {

   TestLib.checkStatus(receipt)

   assert.equal(Object.keys(receipt.events).length, 1)
   assert.equal(typeof receipt.events.OwnershipTransferCompleted, 'object')
   const eventArgs = receipt.events.OwnershipTransferCompleted.returnValues
   assert.equal(Object.keys(eventArgs).length, 2)
   assert.equal(eventArgs._newOwner, newOwner)
}


module.exports.checkSetOpsAddress = (receipt, newAddress) => {

   TestLib.checkStatus(receipt)

   assert.equal(Object.keys(receipt.events).length, 1)
   assert.equal(typeof receipt.events.OpsAddressUpdated, 'object')
   const eventArgs = receipt.events.OpsAddressUpdated.returnValues
   assert.equal(Object.keys(eventArgs).length, 2)
   assert.equal(eventArgs._newAddress, newAddress)
}


module.exports.checkSetWalletAddress = (receipt, newAddress) => {

   TestLib.checkStatus(receipt)

   assert.equal(Object.keys(receipt.events).length, 1)
   assert.equal(typeof receipt.events.WalletAddressUpdated, 'object')
   const eventArgs = receipt.events.WalletAddressUpdated.returnValues
   assert.equal(Object.keys(eventArgs).length, 2)
   assert.equal(eventArgs._newAddress, newAddress)
}


module.exports.checkSetMaxTokensPerAccount = (receipt, newMax) => {

   TestLib.checkStatus(receipt)

   assert.equal(Object.keys(receipt.events).length, 1)
   assert.equal(typeof receipt.events.MaxTokensPerAccountUpdated, 'object')
   const eventArgs = receipt.events.MaxTokensPerAccountUpdated.returnValues
   assert.equal(Object.keys(eventArgs).length, 2)
   assert.equal(new BigNumber(eventArgs._newMax), newMax)
}


module.exports.checkSetTokensPerKEther = (receipt, newValue) => {

   TestLib.checkStatus(receipt)

   assert.equal(Object.keys(receipt.events).length, 1)
   assert.equal(typeof receipt.events.TokensPerKEtherUpdated, 'object')
   const eventArgs = receipt.events.TokensPerKEtherUpdated.returnValues
   assert.equal(Object.keys(eventArgs).length, 2)
   assert.equal(new BigNumber(eventArgs._newValue), newValue)
}


module.exports.checkSetBonus = (receipt, newValue) => {

   TestLib.checkStatus(receipt)

   assert.equal(Object.keys(receipt.events).length, 1)
   assert.equal(typeof receipt.events.BonusUpdated, 'object')
   const eventArgs = receipt.events.BonusUpdated.returnValues
   assert.equal(Object.keys(eventArgs).length, 2)
   assert.equal(eventArgs._newValue, newValue)
}


module.exports.checkSetSaleWindow = (receipt, startTime, endTime) => {

   TestLib.checkStatus(receipt)

   assert.equal(Object.keys(receipt.events).length, 1)
   assert.equal(typeof receipt.events.SaleWindowUpdated, 'object')
   const eventArgs = receipt.events.SaleWindowUpdated.returnValues
   assert.equal(Object.keys(eventArgs).length, 4)
   assert.equal(eventArgs._startTime, startTime)
   assert.equal(eventArgs._endTime, endTime)
}


module.exports.checkSuspend = (receipt) => {

   TestLib.checkStatus(receipt)

   assert.equal(Object.keys(receipt.events).length, 1)
   assert.equal(typeof receipt.events.SaleSuspended, 'object')
   const eventArgs = receipt.events.SaleSuspended.returnValues
   assert.equal(Object.keys(eventArgs).length, 0)
}


module.exports.checkResumed = (receipt) => {

   TestLib.checkStatus(receipt)

   assert.equal(Object.keys(receipt.events).length, 1)
   assert.equal(typeof receipt.events.SaleResumed, 'object')
   const eventArgs = receipt.events.SaleResumed.returnValues
   assert.equal(Object.keys(eventArgs).length, 0)
}


module.exports.checkInitialize = (receipt) => {

   TestLib.checkStatus(receipt)

   assert.equal(Object.keys(receipt.events).length, 1)
   assert.equal(typeof receipt.events.Initialized, 'object')
   const eventArgs = receipt.events.Initialized.returnValues
   assert.equal(Object.keys(eventArgs).length, 0)
}


module.exports.checkFinalize = (receipt) => {

   TestLib.checkStatus(receipt)

   assert.equal(Object.keys(receipt.events).length, 1)
   assert.equal(typeof receipt.events.Finalized, 'object')
   const eventArgs = receipt.events.Finalized.returnValues
   assert.equal(Object.keys(eventArgs).length, 0)
}

module.exports.checkReclaimTokens = (receipt, amount) => {

   TestLib.checkStatus(receipt)

   assert.equal(Object.keys(receipt.events).length, 2)
   assert.equal(typeof receipt.events.TokensReclaimed, 'object')
   const eventArgs = receipt.events.TokensReclaimed.returnValues
   assert.equal(Object.keys(eventArgs).length, 2)
   assert.equal(new BigNumber(eventArgs._amount), amount)
}


module.exports.checkBuyTokens = (receipt, from, to, cost, tokens) => {
   return checkBuyTokens(receipt, from, to, cost, tokens)
}


function checkBuyTokens(receipt, from, to, cost, tokens) {

   TestLib.checkStatus(receipt)

   assert.equal(Object.keys(receipt.events).length, 2)
   assert.equal(typeof receipt.events.TokensPurchased, 'object')
   const eventArgs = receipt.events.TokensPurchased.returnValues
   assert.equal(Object.keys(eventArgs).length, 6)
   assert.equal(eventArgs._beneficiary, to)
   assert.equal(new BigNumber(eventArgs._cost), cost)
   assert.equal(new BigNumber(eventArgs._tokens), tokens)
}


module.exports.checkSetDefaultStartTime = (receipt, startTime) => {

   TestLib.checkStatus(receipt)

   assert.equal(Object.keys(receipt.events).length, 1)
   assert.equal(typeof receipt.events.DefaultStartTimeUpdated, 'object')
   const eventArgs = receipt.events.DefaultStartTimeUpdated.returnValues
   assert.equal(Object.keys(eventArgs).length, 2)
   assert.equal(eventArgs._startTime, startTime)
}


module.exports.checkGrantAllocation = (receipt, beneficiary, amount, startTime, cliffTimeDelta, endTimeDelta, interval, revokable) => {

   TestLib.checkStatus(receipt)

   assert.equal(Object.keys(receipt.events).length, 1)
   assert.equal(typeof receipt.events.AllocationGranted, 'object')
   const eventArgs = receipt.events.AllocationGranted.returnValues
   assert.equal(Object.keys(eventArgs).length, 14)
   assert.equal(eventArgs._beneficiary, beneficiary)
   assert.equal(new BigNumber(eventArgs._amount), amount)
   assert.equal(eventArgs._startTime, startTime)
   assert.equal(eventArgs._cliffTimeDelta, cliffTimeDelta)
   assert.equal(eventArgs._endTimeDelta, endTimeDelta)
   assert.equal(eventArgs._interval, interval)

   // WORKAROUND since Web3 gives us false as a null
   if (revokable == true) {
      assert.equal(eventArgs._revokable, revokable)
   } else {
      assert.isTrue(eventArgs._revokable == null || eventArgs._revokable == false)
   }
}


module.exports.checkRevokeAllocation = (receipt, beneficiary, amountUnlocked) => {

   TestLib.checkStatus(receipt)

   assert.equal(Object.keys(receipt.events).length, 1)
   assert.equal(typeof receipt.events.AllocationRevoked, 'object')
   const eventArgs = receipt.events.AllocationRevoked.returnValues
   assert.equal(Object.keys(eventArgs).length, 4)
   assert.equal(eventArgs._beneficiary, beneficiary)
   assert.equal(new BigNumber(eventArgs._amountUnlocked), amountUnlocked)
}


module.exports.checkProcessAllocation = (receipt, beneficiary, amountTransferred) => {

   TestLib.checkStatus(receipt)

   assert.equal(Object.keys(receipt.events).length, 1)
   assert.equal(typeof receipt.events.AllocationProcessed, 'object')
   const eventArgs = receipt.events.AllocationProcessed.returnValues
   assert.equal(Object.keys(eventArgs).length, 4)
   assert.equal(eventArgs._beneficiary, beneficiary)
   assert.equal(new BigNumber(eventArgs._amountTransferred), amountTransferred)
}


module.exports.checkClaimAllocation = (receipt, beneficiary, amountTransferred) => {

   TestLib.checkStatus(receipt)

   assert.equal(Object.keys(receipt.events).length, 1)
   assert.equal(typeof receipt.events.AllocationClaimed, 'object')
   const eventArgs = receipt.events.AllocationClaimed.returnValues
   assert.equal(Object.keys(eventArgs).length, 4)
   assert.equal(eventArgs._beneficiary, beneficiary)
   assert.equal(new BigNumber(eventArgs._amountTransferred), amountTransferred)
}


module.exports.buyTokens = async (token, sale, owner, wallet, DECIMALS_FACTOR, from, to, amount) => {

   //
   // Capture state before purchase
   //
   const saleTokensBefore          = new BigNumber(await token.methods.balanceOf(sale._address).call())
   const fromTokensBefore          = new BigNumber(await token.methods.balanceOf(from).call())
   const toTokensBefore            = new BigNumber(await token.methods.balanceOf(to).call())

   const saleEthBefore             = new BigNumber(await TestLib.getBalance(sale._address))
   const fromEthBefore             = new BigNumber(await TestLib.getBalance(from))
   const toEthBefore               = new BigNumber(await TestLib.getBalance(to))
   const walletEthBefore           = new BigNumber(await TestLib.getBalance(wallet))

   const totalTokensSoldBefore     = new BigNumber(await sale.methods.totalTokensSold().call())
   const totalEtherCollectedBefore = new BigNumber(await sale.methods.totalEtherCollected().call())

   const bonus                     = new BigNumber(await sale.methods.bonus().call())

   var   tokensPerKEther           = new BigNumber(await sale.methods.tokensPerKEther().call())
   const maxTokensPerAccount       = new BigNumber(await sale.methods.maxTokensPerAccount().call())

   const gasPrice                  = await web3.eth.getGasPrice()


   //
   // Calculate costs, tokens, refund
   //
   var expectedTokens = null
   var expectedTokenCost = null
   var transferAmount = null

   var maxTokens = saleTokensBefore
   if (maxTokensPerAccount.gt(0)) {
      if (maxTokensPerAccount.lt(saleTokensBefore)) {
         maxTokens = maxTokensPerAccount
      }

      const quotaLeft = maxTokensPerAccount.sub(toTokensBefore)

      if (quotaLeft.gt(0) && quotaLeft.lt(maxTokens)) {
         maxTokens = quotaLeft
      }
   }

   if (amount == -1) {
      // Set the token price to that we can buy everything with 1 ETH, to make it easier for testing
      tokensPerKEther = maxTokens.mul(1000).div(DECIMALS_FACTOR).trunc()

      if (tokensPerKEther.eq(0)) {
         tokensPerKEther = new BigNumber(1)
      }

      await sale.methods.setTokensPerKEther(tokensPerKEther).send({ from: owner })

      // Send 2 ETH to make sure we send way over the cost for purchasing the entire window
      transferAmount = new BigNumber(web3.utils.toWei('2', 'ether'))

      expectedTokens    = maxTokens
      expectedTokenCost = weiFromTokens(tokensPerKEther, expectedTokens, bonus).trunc()
   } else {
      transferAmount    = amount
      expectedTokens    = tokensFromWei(tokensPerKEther, transferAmount, bonus).trunc()

      if (expectedTokens.gt(maxTokens)) {
         expectedTokens    = maxTokens
         expectedTokenCost = weiFromTokens(tokensPerKEther, expectedTokens, bonus).trunc()
      } else {
         expectedTokenCost = transferAmount
      }
   }


   //
   // Purchase the tokens
   //
   assert.equal(new BigNumber(await sale.methods.buyTokens(to).call({ from: from, value: transferAmount, gasPrice: gasPrice })), expectedTokens)
   const receipt = await sale.methods.buyTokens(to).send({ from: from, value: transferAmount, gasPrice: gasPrice })

   //
   // Capture state after purchase
   //
   const saleTokensAfter          = new BigNumber(await token.methods.balanceOf(sale._address).call())
   const fromTokensAfter          = new BigNumber(await token.methods.balanceOf(from).call())
   const toTokensAfter            = new BigNumber(await token.methods.balanceOf(to).call())

   const saleEthAfter             = new BigNumber(await TestLib.getBalance(sale._address))
   const fromEthAfter             = new BigNumber(await TestLib.getBalance(from))
   const toEthAfter               = new BigNumber(await TestLib.getBalance(to))
   const walletEthAfter           = new BigNumber(await TestLib.getBalance(wallet))

   const totalTokensSoldAfter     = new BigNumber(await sale.methods.totalTokensSold().call())
   const totalEtherCollectedAfter = new BigNumber(await sale.methods.totalEtherCollected().call())


   //
   // Validate state change
   //
   assert.equal(saleTokensAfter.sub(saleTokensBefore), expectedTokens.mul(-1))

   if (from !== to) {
      assert.equal(fromTokensAfter.sub(fromTokensBefore), new BigNumber(0))
      assert.equal(toTokensAfter.sub(toTokensBefore), expectedTokens)
   } else {
      assert.equal(toTokensAfter.sub(toTokensBefore), expectedTokens)
   }

   assert.equal(totalTokensSoldAfter.sub(totalTokensSoldBefore), expectedTokens)
   assert.equal(totalEtherCollectedAfter.sub(totalEtherCollectedBefore), expectedTokenCost)

   const fromEthSpent     = fromEthBefore.sub(fromEthAfter)
   const gasUsed          = new BigNumber(receipt.gasUsed)
   const expectedEthSpent = expectedTokenCost.add(gasUsed.mul(gasPrice))
   assert.equal(fromEthSpent, expectedEthSpent)

   if (from !== to && to != wallet) {
      assert.equal(toEthAfter.sub(toEthBefore), new BigNumber(0))
   }

   assert.equal(walletEthAfter.sub(walletEthBefore), expectedTokenCost)


   //
   // Validate events
   //
   checkBuyTokens(receipt, from, to, expectedTokenCost, expectedTokens)
}

