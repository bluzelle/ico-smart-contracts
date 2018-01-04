// ----------------------------------------------------------------------------
// FlexibleTokenSale Contract Tests
// Enuma Blockchain Platform
//
// Copyright (c) 2017 Enuma Technologies.
// https://www.enuma.io/
// ----------------------------------------------------------------------------

const Utils = require('./lib/StdTestUtils.js')


// ----------------------------------------------------------------------------
// Tests Summary
// ----------------------------------------------------------------------------
// Construction and basic properties
//    - startTime
//    - endTime
//    - suspended
//    - tokensPerKEther
//    - bonus
//    - maxTokensPerAccount
//    - contributionMin
//    - walletAddress
//    - token
//    - totalTokensSold
//    - totalEtherCollected
//    - finalized (inherited)
//    - opsAddress (inherited)
//    - owner (inherited)
//    - proposedOwner (inherited)
// isOwner (inherited)
//    - isOwner(owner)
//    - isOwner(ops)
//    - isOwner(normal)
// isOwnerOrOps (inherited)
//    - isOwnerOrOps(owner)
//    - isOwnerOrOps(ops)
//    - isOwnerOrOps(normal)
// isOps (inherited)
//    - isOps(owner)
//    - isOps(ops)
//    - isOps(normal)
// currentTime
//    - is same as now
//    - changeTime does not exist (mock only)
// initialize
//    - initialize(0)
//    - initialize(this)
//    - initialize(owner)
//    - initialize(ops)
//    - initialize(wallet)
//    - initialize as normal
//    - initialize as ops
//    - initialize as owner
// setWalletAddress
//    - setWalletAddress(0)
//    - setWalletAddress(this)
//    - setWalletAddress(owner)
//    - setWalletAddress(ops)
//    - setWalletAddress(wallet)
//    - setWalletAddress(token)
//    - setWalletAddress as normal
//    - setWalletAddress as ops
//    - setWalletAddress as owner
// setMaxTokensPerAccount
//    - setMaxTokensPerAccount(0)
//    - setMaxTokensPerAccount(1)
//    - setMaxTokensPerAccount(100,000,000 * 10**18)
//    - setMaxTokensPerAccount as ops
//    - setMaxTokensPerAccount as normal
// setTokensPerKEther
//    - setTokensPerKEther(0)
//    - setTokensPerKEther(1)
//    - setTokensPerKEther(100,000,000 * 10**18)
//    - setTokensPerKEther as ops
//    - setTokensPerKEther as normal
// setBonus
//    - setBonus(0)
//    - setBonus(750)
//    - setBonus(1500)
//    - setBonus(10000)
//    - setBonus(10001)
//    - setBonus as ops
//    - setBonus as normal
// setSaleWindow
//    - setSaleWindow(0, 0)
//    - setSaleWindow(0, 1)
//    - setSaleWindow(1, 2)
//    - setSaleWindow(now - 1000, now - 500)
//    - setSaleWindow(now, now)
//    - setSaleWindow(now, now + 1)
//    - setSaleWindow(now + 1 month, now + 2 months)
//    - setSaleWindow as ops
//    - setSaleWindow as normal
// setOpsAddress (inherited)
//    - setOpsAddress(0)
//    - setOpsAddress(this)
//    - setOpsAddress(owner)
//    - setOpsAddress(other account), as normal
//    - setOpsAddress(other account), as ops
//    - setOpsAddress(other account), as owner
//    - setOpsAddress(other account) and then set owner to other account
// initiateOwnershipTransfer / completeOwnershipTransfer (inherited)
//    - initiateOwnershipTransfer(0)
//    - initiateOwnershipTransfer(this)
//    - initiateOwnershipTransfer(owner) / completeOwnershipTransfer
//    - initiateOwnershipTransfer(ops) / completeOwnershipTransfer
//    - initiateOwnershipTransfer(other account) / completeOwnershipTransfer
//    - initiateOwnershipTransfer as ops
//    - initiateOwnershipTransfer as normal
// suspend and resume
//    - suspend / resume before sale
//    - suspend / resume during sale
//    - suspend / resume after sale
//    - suspend before sale, resume during sale
//    - suspend during sale, resume after sale
//    - suspend when suspended
//    - resumed when resumed
//    - suspend / resume as ops
//    - suspend / resume as owner
// default payable function
// buyTokens
//    * see _buyTokens.js tests.
// finalize
//    - finalize as normal
//    - finalize as ops
//    - finalize as owner
// reclaimTokens
//    - before finalize
//       - reclaimTokens as owner
//    - after finalize
//       - reclaimTokens as normal
//       - reclaimTokens as ops
//       - reclaimTokens as owner
//       - reclaimTokens as owner when 0 balance
// Events
//    - Initialized
//    - TokensPerKEtherUpdated
//    - MaxTokensPerAccountUpdated
//    - BonusUpdated
//    - SaleSuspended
//    - SaleResumed
//    - SaleWindowUpdated
//    - TokensPurchased
//    - TokensReclaimed
//    - WalletAddressUpdated
//    - OpsAddress changed (inherited)
//    - OwnershipTransferInitiated (inherited)
//    - OwnershipTransferCompleted (inherited)
//    - Finalized (inherited)
//       * Covered when appropriate in the different function tests.
//
describe('FlexibleTokenSale Contract', () => {

   const TOKEN_NAME        = "A"
   const TOKEN_SYMBOL      = "B"
   const TOKEN_DECIMALS    = 18
   const DECIMALS_FACTOR   = new BigNumber(10).pow(TOKEN_DECIMALS)
   const TOKEN_TOTALSUPPLY = new BigNumber("1000000").mul(DECIMALS_FACTOR)

   const DEFAULT_TOKENSPERKETHER = 100000
   const DEFAULT_BONUS = 0

   const START_TIME        = Moment().add(1, 'M').unix()
   const END_TIME          = Moment().add(2, 'M').unix()

   var sale = null
   var token = null
   var accounts = null

   // Accounts used for testing
   var owner    = null
   var ops      = null
   var wallet   = null
   var account1 = null
   var account2 = null


   before(async () => {
      await TestLib.initialize()

      accounts = await web3.eth.getAccounts()

      owner    = accounts[1]
      ops      = accounts[2]
      wallet   = accounts[3]
      account1 = accounts[4]
      account2 = accounts[5]

      var deploymentResult = null

      deploymentResult = await TestLib.deploy('FinalizableToken', [ TOKEN_NAME, TOKEN_SYMBOL, TOKEN_DECIMALS, TOKEN_TOTALSUPPLY ], { from: owner })
      token = deploymentResult.instance

      deploymentResult = await TestLib.deploy('FlexibleTokenSale', [ START_TIME, END_TIME, wallet ], { from: owner })
      sale = deploymentResult.instance

      await token.methods.transfer(sale._address, 1000).send({ from: owner })
   })


   context('Construction and basic properties', async () => {

      it('startTime', async () => {
         assert.equal(await sale.methods.startTime().call(), START_TIME)
      })

      it('endTime', async () => {
         assert.equal(await sale.methods.endTime().call(), END_TIME)
      })

      it('suspended', async () => {
         assert.equal(await sale.methods.suspended().call(), false)
      })

      it('tokensPerKEther', async () => {
         assert.equal(await sale.methods.tokensPerKEther().call(), DEFAULT_TOKENSPERKETHER)
      })

      it('bonus', async () => {
         assert.equal(await sale.methods.bonus().call(), DEFAULT_BONUS)
      })

      it('maxTokensPerAccount', async () => {
         assert.equal(await sale.methods.maxTokensPerAccount().call(), 0)
      })

      it('contributionMin', async () => {
         assert.equal(await sale.methods.contributionMin().call(), web3.utils.toWei('0.1', 'ether'))
      })

      it('walletAddress', async () => {
         assert.equal(await sale.methods.walletAddress().call(), wallet)
      })

      it('token', async () => {
         assert.equal(await sale.methods.token().call(), 0)
      })

      it('totalTokensSold', async () => {
         assert.equal(await sale.methods.totalTokensSold().call(), 0)
      })

      it('totalEtherCollected', async () => {
         assert.equal(await sale.methods.totalEtherCollected().call(), 0)
      })

      it('finalized', async () => {
         assert.equal(await sale.methods.finalized().call(), false)
      })

      it('opsAddress', async () => {
         assert.equal(await sale.methods.opsAddress().call(), 0)
      })

      it('owner', async () => {
         assert.equal(await sale.methods.owner().call(), owner)
      })

      it('proposedOwner', async () => {
         assert.equal(await sale.methods.proposedOwner().call(), 0)
      })
   })


   context('isOwner (inherited)', async () => {

      before(async () => {
         assert.equal(await sale.methods.opsAddress().call(), 0)
         await sale.methods.setOpsAddress(ops).send()
         assert.equal(await sale.methods.opsAddress().call(), ops)
      })


      it('isOwner(owner)', async () => {
         assert.equal(await sale.methods.isOwner(owner).call(), true)
      })

      it('isOwner(ops)', async () => {
         assert.equal(await sale.methods.isOwner(ops).call(), false)
      })

      it('isOwner(account1)', async () => {
         assert.equal(await sale.methods.isOwner(account1).call(), false)
      })
   })


   context('isOps (inherited)', async () => {

      it('isOps(owner)', async () => {
         assert.equal(await sale.methods.isOps(owner).call(), false)
      })

      it('isOps(ops)', async () => {
         assert.equal(await sale.methods.isOps(ops).call(), true)
      })

      it('isOps(account1)', async () => {
         assert.equal(await sale.methods.isOps(account1).call(), false)
      })
   })


   context('isOwnerOrOps (inherited)', async () => {

      it('isOwnerOrOps(owner)', async () => {
         assert.equal(await sale.methods.isOwnerOrOps(owner).call(), true)
      })

      it('isOwnerOrOps(ops)', async () => {
         assert.equal(await sale.methods.isOwnerOrOps(ops).call(), true)
      })

      it('isOwnerOrOps(account1)', async () => {
         assert.equal(await sale.methods.isOwnerOrOps(account1).call(), false)
      })
   })


   context('currentTime', async () => {

      it('currentTime is ~ same as now', async () => {
         const currentTime = await sale.methods.currentTime().call()
         const now = Moment().unix()

         assert.isTrue(currentTime > now - 5 && currentTime < now + 5)
      })

      it('changeTime does not exist', async () => {
         assert.equal(typeof sale.methods.changeTime, 'undefined')
      })

   })


   context('initialize', async () => {

      before(async () => {
         assert.equal(await sale.methods.opsAddress().call(), ops)
         assert.equal(await sale.methods.token().call(), 0)
      })


      it('initialize(0)', async () => {
         await TestLib.assertCallFails(sale.methods.initialize(0).call({ from: owner }))
      })

      it('initialize(this)', async () => {
         await TestLib.assertCallFails(sale.methods.initialize(sale._address).call({ from: owner }))
      })

      it('initialize(owner)', async () => {
         await TestLib.assertCallFails(sale.methods.initialize(owner).call({ from: owner }))
      })

      it('initialize(ops)', async () => {
         await TestLib.assertCallFails(sale.methods.initialize(ops).call({ from: owner }))
      })

      it('initialize(wallet)', async () => {
         await TestLib.assertCallFails(sale.methods.initialize(wallet).call({ from: owner }))
      })

      it('initialize as normal', async () => {
         await TestLib.assertCallFails(sale.methods.initialize(token._address).call({ from: account1 }))
      })

      it('initialize as ops', async () => {
         await TestLib.assertCallFails(sale.methods.initialize(token._address).call({ from: ops }))
      })

      it('initialize as owner', async () => {
         assert.equal(await sale.methods.initialize(token._address).call({ from: owner }), true)
         Utils.checkInitialize(await sale.methods.initialize(token._address).send({ from: owner }))
      })
   })


   context('setWalletAddress', async () => {

      before(async () => {
         assert.equal(await sale.methods.opsAddress().call(), ops)
      })


      it('setWalletAddress(0)', async () => {
         await TestLib.assertCallFails(sale.methods.setWalletAddress(0).call({ from: owner }))
      })

      it('setWalletAddress(this)', async () => {
         await TestLib.assertCallFails(sale.methods.setWalletAddress(sale._address).call({ from: owner }))
      })

      it('setWalletAddress(owner)', async () => {
         await TestLib.assertCallFails(sale.methods.setWalletAddress(owner).call({ from: owner }))
      })

      it('setWalletAddress(ops)', async () => {
         await TestLib.assertCallFails(sale.methods.setWalletAddress(ops).call({ from: owner }))
      })

      it('setWalletAddress(wallet)', async () => {
         assert.equal(await sale.methods.walletAddress().call(), wallet)
         assert.equal(await sale.methods.setWalletAddress(wallet).call({ from: owner }), true)
         Utils.checkSetWalletAddress(await sale.methods.setWalletAddress(wallet).send({ from: owner }), wallet)
         assert.equal(await sale.methods.walletAddress().call(), wallet)
      })

      it('setWalletAddress(token)', async () => {
         await TestLib.assertCallFails(sale.methods.setWalletAddress(token._address).call({ from: owner }))
      })

      it('setWalletAddress as normal', async () => {
         await TestLib.assertCallFails(sale.methods.setWalletAddress(account1).call({ from: account1 }))
      })

      it('setWalletAddress as ops', async () => {
         await TestLib.assertCallFails(sale.methods.setWalletAddress(account1).call({ from: ops }))
      })

      it('setWalletAddress as owner', async () => {
         assert.equal(await sale.methods.walletAddress().call(), wallet)
         assert.equal(await sale.methods.setWalletAddress(account1).call({ from: owner }), true)
         Utils.checkSetWalletAddress(await sale.methods.setWalletAddress(account1).send({ from: owner }), account1)
         assert.equal(await sale.methods.walletAddress().call(), account1)
         await sale.methods.setWalletAddress(wallet).send({ from: owner })
         assert.equal(await sale.methods.walletAddress().call(), wallet)
      })
   })


   context('setMaxTokensPerAccount', async () => {

      it('setMaxTokensPerAccount(0)', async () => {
         assert.equal(await sale.methods.setMaxTokensPerAccount(0).call({ from: owner }), true)
         Utils.checkSetMaxTokensPerAccount(await sale.methods.setMaxTokensPerAccount(0).send({ from: owner }), 0)
      })

      it('setMaxTokensPerAccount(1)', async () => {
         assert.equal(await sale.methods.setMaxTokensPerAccount(1).call({ from: owner }), true)
         Utils.checkSetMaxTokensPerAccount(await sale.methods.setMaxTokensPerAccount(1).send({ from: owner }), 1)
      })

      it('setMaxTokensPerAccount(100,000,000 * 10**18)', async () => {
         const newMax = new BigNumber("100000000").mul(new BigNumber(10).pow(18))
         assert.equal(await sale.methods.setMaxTokensPerAccount(newMax).call({ from: owner }), true)
         Utils.checkSetMaxTokensPerAccount(await sale.methods.setMaxTokensPerAccount(newMax).send({ from: owner }), newMax.toNumber())
      })

      it('setMaxTokensPerAccount as ops', async () => {
         assert.equal(await sale.methods.opsAddress().call(), ops)
         await TestLib.assertCallFails(sale.methods.setMaxTokensPerAccount(1).call({ from: ops }))
      })

      it('setMaxTokensPerAccount as normal', async () => {
         await TestLib.assertCallFails(sale.methods.setMaxTokensPerAccount(1).call({ from: account1 }))
      })
   })


   context('setTokensPerKEther', async () => {

      it('setTokensPerKEther(0)', async () => {
         await TestLib.assertCallFails(sale.methods.setTokensPerKEther(0).call({ from: owner }))
      })

      it('setTokensPerKEther(1)', async () => {
         assert.equal(await sale.methods.setTokensPerKEther(1).call({ from: owner }), true)
         Utils.checkSetTokensPerKEther(await sale.methods.setTokensPerKEther(1).send({ from: owner }), 1)
      })

      it('setTokensPerKEther(100,000,000 * 10**18)', async () => {
         const newValue = new BigNumber("100000000").mul(new BigNumber(10).pow(18))
         assert.equal(await sale.methods.setTokensPerKEther(newValue).call({ from: owner }), true)
         Utils.checkSetTokensPerKEther(await sale.methods.setTokensPerKEther(newValue).send({ from: owner }), newValue.toNumber())
      })

      it('setTokensPerKEther as ops', async () => {
         assert.equal(await sale.methods.opsAddress().call(), ops)
         await TestLib.assertCallFails(sale.methods.setTokensPerKEther(1).call({ from: ops }))
      })

      it('setTokensPerKEther as normal', async () => {
         await TestLib.assertCallFails(sale.methods.setTokensPerKEther(1).call({ from: account1 }))
      })
   })


   context('setBonus', async () => {

      it('setBonus(0)', async () => {
         assert.equal(await sale.methods.setBonus(0).call({ from: owner }), true)
         Utils.checkSetBonus(await sale.methods.setBonus(0).send({ from: owner }), 0)
      })

      it('setBonus(750)', async () => {
         assert.equal(await sale.methods.setBonus(750).call({ from: owner }), true)
         Utils.checkSetBonus(await sale.methods.setBonus(750).send({ from: owner }), 750)
      })

      it('setBonus(1500)', async () => {
         assert.equal(await sale.methods.setBonus(1500).call({ from: owner }), true)
         Utils.checkSetBonus(await sale.methods.setBonus(1500).send({ from: owner }), 1500)
      })

      it('setBonus(10000)', async () => {
         assert.equal(await sale.methods.setBonus(10000).call({ from: owner }), true)
         Utils.checkSetBonus(await sale.methods.setBonus(10000).send({ from: owner }), 10000)
      })

      it('setBonus(10001)', async () => {
         await TestLib.assertCallFails(sale.methods.setBonus(10001).call({ from: owner }))
      })

      it('setBonus as ops', async () => {
         assert.equal(await sale.methods.opsAddress().call(), ops)
         await TestLib.assertCallFails(sale.methods.setBonus(2000).call({ from: ops }))
      })

      it('setBonus as normal', async () => {
         await TestLib.assertCallFails(sale.methods.setBonus(2000).call({ from: account1 }))
      })
   })


   context('setSaleWindow', async () => {

      it('setSaleWindow(0, 0)', async () => {
         await TestLib.assertCallFails(sale.methods.setSaleWindow(0, 0).call({ from: owner }))
      })

      it('setSaleWindow(0, 1)', async () => {
         await TestLib.assertCallFails(sale.methods.setSaleWindow(0, 1).call({ from: owner }))
      })

      it('setSaleWindow(1, 2)', async () => {
         assert.equal(await sale.methods.setSaleWindow(1, 2).call({ from: owner }), true)
         Utils.checkSetSaleWindow(await sale.methods.setSaleWindow(1, 2).send({ from: owner }), 1, 2)
      })

      it('setSaleWindow(now - 1000, now - 500)', async () => {
         const now = Moment().unix()
         assert.equal(await sale.methods.setSaleWindow(now - 1000, now - 500).call({ from: owner }), true)
         Utils.checkSetSaleWindow(await sale.methods.setSaleWindow(now - 1000, now - 500).send({ from: owner }), now - 1000, now - 500)
      })

      it('setSaleWindow(now, now)', async () => {
         const now = Moment().unix()
         await TestLib.assertCallFails(sale.methods.setSaleWindow(now, now).call({ from: owner }))
      })

      it('setSaleWindow(now, now + 1)', async () => {
         const now = Moment().unix()
         assert.equal(await sale.methods.setSaleWindow(now, now + 1).call({ from: owner }), true)
         Utils.checkSetSaleWindow(await sale.methods.setSaleWindow(now, now + 1).send({ from: owner }), now, now + 1)
      })

      it('setSaleWindow(now + 1 month, now + 2 months)', async () => {
         const now = Moment()
         const start = now.add(1, 'M').unix()
         const end = now.add(2, 'M').unix()
         assert.equal(await sale.methods.setSaleWindow(start, end).call({ from: owner }), true)
         Utils.checkSetSaleWindow(await sale.methods.setSaleWindow(start, end).send({ from: owner }), start, end)
      })

      it('setSaleWindow as ops', async () => {
         const now = Moment().unix()
         await TestLib.assertCallFails(sale.methods.setSaleWindow(now, now + 1).call({ from: ops }))
      })

      it('setSaleWindow as normal', async () => {
         const now = Moment().unix()
         await TestLib.assertCallFails(sale.methods.setSaleWindow(now, now + 1).call({ from: account1 }))
      })
   })


   context('suspend and resume', async () => {

      var startTime = null
      var endTime = null

      before(async () => {
         const now = Moment().unix()

         var deploymentResult = await TestLib.deploy('FlexibleTokenSaleMock', [ START_TIME, END_TIME, wallet, now - 100000 ], { from: owner })
         sale = deploymentResult.instance
         startTime = await sale.methods.startTime().call()
         endTime = await sale.methods.endTime().call()

         await token.methods.transfer(sale._address, 1000).send({ from: owner })
      })


      it('suspend / resume before sale', async () => {
         await sale.methods.changeTime(startTime - 10000).send({ from: owner })

         assert.equal(await sale.methods.suspended().call(), false)
         assert.equal(await sale.methods.suspend().call({ from: owner }), true)
         Utils.checkSuspend(await sale.methods.suspend().send({ from: owner }))
         assert.equal(await sale.methods.suspended().call(), true)
         Utils.checkResumed(await sale.methods.resume().send({ from: owner }))
         assert.equal(await sale.methods.suspended().call(), false)
      })

      it('suspend / resume during sale', async () => {
         await sale.methods.changeTime(startTime + 1).send({ from: owner })

         assert.equal(await sale.methods.suspended().call(), false)
         assert.equal(await sale.methods.suspend().call({ from: owner }), true)
         Utils.checkSuspend(await sale.methods.suspend().send({ from: owner }))
         assert.equal(await sale.methods.suspended().call(), true)
         Utils.checkResumed(await sale.methods.resume().send({ from: owner }))
         assert.equal(await sale.methods.suspended().call(), false)
      })

      it('suspend / resume after sale', async () => {
         await sale.methods.changeTime(endTime + 1).send({ from: owner })

         assert.equal(await sale.methods.suspended().call(), false)
         assert.equal(await sale.methods.suspend().call({ from: owner }), true)
         Utils.checkSuspend(await sale.methods.suspend().send({ from: owner }))
         assert.equal(await sale.methods.suspended().call(), true)
         Utils.checkResumed(await sale.methods.resume().send({ from: owner }))
         assert.equal(await sale.methods.suspended().call(), false)
      })

      it('suspend before sale, resume during sale', async () => {
         await sale.methods.changeTime(startTime - 10000).send({ from: owner })

         assert.equal(await sale.methods.suspended().call(), false)
         assert.equal(await sale.methods.suspend().call({ from: owner }), true)
         Utils.checkSuspend(await sale.methods.suspend().send({ from: owner }))
         assert.equal(await sale.methods.suspended().call(), true)

         await sale.methods.changeTime(startTime + 1).send({ from: owner })
         Utils.checkResumed(await sale.methods.resume().send({ from: owner }))
         assert.equal(await sale.methods.suspended().call(), false)
      })

      it('suspend during sale, resume after sale', async () => {
         await sale.methods.changeTime(startTime + 1).send({ from: owner })

         assert.equal(await sale.methods.suspended().call(), false)
         assert.equal(await sale.methods.suspend().call({ from: owner }), true)
         Utils.checkSuspend(await sale.methods.suspend().send({ from: owner }))
         assert.equal(await sale.methods.suspended().call(), true)

         await sale.methods.changeTime(endTime + 1).send({ from: owner })
         Utils.checkResumed(await sale.methods.resume().send({ from: owner }))
         assert.equal(await sale.methods.suspended().call(), false)
      })

      it('suspend when suspended', async () => {
         assert.equal(await sale.methods.suspended().call(), false)
         assert.equal(await sale.methods.suspend().call({ from: owner }), true)
         Utils.checkSuspend(await sale.methods.suspend().send({ from: owner }))
         assert.equal(await sale.methods.suspended().call(), true)
         assert.equal(await sale.methods.suspend().call({ from: owner }), false)
         TestLib.assertNoEvents(await sale.methods.suspend().send({ from: owner }))
         assert.equal(await sale.methods.suspended().call(), true)
         Utils.checkResumed(await sale.methods.resume().send({ from: owner }))
         assert.equal(await sale.methods.suspended().call(), false)
      })

      it('resume when resumed', async () => {
         assert.equal(await sale.methods.suspended().call(), false)
         assert.equal(await sale.methods.resume().call({ from: owner }), false)
         TestLib.assertNoEvents(await sale.methods.resume().send({ from: owner }))
         assert.equal(await sale.methods.suspended().call(), false)
         assert.equal(await sale.methods.resume().call({ from: owner }), false)
         TestLib.assertNoEvents(await sale.methods.resume().send({ from: owner }))
         assert.equal(await sale.methods.suspended().call(), false)
      })

      it('suspend / resume as ops', async () => {
         await sale.methods.changeTime(startTime + 1).send({ from: owner })

         assert.equal(await sale.methods.suspended().call(), false)
         await TestLib.assertCallFails(sale.methods.suspend().call({ from: ops }))
         await TestLib.assertCallFails(sale.methods.resume().call({ from: ops }))
      })

      it('suspend / resume as normal', async () => {
         await sale.methods.changeTime(startTime + 1).send({ from: owner })

         assert.equal(await sale.methods.suspended().call(), false)
         await TestLib.assertCallFails(sale.methods.suspend().call({ from: account1 }))
         await TestLib.assertCallFails(sale.methods.resume().call({ from: account1 }))
      })
   })


   context('finalize', async () => {

      before(async () => {
         const now = Moment().unix()

         var deploymentResult = await TestLib.deploy('FlexibleTokenSaleMock', [ START_TIME, END_TIME, wallet, now - 100000 ], { from: owner })
         sale = deploymentResult.instance

         await sale.methods.setOpsAddress(ops).send({ from: owner })
         await token.methods.setOpsAddress(sale._address).send({ from: owner })
         await token.methods.transfer(sale._address, 1000).send({ from: owner })
      })

      it('finalize as normal', async () => {
         assert.equal(await sale.methods.finalized().call(), false)
         await TestLib.assertCallFails(sale.methods.finalize().call({ from: account1 }))
      })

      it('finalize as ops', async () => {
         assert.equal(await sale.methods.finalized().call(), false)
         assert.equal(await sale.methods.opsAddress().call(), ops)

         await TestLib.assertCallFails(sale.methods.finalize().call({ from: ops }))
      })

      it('finalize as owner', async () => {
         assert.equal(await sale.methods.finalized().call(), false)
         assert.equal(await token.methods.finalized().call(), false)

         assert.equal(await sale.methods.finalize().call({ from: owner }), true)
         Utils.checkFinalize(await sale.methods.finalize().send({ from: owner }))

         assert.equal(await sale.methods.finalized().call(), true)
         assert.equal(await token.methods.finalized().call(), false)
      })
   })


   context('reclaimTokens', async () => {

      before(async () => {
         const now = Moment().unix()

         var deploymentResult = await TestLib.deploy('FlexibleTokenSaleMock', [ START_TIME, END_TIME, wallet, now - 100000 ], { from: owner })
         sale = deploymentResult.instance

         await token.methods.setOpsAddress(sale._address).send({ from: owner })
         await sale.methods.initialize(token._address).send({ from: owner })
         await sale.methods.setOpsAddress(ops).send({ from: owner })
         await token.methods.transfer(sale._address, 1000).send({ from: owner })
      })


      context('before finalize', async () => {

         it('reclaimTokens as owner', async () => {
            assert.equal(await sale.methods.finalized().call(), false)

            const ownerBalanceBefore = await token.methods.balanceOf(owner).call()
            const saleBalanceBefore  = await token.methods.balanceOf(sale._address).call()
            assert.equal(saleBalanceBefore, 1000)

            assert.equal(await sale.methods.reclaimTokens().call({ from: owner }), true)
            Utils.checkReclaimTokens(await sale.methods.reclaimTokens().send({ from: owner }), saleBalanceBefore)

            const ownerBalanceAfter = new BigNumber(await token.methods.balanceOf(owner).call())
            const saleBalanceAfter  = new BigNumber(await token.methods.balanceOf(sale._address).call())

            // TODO: Utils.checkReclaim should also check the transfer event
            assert.equal(ownerBalanceAfter.sub(ownerBalanceBefore).toNumber(), saleBalanceBefore)
            assert.equal(saleBalanceAfter.toNumber(), 0)
         })
      })


      context('after finalize', async () => {

         before(async () => {
            await sale.methods.finalize().send({ from: owner })
            await token.methods.finalize().send({ from: owner })

            assert.equal(await sale.methods.finalized().call(), true)
            assert.equal(await token.methods.finalized().call(), true)

            await token.methods.transfer(sale._address, 1000).send({ from: owner })
         })


         it('reclaimTokens as normal', async () => {
            await TestLib.assertCallFails(sale.methods.reclaimTokens().call({ from: account1 }))
         })

         it('reclaimTokens as ops', async () => {
            await TestLib.assertCallFails(sale.methods.reclaimTokens().call({ from: ops }))
         })

         it('reclaimTokens as owner', async () => {
            assert.equal(await sale.methods.finalized().call(), true)

            const ownerBalanceBefore = await token.methods.balanceOf(owner).call()
            const saleBalanceBefore  = await token.methods.balanceOf(sale._address).call()
            assert.equal(saleBalanceBefore, 1000)

            assert.equal(await sale.methods.reclaimTokens().call({ from: owner }), true)
            Utils.checkReclaimTokens(await sale.methods.reclaimTokens().send({ from: owner }), saleBalanceBefore)

            const ownerBalanceAfter = new BigNumber(await token.methods.balanceOf(owner).call())
            const saleBalanceAfter  = new BigNumber(await token.methods.balanceOf(sale._address).call())
            assert.equal(ownerBalanceAfter.sub(ownerBalanceBefore).toNumber(), saleBalanceBefore)
            assert.equal(saleBalanceAfter.toNumber(), 0)
         })

         it('reclaimTokens as owner when 0 balance', async () => {
            assert.equal(await sale.methods.reclaimTokens().call({ from: owner }), false)
            TestLib.assertNoEvents(await sale.methods.reclaimTokens().send({ from: owner }))
         })
      })
   })
})
