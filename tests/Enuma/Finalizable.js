// ----------------------------------------------------------------------------
// Finalizable Contract Tests
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
//    - finalized
//    - owner (inherited)
// finalize
//    - finalize as normal
//    - finalize as owner
//    - finalize as owner, when already finalized
// Events
//    Finalized
//       * Covered when appropriate in the different function tests.
//
describe('Finalizable Contract', () => {

   var instance = null

   // Accounts used for testing
   var owner = null
   var account1 = null


   before(async () => {
      await TestLib.initialize()

      accounts = await web3.eth.getAccounts()

      owner         = accounts[1]
      account1      = accounts[2]

      deploymentResult = await TestLib.deploy('Finalizable', [ ], { from: owner })

      instance = deploymentResult.instance
   })


   context('Construction and basic properties', async () => {

      it('finalized', async () => {
         assert.equal(await instance.methods.finalized().call(), false)
      })

      it('owner', async () => {
         assert.equal(await instance.methods.owner().call(), owner)
      })
   })


   context('finalize function', async () => {

      it('finalize as normal', async () => {
         await TestLib.assertCallFails(instance.methods.finalize().call({ from: account1 }))
      })

      it('finalize as owner', async () => {
         assert.equal(await instance.methods.finalize().call({ from: owner }), true)
         Utils.checkFinalize(await instance.methods.finalize().send({ from: owner }))
      })

      it('finalize as owner, when already finalized', async () => {
         await TestLib.assertCallFails(instance.methods.finalize().call({ from: owner }))
      })
   })
})
