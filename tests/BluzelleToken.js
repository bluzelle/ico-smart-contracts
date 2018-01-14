// ----------------------------------------------------------------------------
// BluzelleToken Contract Tests
//
// Copyright (c) 2017 Bluzelle Networks Pte Ltd.
// http://www.bluzelle.com/
// The MIT Licence.
//
// Based on FinalizableToken tests from Enuma Technologies.
// Copyright (c) 2017 Enuma Technologies
// https://www.enuma.io/
// ----------------------------------------------------------------------------

const StdUtils = require('./Enuma/lib/StdTestUtils.js')
const Utils    = require('./lib/BluzelleTestUtils.js')


// ----------------------------------------------------------------------------
// Tests Summary
// ----------------------------------------------------------------------------
// Construction and basic properties
//    - name
//    - symbol
//    - decimals
//    - totalSupply
//    - finalized (inherited)
//    - opsAddress (inherited)
//    - owner (inherited)
//    - proposedOwner (inherited)
// reclaimTokens
//    - reclaimTokens when 0 to reclaim
//    - reclaimTokens when > 0 to reclaim
//    - reclaim tokens again
//    - reclaim tokens as normal
// Events
//    - TokensReclaimed
//       * Covered when appropriate in the different function tests.
//
describe('BluzelleToken Contract', () => {

   const TOKEN_NAME          = "Bluzelle Token"
   const TOKEN_SYMBOL        = "BLZ"
   const TOKEN_DECIMALS      = 18
   const DECIMALS_FACTOR     = new BigNumber(10).pow(TOKEN_DECIMALS)
   const TOKEN_TOTALSUPPLY   = new BigNumber("500000000").mul(DECIMALS_FACTOR)


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

      deploymentResult = await TestLib.deploy('BluzelleToken', [ ], { from: owner })
      token = deploymentResult.instance
   })


   context('Construction and basic properties', async () => {

      it('name', async () => {
         assert.equal(await token.methods.name().call(), TOKEN_NAME)
      })

      it('symbol', async () => {
         assert.equal(await token.methods.symbol().call(), TOKEN_SYMBOL)
      })

      it('decimals', async () => {
         assert.equal(await token.methods.decimals().call(), TOKEN_DECIMALS)
      })

      it('totalSupply', async () => {
         assert.equal(new BigNumber(await token.methods.totalSupply().call()), TOKEN_TOTALSUPPLY)
      })

      it('finalized', async () => {
         assert.equal(await token.methods.finalized().call(), false)
      })

      it('opsAddress', async () => {
         assert.equal(await token.methods.opsAddress().call(), 0)
      })

      it('owner', async () => {
         assert.equal(await token.methods.owner().call(), owner)
      })

      it('proposedOwner', async () => {
         assert.equal(await token.methods.proposedOwner().call(), 0)
      })
   })


   context('reclaimTokens', async () => {

      it('reclaimTokens when 0 to reclaim', async () => {
         assert.equal(await token.methods.balanceOf(token._address).call(), 0)

         assert.equal(await token.methods.reclaimTokens().call({ from: owner }), false)
      })

      it('reclaimTokens when > 0 to reclaim', async () => {
         await token.methods.transfer(token._address, 1000).send({ from: owner })
         assert.equal(await token.methods.balanceOf(token._address).call(), 1000)

         const ownerBalanceBefore = new BigNumber(await token.methods.balanceOf(owner).call())

         assert.equal(await token.methods.reclaimTokens().call({ from: owner }), true)
         Utils.checkReclaimTokens(await token.methods.reclaimTokens().send({ from: owner }), token._address, owner, 1000)

         assert.equal(await token.methods.balanceOf(token._address).call(), 0)
         assert.equal(ownerBalanceBefore.sub(await token.methods.balanceOf(owner).call()).toString(), -1000)
      })

      it('reclaimTokens again', async () => {
         assert.equal(await token.methods.balanceOf(token._address).call(), 0)

         assert.equal(await token.methods.reclaimTokens().call({ from: owner }), false)
      })

      it('reclaimTokens as normal', async () => {
         await TestLib.assertCallFails(token.methods.reclaimTokens().send({ from: account1 }))
      })
   })
})
