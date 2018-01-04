// ----------------------------------------------------------------------------
// Owned Contract Tests
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
//    - owner
//    - proposedOwner
//    - constructor doesn't take arguments
// isOwner
//    - isOwner(0)
//    - isOwner(this)
//    - isOwner(owner)
//    - isOwner(other account)
// initiateOwnershipTransfer
//    - initiateOwnershipTransfer(0)
//    - initiateOwnershipTransfer(this)
//    - initiateOwnershipTransfer(owner)
//    - initiateOwnershipTransfer(other account), as non-owner
//    - initiateOwnershipTransfer(other account), as owner
// completeOwnershipTransfer
//    - completeOwnershipTransfer, from owner
//    - completeOwnershipTransfer, from yet another account
//    - completeOwnershipTransfer, from another account (ok)
// Events
//    - OwnershipTransferInitiated
//    - OwnershipTransferCompleted
//       * Covered when appropriate in the different function tests.
//
describe('Owned Contract', () => {

   var instance = null
   var accounts = null

   var deploymentResult = null

   // Accounts used for testing
   var owner = null
   var otherAccount = null
   var otherAccount2 = null


   before(async () => {
      await TestLib.initialize()

      accounts = await web3.eth.getAccounts()

      owner         = accounts[1]
      otherAccount  = accounts[2]
      otherAccount2 = accounts[3]

      deploymentResult = await TestLib.deploy('Owned', [ ], { from: owner })

      instance = deploymentResult.instance
   })


   context('Construction and basic properties', async () => {

      it('owner', async () => {
         assert.equal(await instance.methods.owner().call(), owner)
      })

      it('proposedOwner', async () => {
         assert.equal(await instance.methods.proposedOwner().call(), 0)
      })

      it('constructor doesnt take arguments', async () => {
         try {
            await TestLib.deploy('Owned', [ owner ], { from: owner })
         } catch (error) {
            assert.isTrue(error.message.indexOf("Got 1 expected 0") > 0)
         }
      })
   })


   context('isOwner', async () => {

      it('isOwner(0)', async () => {
         assert.equal(await instance.methods.isOwner(0).call(), false)
      })

      it('isOwner(this)', async () => {
         assert.equal(await instance.methods.isOwner(instance._address).call(), false)
      })

      it('isOwner(owner)', async () => {
         assert.equal(await instance.methods.isOwner(owner).call(), true)
      })

      it('isOwner(other account)', async () => {
         assert.equal(await instance.methods.isOwner(otherAccount).call(), false)
      })
   })


   context('initiateOwnershipTransfer', async () => {

      it('initiateOwnershipTransfer(0)', async () => {
         await TestLib.assertCallFails(instance.methods.initiateOwnershipTransfer(0).call())
      })

      it('initiateOwnershipTransfer(this)', async () => {
         await TestLib.assertCallFails(instance.methods.initiateOwnershipTransfer(instance._address).call())
      })

      it('initiateOwnershipTransfer(owner)', async () => {
         await TestLib.assertCallFails(instance.methods.initiateOwnershipTransfer(owner).call())
      })

      it('initiateOwnershipTransfer(other account), as non-owner', async () => {
         await TestLib.assertCallFails(instance.methods.initiateOwnershipTransfer(otherAccount).call({ from: otherAccount2 }))
      })

      it('initiateOwnershipTransfer(other account), as owner', async () => {
         assert.equal(await instance.methods.owner().call(), owner)
         assert.equal(await instance.methods.proposedOwner().call(), 0)

         assert.equal(await instance.methods.initiateOwnershipTransfer(otherAccount).call({ from: owner }), true)
         Utils.checkInitiateOwnershipTransfer(await instance.methods.initiateOwnershipTransfer(otherAccount).send({ from: owner }), otherAccount)

         assert.equal(await instance.methods.owner().call(), owner)
         assert.equal(await instance.methods.proposedOwner().call(), otherAccount)
      })
   })


   context('completeOwnershipTransfer', async () => {

      it('completeOwnershipTransfer(owner)', async () => {
         await TestLib.assertCallFails(instance.methods.completeOwnershipTransfer().call({ from: owner }))
      })

      it('completeOwnershipTransfer(yet another account)', async () => {
         await TestLib.assertCallFails(instance.methods.completeOwnershipTransfer().call({ from: otherAccount2 }))
      })

      it('completeOwnershipTransfer(other account), as owner', async () => {
         assert.equal(await instance.methods.owner().call(), owner)
         assert.equal(await instance.methods.proposedOwner().call(), otherAccount)

         assert.equal(await instance.methods.completeOwnershipTransfer().call({ from: otherAccount }), true)
         Utils.checkCompleteOwnershipTransfer(await instance.methods.completeOwnershipTransfer().send({ from: otherAccount }), otherAccount)

         assert.equal(await instance.methods.owner().call(), otherAccount)
         assert.equal(await instance.methods.proposedOwner().call(), 0)
      })
   })
})
