// ----------------------------------------------------------------------------
// OpsManaged Contract Tests
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
//    - opsAddress
//    - owner (inherited)
//    - proposedOwner (inherited)
//    - constructor doesn't take arguments
// isOps, with opsAddress in [ 0, otherAccount ]
//    - isOps(0)
//    - isOps(this)
//    - isOps(owner)
//    - isOps(ops)
//    - isOps(other account)
// isOwnerOrOps, with opsAddress in [ 0, otherAccount ]
//    - isOwnerOrOps(0)
//    - isOwnerOrOps(this)
//    - isOwnerOrOps(owner)
//    - isOwnerOrOps(ops)
//    - isOwnerOrOps(other account)
// isOwner (inherited)
//    - isOwner(owner)
//    - isOwner(ops)
// setOpsAddress
//    - setOpsAddress(0)
//    - setOpsAddress(this)
//    - setOpsAddress(owner)
//    - setOpsAddress(other account), as non-owner
//    - setOpsAddress(other account), as ops
//    - setOpsAddress(other account), as owner
//    - setOpsAddress(other account) and then set owner to other account
// Events
//    - OpsAddress changed
//       * Covered when appropriate in the different function tests.
//
describe('Owned Contract', () => {

   var instance = null
   var accounts = null

   var deploymentResult = null

   // Accounts used for testing
   var owner = null
   var ops = null
   var otherAccount = null
   var otherAccount2 = null


   before(async () => {
      await TestLib.initialize()

      accounts = await web3.eth.getAccounts()

      owner         = accounts[1]
      ops           = accounts[2]
      otherAccount  = accounts[3]
      otherAccount2 = accounts[4]

      deploymentResult = await TestLib.deploy('OpsManaged', [ ], { from: owner })

      instance = deploymentResult.instance
   })


   context('Construction and basic properties', async () => {

      it('opsAddress', async () => {
         assert.equal(await instance.methods.owner().call(), owner)
      })

      it('owner (inherited)', async () => {
         assert.equal(await instance.methods.owner().call(), owner)
      })

      it('proposedOwner (inherited)', async () => {
         assert.equal(await instance.methods.proposedOwner().call(), 0)
      })

      it('constructor doesnt take arguments', async () => {
         try {
            await TestLib.deploy('OpsManaged', [ owner ], { from: owner })
         } catch (error) {
            assert.isTrue(error.message.indexOf("Got 1 expected 0") > 0)
         }
      })
   })


// isOps, with opsAddress in [ 0, otherAccount ]
//    - isOps(0)
//    - isOps(this)
//    - isOps(owner)
//    - isOps(ops)
//    - isOps(other account)
// isOwnerOrOps, with opsAddress in [ 0, otherAccount ]
//    - isOwnerOrOps(0)
//    - isOwnerOrOps(this)
//    - isOwnerOrOps(owner)
//    - isOwnerOrOps(ops)
//    - isOwnerOrOps(other account)
// isOwner (inherited)
//    - isOwner(owner)
//    - isOwner(ops)
   context('with opsAddress set to other account', async () => {

      before(async () => {
         await instance.methods.setOpsAddress(ops).send({ from: owner })
      })


      context('isOps', async () => {

         it('isOps(0)', async () => {
            assert.equal(await instance.methods.isOps(0).call(), false)
         })

         it('isOps(this)', async () => {
            assert.equal(await instance.methods.isOps(instance._address).call(), false)
         })

         it('isOps(owner)', async () => {
            assert.equal(await instance.methods.isOps(owner).call(), false)
         })

         it('isOps(ops)', async () => {
            assert.equal(await instance.methods.isOps(ops).call(), true)
         })

         it('isOps(other account)', async () => {
            assert.equal(await instance.methods.isOps(otherAccount).call(), false)
         })
      })


      context('isOwnerOrOps', async () => {

         it('isOps(0)', async () => {
            assert.equal(await instance.methods.isOps(0).call(), false)
         })

         it('isOps(this)', async () => {
            assert.equal(await instance.methods.isOps(instance._address).call(), false)
         })

         it('isOwnerOrOps(owner)', async () => {
            assert.equal(await instance.methods.isOwnerOrOps(owner).call(), true)
         })

         it('isOwnerOrOps(ops)', async () => {
            assert.equal(await instance.methods.isOwnerOrOps(ops).call(), true)
         })

         it('isOwnerOrOps(other account)', async () => {
            assert.equal(await instance.methods.isOwnerOrOps(otherAccount).call(), false)
         })
      })
   })


   context('with opsAddress set to 0', async () => {

      before(async () => {
         await instance.methods.setOpsAddress(0).send({ from: owner })
      })


      context('isOps', async () => {

         it('isOps(0)', async () => {
            assert.equal(await instance.methods.isOps(0).call(), false)
         })

         it('isOps(this)', async () => {
            assert.equal(await instance.methods.isOps(instance._address).call(), false)
         })

         it('isOps(owner)', async () => {
            assert.equal(await instance.methods.isOps(owner).call(), false)
         })

         it('isOps(ops)', async () => {
            assert.equal(await instance.methods.isOps(ops).call(), false)
         })

         it('isOps(other account)', async () => {
            assert.equal(await instance.methods.isOps(otherAccount).call(), false)
         })
      })


      context('isOwnerOrOps', async () => {

         it('isOwnerOrOps(0)', async () => {
            assert.equal(await instance.methods.isOwnerOrOps(0).call(), false)
         })

         it('isOwnerOrOps(this)', async () => {
            assert.equal(await instance.methods.isOwnerOrOps(instance._address).call(), false)
         })

         it('isOwnerOrOps(owner)', async () => {
            assert.equal(await instance.methods.isOwnerOrOps(owner).call(), true)
         })

         it('isOwnerOrOps(ops)', async () => {
            assert.equal(await instance.methods.isOwnerOrOps(ops).call(), false)
         })

         it('isOwnerOrOps(other account)', async () => {
            assert.equal(await instance.methods.isOwnerOrOps(otherAccount).call(), false)
         })
      })
   })


   context('isOwner', async () => {

      before(async () => {
         await instance.methods.setOpsAddress(ops).send({ from: owner })
      })


      it('isOwner(owner)', async () => {
         assert.equal(await instance.methods.isOwner(owner).call(), true)
      })

      it('isOwner(ops)', async () => {
         assert.equal(await instance.methods.isOwner(ops).call(), false)
      })
   })


   context('setOpsAddress', async () => {

      it('setOpsAddress(0)', async () => {
         assert.equal(await instance.methods.setOpsAddress(0).call({ from: owner }), true)
         Utils.checkSetOpsAddress(await instance.methods.setOpsAddress(0).send({ from: owner }), 0)
         assert.equal(await instance.methods.opsAddress().call(), 0)
      })

      it('setOpsAddress(this)', async () => {
         await TestLib.assertCallFails(instance.methods.setOpsAddress(instance._address).call({ from: owner }))
      })

      it('setOpsAddress(owner)', async () => {
         await TestLib.assertCallFails(instance.methods.setOpsAddress(owner).call({ from: owner }))
      })

      it('setOpsAddress(other account) as non-owner', async () => {
         await TestLib.assertCallFails(instance.methods.setOpsAddress(otherAccount).call({ from: otherAccount2 }))
      })

      it('setOpsAddress(other account) as ops', async () => {
         await instance.methods.setOpsAddress(ops).send({ from: owner })
         assert.equal(await instance.methods.opsAddress().call(), ops)

         await TestLib.assertCallFails(instance.methods.setOpsAddress(otherAccount).call({ from: ops }))
      })

      it('setOpsAddress(other account) as owner', async () => {
         assert.equal(await instance.methods.setOpsAddress(otherAccount).call({ from: owner }), true)
         Utils.checkSetOpsAddress(await instance.methods.setOpsAddress(otherAccount).send({ from: owner }), otherAccount)
         assert.equal(await instance.methods.opsAddress().call(), otherAccount)
      })

      it('setOpsAddress(other account) as owner and then set owner to that same address', async () => {
         assert.equal(await instance.methods.setOpsAddress(otherAccount).call({ from: owner }), true)
         Utils.checkSetOpsAddress(await instance.methods.setOpsAddress(otherAccount).send({ from: owner }), otherAccount)
         assert.equal(await instance.methods.opsAddress().call(), otherAccount)

         assert.equal(await instance.methods.initiateOwnershipTransfer(otherAccount).call({ from: owner }), true)
         Utils.checkInitiateOwnershipTransfer(await instance.methods.initiateOwnershipTransfer(otherAccount).send({ from: owner }), otherAccount)
         assert.equal(await instance.methods.owner().call(), owner)
         assert.equal(await instance.methods.proposedOwner().call(), otherAccount)

         assert.equal(await instance.methods.completeOwnershipTransfer().call({ from: otherAccount }), true)
         Utils.checkCompleteOwnershipTransfer(await instance.methods.completeOwnershipTransfer().send({ from: otherAccount }), otherAccount)
         assert.equal(await instance.methods.owner().call(), otherAccount)
         assert.equal(await instance.methods.proposedOwner().call(), 0)
      })
   })
})
