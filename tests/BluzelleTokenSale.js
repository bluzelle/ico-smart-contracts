// ----------------------------------------------------------------------------
// BluzelleTokenSale Contract Tests
//
// Copyright (c) 2017 Bluzelle Networks Pte Ltd.
// http://www.bluzelle.com/
//
// The MIT Licence.
// ----------------------------------------------------------------------------

const TestLib  = require('../tools/testlib.js')
const StdUtils = require('./lib/StdTestUtils.js')
const Utils    = require('./lib/BluzelleTestUtils.js')


// ----------------------------------------------------------------------------
// Tests Summary
// ----------------------------------------------------------------------------
// Construction and basic properties
//    - whitelist
//    - currentStage
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
// setCurrentStage
//    - setCurrentStage(0)
//    - setCurrentStage(1)
//    - setCurrentStage(2)
//    - setCurrentStage(1)
//    - setCurrentStage(0)
//    - setCurrentStage(100)
// setWhitelistedStatus
//    - setWhitelistedStatus(0, 1)
//    - setWhitelistedStatus(this, 1)
//    - setWhitelistedStatus(wallet, 1)
//    - setWhitelistedStatus(owner, 1)
//    - setWhitelistedStatus(ops, 1)
//    - setWhitelistedStatus(normal, 0)
//    - setWhitelistedStatus(normal, 1)
//    - setWhitelistedStatus(normal, 2)
//    - setWhitelistedStatus(normal, 1)
//    - setWhitelistedStatus(normal, 0)
//    - setWhitelistedStatus owner
//    - setWhitelistedStatus as ops
//    - setWhitelistedStatus as normal
// setWhitelistedBatch
//    - setWhitelistedBatch with empty batch
//    - setWhitelistedBatch with array length mismatch
//    - setWhitelistedBatch as normal
//    - setWhitelistedBatch as ops
//    - setWhitelistedBatch as owner
//    - setWhitelistedBatch - rerun the same batch again
//    - setWhitelistedBatch - remove everybody from whitelist
// buyTokens
//    - buyTokens where sender nor receiver whitelisted
//    x buyTokens where sender not whitelisted
//    x buyTokens where sender beneficiary not whitelisted
//    - buyTokens stage 1, whitelisted stage 1
//    - buyTokens stage 1, whitelisted stage 2
//    - buyTokens stage 2, whitelisted stage 2
//    - buyTokens stage 2, whitelisted stage 3
//    - buyTokens stage 3, whitelisted stage 1
//    - buyTokens stage 3, after removed from whitelist
// Events
//    - CurrentStageUpdated
//    - WhitelistedStatusUpdated
//       * Covered when appropriate in the different function tests.
//
describe('BluzelleTokenSale Contract', () => {

   const TOKEN_NAME          = "Bluzelle Token"
   const TOKEN_SYMBOL        = "BLZ"
   const TOKEN_DECIMALS      = 18
   const DECIMALS_FACTOR     = new BigNumber(10).pow(TOKEN_DECIMALS)
   const TOKEN_TOTALSUPPLY   = new BigNumber("500000000").mul(DECIMALS_FACTOR)

   const TOKENSPERKETHER     = 1700000
   const BONUS               = 12000
   const MAXTOKENSPERACCOUNT = new BigNumber("17000").mul(DECIMALS_FACTOR)
   const CONTRIBUTION_MIN    = new BigNumber(0.1).mul(DECIMALS_FACTOR)
   const START_TIME          = 1511870400
   const END_TIME            = 1512043200


   var sale = null
   var token = null
   var accounts = null

   // Accounts used for testing
   var owner    = null
   var ops      = null
   var wallet   = null
   var account1 = null
   var account2 = null
   var account3 = null
   var account4 = null
   var account5 = null


   const buyTokens = async (from, to, amount) => {
      return StdUtils.buyTokens(
         token,
         sale,
         owner,
         wallet,
         DECIMALS_FACTOR,
         from,
         to,
         amount
      )
   }


   before(async () => {
      await TestLib.initialize()

      accounts = await web3.eth.getAccounts()

      owner    = accounts[1]
      ops      = accounts[2]
      wallet   = accounts[3]
      account1 = accounts[4]
      account2 = accounts[5]
      account3 = accounts[6]
      account4 = accounts[7]
      account5 = accounts[8]

      var deploymentResult = null

      deploymentResult = await TestLib.deploy('BluzelleToken', [ ], { from: owner })
      token = deploymentResult.instance

      deploymentResult = await TestLib.deploy('BluzelleTokenSaleMock', [ wallet, Moment().unix() ], { from: owner })
      sale = deploymentResult.instance

      const initialSaleTokens = new BigNumber("1000000").mul(DECIMALS_FACTOR)
      await token.methods.setOpsAddress(sale._address).send({ from: owner });
      await sale.methods.setOpsAddress(ops).send({ from: owner });
      await token.methods.transfer(sale._address, initialSaleTokens).send({ from: owner })
      await sale.methods.initialize(token._address).send({ from: owner })
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
         assert.equal(await sale.methods.tokensPerKEther().call(), TOKENSPERKETHER)
      })

      it('bonus', async () => {
         assert.equal(await sale.methods.bonus().call(), BONUS)
      })

      it('maxTokensPerAccount', async () => {
         assert.equal(new BigNumber(await sale.methods.maxTokensPerAccount().call()), MAXTOKENSPERACCOUNT)
      })

      it('contributionMin', async () => {
         assert.equal(await sale.methods.contributionMin().call(), CONTRIBUTION_MIN)
      })

      it('walletAddress', async () => {
         assert.equal(await sale.methods.walletAddress().call(), wallet)
      })

      it('token', async () => {
         assert.equal(await sale.methods.token().call(), token._address)
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
         assert.equal(await sale.methods.opsAddress().call(), ops)
      })

      it('owner', async () => {
         assert.equal(await sale.methods.owner().call(), owner)
      })

      it('proposedOwner', async () => {
         assert.equal(await sale.methods.proposedOwner().call(), 0)
      })

      it('whitelist', async () => {
         assert.equal(await sale.methods.whitelist(0).call(), 0)
      })

      it('currentStage', async () => {
         assert.equal(await sale.methods.currentStage().call(), 1)
      })
   })


   context('setCurrentStage', async () => {

      it('setCurrentStage(0)', async () => {
         await TestLib.assertThrows(sale.methods.setCurrentStage(0).call({ from: owner }))
      })

      it('setCurrentStage(1)', async () => {
         assert.equal(await sale.methods.currentStage().call(), 1)
         assert.equal(await sale.methods.setCurrentStage(1).call({ from: owner }), false)
      })

      it('setCurrentStage(2)', async () => {
         assert.equal(await sale.methods.currentStage().call(), 1)
         assert.equal(await sale.methods.setCurrentStage(2).call({ from: owner }), true)
         Utils.checkSetCurrentStage(await sale.methods.setCurrentStage(2).send({ from: owner }), 2)
         assert.equal(await sale.methods.currentStage().call(), 2)
      })

      it('setCurrentStage(1)', async () => {
         await TestLib.assertThrows(sale.methods.setCurrentStage(1).call({ from: owner }))
      })

      it('setCurrentStage(0)', async () => {
         await TestLib.assertThrows(sale.methods.setCurrentStage(0).call({ from: owner }))
      })

      it('setCurrentStage(100)', async () => {
         assert.equal(await sale.methods.currentStage().call(), 2)
         assert.equal(await sale.methods.setCurrentStage(100).call({ from: owner }), true)
         Utils.checkSetCurrentStage(await sale.methods.setCurrentStage(100).send({ from: owner }), 100)
         assert.equal(await sale.methods.currentStage().call(), 100)
      })
   })


   context('setWhitelistedStatus', async () => {

      it('setWhitelistedStatus(0, 1)', async () => {
         await TestLib.assertThrows(sale.methods.setWhitelistedStatus(0, 1).call({ from: owner }))
      })

      it('setWhitelistedStatus(this, 1)', async () => {
         await TestLib.assertThrows(sale.methods.setWhitelistedStatus(sale._address, 1).call({ from: owner }))
      })

      it('setWhitelistedStatus(wallet, 1)', async () => {
         await TestLib.assertThrows(sale.methods.setWhitelistedStatus(wallet, 1).call({ from: owner }))
      })

      it('setWhitelistedStatus(owner, 1)', async () => {
         assert.equal(await sale.methods.setWhitelistedStatus(owner, 1).call({ from: owner }), true)
         Utils.checkSetWhitelistedStatus(await sale.methods.setWhitelistedStatus(owner, 1).send({ from: owner }), owner, 1)
         assert.equal(await sale.methods.whitelist(owner).call(), 1)
      })

      it('setWhitelistedStatus(ops, 1)', async () => {
         assert.equal(await sale.methods.setWhitelistedStatus(ops, 1).call({ from: owner }), true)
         Utils.checkSetWhitelistedStatus(await sale.methods.setWhitelistedStatus(ops, 1).send({ from: owner }), ops, 1)
         assert.equal(await sale.methods.whitelist(ops).call(), 1)
      })

      it('setWhitelistedStatus(normal, 0)', async () => {
         assert.equal(await sale.methods.setWhitelistedStatus(account1, 0).call({ from: owner }), true)
         Utils.checkSetWhitelistedStatus(await sale.methods.setWhitelistedStatus(account1, 0).send({ from: owner }), account1, 0)
         assert.equal(await sale.methods.whitelist(account1).call(), 0)
      })

      it('setWhitelistedStatus(normal, 1)', async () => {
         assert.equal(await sale.methods.setWhitelistedStatus(account1, 1).call({ from: owner }), true)
         Utils.checkSetWhitelistedStatus(await sale.methods.setWhitelistedStatus(account1, 1).send({ from: owner }), account1, 1)
         assert.equal(await sale.methods.whitelist(account1).call(), 1)
      })

      it('setWhitelistedStatus(normal, 2)', async () => {
         assert.equal(await sale.methods.setWhitelistedStatus(account1, 2).call({ from: owner }), true)
         Utils.checkSetWhitelistedStatus(await sale.methods.setWhitelistedStatus(account1, 2).send({ from: owner }), account1, 2)
         assert.equal(await sale.methods.whitelist(account1).call(), 2)
      })

      it('setWhitelistedStatus(normal, 1)', async () => {
         assert.equal(await sale.methods.setWhitelistedStatus(account1, 1).call({ from: owner }), true)
         Utils.checkSetWhitelistedStatus(await sale.methods.setWhitelistedStatus(account1, 1).send({ from: owner }), account1, 1)
         assert.equal(await sale.methods.whitelist(account1).call(), 1)
      })

      it('setWhitelistedStatus(normal, 0)', async () => {
         assert.equal(await sale.methods.setWhitelistedStatus(account1, 0).call({ from: owner }), true)
         Utils.checkSetWhitelistedStatus(await sale.methods.setWhitelistedStatus(account1, 0).send({ from: owner }), account1, 0)
         assert.equal(await sale.methods.whitelist(account1).call(), 0)
      })

      it('setWhitelistedStatus as ops', async () => {
         assert.equal(await sale.methods.setWhitelistedStatus(account1, 1).call({ from: ops }), true)
         Utils.checkSetWhitelistedStatus(await sale.methods.setWhitelistedStatus(account1, 1).send({ from: ops }), account1, 1)
         assert.equal(await sale.methods.whitelist(account1).call(), 1)
      })

      it('setWhitelistedStatus as normal', async () => {
         await TestLib.assertThrows(sale.methods.setWhitelistedStatus(account2, 2).call({ from: account1 }))
      })
   })


   context('setWhitelistedBatch', async () => {

      it('setWhitelistedBatch with empty batch', async () => {
         var addresses = []
         var stages    = []

         await TestLib.assertThrows(sale.methods.setWhitelistedBatch(addresses, stages).call({ from: owner }))
      })

      it('setWhitelistedBatch with array length mismatch', async () => {
         var addresses = [account1]
         var stages    = [1, 2]

         await TestLib.assertThrows(sale.methods.setWhitelistedBatch(addresses, stages).call({ from: owner }))
      })

      it('setWhitelistedBatch as normal', async () => {
         var addresses = [ account1, account2, account3, account4, account5 ]
         var stages    = [ 1, 2, 5, 0, 1000 ]

         await TestLib.assertThrows(sale.methods.setWhitelistedBatch(addresses, stages).call({ from: account1 }))
      })

      it('setWhitelistedBatch as ops', async () => {
         var addresses = [ account1, account2, account3, account4, account5 ]
         var stages    = [ 1, 2, 5, 0, 1000 ]

         assert.equal(await sale.methods.setWhitelistedBatch(addresses, stages).call({ from: ops }), true)
         receipt = await sale.methods.setWhitelistedBatch(addresses, stages).send({ from: ops })
         Utils.checkSetWhitelistedBatch(receipt, addresses, stages)

         for (i = 0; i < addresses.length; i++) {
            assert.equal(await sale.methods.whitelist(addresses[i]).call(), stages[i])
         }
      })

      it('setWhitelistedBatch as owner', async () => {
         var addresses = [ account1, account2, account3, account4, account5 ]
         var stages    = [ 0, 1, 7, 3, 0 ]

         assert.equal(await sale.methods.setWhitelistedBatch(addresses, stages).call({ from: ops }), true)
         receipt = await sale.methods.setWhitelistedBatch(addresses, stages).send({ from: ops })
         Utils.checkSetWhitelistedBatch(receipt, addresses, stages)

         for (i = 0; i < addresses.length; i++) {
            assert.equal(await sale.methods.whitelist(addresses[i]).call(), stages[i])
         }
      })

      it('rerun same batch again', async () => {
         var addresses = [ account1, account2, account3, account4, account5 ]
         var stages    = [ 0, 1, 7, 3, 0 ]

         assert.equal(await sale.methods.setWhitelistedBatch(addresses, stages).call({ from: ops }), true)
         receipt = await sale.methods.setWhitelistedBatch(addresses, stages).send({ from: ops })
         Utils.checkSetWhitelistedBatch(receipt, addresses, stages)

         for (i = 0; i < addresses.length; i++) {
            assert.equal(await sale.methods.whitelist(addresses[i]).call(), stages[i])
         }
      })

      it('remove everybody from whitelist', async () => {
         var addresses = [ account1, account2, account3, account4, account5 ]
         var stages    = [ 0, 0, 0, 0, 0 ]

         assert.equal(await sale.methods.setWhitelistedBatch(addresses, stages).call({ from: ops }), true)
         receipt = await sale.methods.setWhitelistedBatch(addresses, stages).send({ from: ops })
         Utils.checkSetWhitelistedBatch(receipt, addresses, stages)

         for (i = 0; i < addresses.length; i++) {
            assert.equal(await sale.methods.whitelist(addresses[i]).call(), stages[i])
         }
      })
   })


   context('buyTokens - whitelist', async () => {

      before(async () => {
         deploymentResult = await TestLib.deploy('BluzelleToken', [ ], { from: owner })
         token = deploymentResult.instance

         deploymentResult = await TestLib.deploy('BluzelleTokenSaleMock', [ wallet, Moment().unix() ], { from: owner })
         sale = deploymentResult.instance

         const initialSaleTokens = new BigNumber("1000000").mul(DECIMALS_FACTOR)
         await token.methods.setOpsAddress(sale._address).send({ from: owner });
         await sale.methods.setOpsAddress(ops).send({ from: owner });
         await token.methods.transfer(sale._address, initialSaleTokens).send({ from: owner })
         await sale.methods.initialize(token._address).send({ from: owner })
         await sale.methods.changeTime(START_TIME + 1).send({ from: owner })
         await sale.methods.setMaxTokensPerAccount(0).send({ from: owner })
      })


      it('buyTokens without being whitelisted', async () => {
         assert.equal(await sale.methods.whitelist(account1).call(), 0)

         await TestLib.assertThrows(buyTokens(account1, account1, CONTRIBUTION_MIN))
      })

      it('buyTokens stage 1, whitelisted stage 1', async () => {
         assert.equal(await sale.methods.currentStage().call(), 1)
         await sale.methods.setWhitelistedStatus(account1, 1).send({ from: owner })

         await buyTokens(account1, account1, CONTRIBUTION_MIN)
      })

      it('buyTokens stage 1, whitelisted stage 2', async () => {
         assert.equal(await sale.methods.currentStage().call(), 1)
         await sale.methods.setWhitelistedStatus(account1, 2).send({ from: owner })

         await TestLib.assertThrows(buyTokens(account1, account1, CONTRIBUTION_MIN))
      })

      it('buyTokens stage 2, whitelisted stage 2', async () => {
         await sale.methods.setCurrentStage(2).send({ from: owner })
         await sale.methods.setWhitelistedStatus(account1, 2).send({ from: owner })

         await buyTokens(account1, account1, CONTRIBUTION_MIN)

      })

      it('buyTokens stage 2, whitelisted stage 3', async () => {
         await sale.methods.setWhitelistedStatus(account1, 3).send({ from: owner })

         await TestLib.assertThrows(buyTokens(account1, account1, CONTRIBUTION_MIN))
      })

      it('buyTokens stage 3, whitelisted stage 1', async () => {
         await sale.methods.setCurrentStage(3).send({ from: owner })
         await sale.methods.setWhitelistedStatus(account1, 1).send({ from: owner })

         await buyTokens(account1, account1, CONTRIBUTION_MIN)
      })

      it('buyTokens stage 2, removed from whitelist', async () => {
         await sale.methods.setWhitelistedStatus(account1, 0).send({ from: owner })

         await TestLib.assertThrows(buyTokens(account1, account1, CONTRIBUTION_MIN))
      })
   })
})
