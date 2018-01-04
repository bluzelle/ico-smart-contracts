// ----------------------------------------------------------------------------
// Math Library Tests
// Enuma Blockchain Platform
//
// Copyright (c) 2017 Enuma Technologies.
// https://www.enuma.io/
// ----------------------------------------------------------------------------

const Utils = require('./lib/StdTestUtils.js')


// ** Note **
// In order to test the Math library, we use a wrapper contract.

// ----------------------------------------------------------------------------
// Tests Summary
// ----------------------------------------------------------------------------
// add
//    - add(0, 0)
//    - add(0, 1)
//    - add(1, 1)
//    - add(uint256, 0)
//    - add(uint256, 1)
//    - add(1, uint256)
//    - add(uint256, uint256)
// sub
//    - sub(0, 0)
//    - sub(0, 1)
//    - sub(1, 0)
//    - sub(1, 1)
//    - sub(uint256, 0)
//    - sub(uint256, 1)
//    - sub(0, uint256)
//    - sub(1, uint256)
//    - sub(uint256, uint256)
// mul
//    - mul(0, 0)
//    - mul(0, 1)
//    - mul(1, 0)
//    - mul(1, 1)
//    - mul(2, 3)
//    - mul(uint256, 0)
//    - mul(uint256, 1)
//    - mul(1, uint256)
//    - mul(uint256, 2)
//    - mul(2, uint256)
//    - mul(uint256, uint256)
// div
//    - div(0, 0)
//    - div(0, 1)
//    - div(0, 2)
//    - div(1, 0)
//    - div(1, 1)
//    - div(1, 2)
//    - div(1, 3)
//    - div(2, 3)
//    - div(3, 3)
//    - div(4, 3)
//    - div(5, 3)
//    - div(6, 3)
//    - div(uint256, 0)
//    - div(uint256, 1)
//    - div(uint256, 2)
//    - div(0, uint256)
//    - div(1, uint256)
//    - div(uint256, uint256)
//
describe('Math Library', () => {

   var math = null
   var uint256 = null

   before(async () => {

      deploymentResult = await TestLib.deploy('MathTest', [ ])

      math = deploymentResult.instance

      uint256Max = new BigNumber(2).pow(256).sub(1)
   })


   context('add', async () => {

      it('add(0, 0)', async () => {
         assert.equal(await math.methods.add(0, 0).call(), 0)
      })

      it('add(0, 1)', async () => {
         assert.equal(await math.methods.add(0, 1).call(), 1)
      })

      it('add(1, 1)', async () => {
         assert.equal(await math.methods.add(1, 1).call(), 2)
      })

      it('add(uint256, 0)', async () => {
         assert.equal(new BigNumber(await math.methods.add(uint256Max, 0).call()), uint256Max)
      })

      it('add(0, uint256)', async () => {
         assert.equal(new BigNumber(await math.methods.add(0, uint256Max).call()), uint256Max)
      })

      it('add(uint256, 1)', async () => {
         await TestLib.assertCallFails(math.methods.add(uint256Max, 1).call())
      })

      it('add(1, uint256)', async () => {
         await TestLib.assertCallFails(math.methods.add(1, uint256Max).call())
      })

      it('add(uint256, uint256)', async () => {
         await TestLib.assertCallFails(math.methods.add(uint256Max, uint256Max).call())
      })

   })


   context('sub', async () => {

      it('sub(0, 0)', async () => {
         assert.equal(await math.methods.sub(0, 0).call(), 0)
      })

      it('sub(0, 1)', async () => {
         await TestLib.assertCallFails(math.methods.sub(0, 1).call())
      })

      it('sub(1, 0)', async () => {
         assert.equal(await math.methods.sub(1, 0).call(), 1)
      })

      it('sub(1, 1)', async () => {
         assert.equal(await math.methods.sub(1, 1).call(), 0)
      })

      it('sub(uint256, 0)', async () => {
         assert.equal(new BigNumber(await math.methods.sub(uint256Max, 0).call()), uint256Max)
      })

      it('sub(uint256, 1)', async () => {
         assert.equal(new BigNumber(await math.methods.sub(uint256Max, 1).call()), uint256Max.sub(1))
      })

      it('add(0, uint256)', async () => {
         await TestLib.assertCallFails(math.methods.sub(0, uint256Max).call())
      })

      it('add(1, uint256)', async () => {
         await TestLib.assertCallFails(math.methods.sub(1, uint256Max).call())
      })

      it('sub(uint256, uint256)', async () => {
         assert.equal(new BigNumber(await math.methods.sub(uint256Max, uint256Max).call()), 0)
      })
   })


   context('mul', async () => {

      it('mul(0, 0)', async () => {
         assert.equal(await math.methods.mul(0, 0).call(), 0)
      })

      it('mul(0, 1)', async () => {
         assert.equal(await math.methods.mul(0, 1).call(), 0)
      })

      it('mul(1, 0)', async () => {
         assert.equal(await math.methods.mul(1, 0).call(), 0)
      })

      it('mul(1, 1)', async () => {
         assert.equal(await math.methods.mul(1, 1).call(), 1)
      })

      it('mul(2, 2)', async () => {
         assert.equal(await math.methods.mul(2, 2).call(), 4)
      })

      it('mul(uint256, 0)', async () => {
         assert.equal(new BigNumber(await math.methods.mul(uint256Max, 0).call()), 0)
      })

      it('mul(uint256, 1)', async () => {
         assert.equal(new BigNumber(await math.methods.mul(uint256Max, 1).call()), uint256Max)
      })

      it('mul(uint256, 2)', async () => {
         await TestLib.assertCallFails(math.methods.mul(uint256Max, 2).call())
      })

      it('mul(2, uint256)', async () => {
         await TestLib.assertCallFails(math.methods.mul(2, uint256Max).call())
      })

      it('mul(uint256, uint256)', async () => {
         await TestLib.assertCallFails(math.methods.mul(uint256Max, uint256Max).call())
      })
   })


//    - div(0, 0)
//    - div(0, 1)
//    - div(0, 2)
//    - div(1, 0)
//    - div(1, 1)
//    - div(1, 2)
//    - div(1, 3)
//    - div(2, 3)
//    - div(3, 3)
//    - div(4, 3)
//    - div(5, 3)
//    - div(6, 3)
//    - div(uint256, 0)
//    - div(uint256, 1)
//    - div(uint256, 2)
//    - div(0, uint256)
//    - div(1, uint256)
//    - div(uint256, uint256)
   context('div', async () => {

      it('div(0, 0)', async () => {
         await TestLib.assertCallFails(math.methods.div(0, 0).call())
      })

      it('div(0, 1)', async () => {
         assert.equal(await math.methods.div(0, 1).call(), 0)
      })

      it('div(0, 2)', async () => {
         assert.equal(await math.methods.div(0, 2).call(), 0)
      })

      it('div(1, 0)', async () => {
         await TestLib.assertCallFails(math.methods.div(1, 0).call())
      })

      it('div(1, 1)', async () => {
         assert.equal(await math.methods.div(1, 1).call(), 1)
      })

      it('div(1, 2)', async () => {
         assert.equal(await math.methods.div(1, 2).call(), 0)
      })

      it('div(1, 3)', async () => {
         assert.equal(await math.methods.div(1, 3).call(), 0)
      })

      it('div(2, 3)', async () => {
         assert.equal(await math.methods.div(2, 3).call(), 0)
      })

      it('div(3, 3)', async () => {
         assert.equal(await math.methods.div(3, 3).call(), 1)
      })

      it('div(4, 3)', async () => {
         assert.equal(await math.methods.div(4, 3).call(), 1)
      })

      it('div(5, 3)', async () => {
         assert.equal(await math.methods.div(5, 3).call(), 1)
      })

      it('div(6, 3)', async () => {
         assert.equal(await math.methods.div(6, 3).call(), 2)
      })

      it('div(uint256, 0)', async () => {
         await TestLib.assertCallFails(math.methods.div(uint256Max, 0).call())
      })

      it('div(uint256, 1)', async () => {
         assert.equal(new BigNumber(await math.methods.div(uint256Max, 1).call()), uint256Max)
      })

      it('div(uint256, 2)', async () => {
         assert.equal(new BigNumber(await math.methods.div(uint256Max, 2).call()), uint256Max.div(2).trunc())
      })

      it('div(0, uint256)', async () => {
         assert.equal(await math.methods.div(0, uint256Max).call(), 0)
      })

      it('div(1, uint256)', async () => {
         assert.equal(await math.methods.div(1, uint256Max).call(), 0)
      })

      it('div(uint256, uint256)', async () => {
         assert.equal(await math.methods.div(uint256Max, uint256Max).call(), 1)
      })
   })
})
