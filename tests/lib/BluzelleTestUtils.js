// ----------------------------------------------------------------------------
// Bluzelle Unit Test Utilities
//
// Copyright (c) 2017 Bluzelle Networks Pte Ltd.
// http://www.bluzelle.com/
//
// The MIT Licence.
// ----------------------------------------------------------------------------

const TestLib = require('../../tools/testlib.js')


module.exports.checkSetCurrentStage = (receipt, newStage) => {

   TestLib.checkStatus(receipt)

   assert.equal(Object.keys(receipt.events).length, 1)
   assert.equal(typeof receipt.events.CurrentStageUpdated, 'object')
   const eventArgs = receipt.events.CurrentStageUpdated.returnValues
   assert.equal(Object.keys(eventArgs).length, 2)
   assert.equal(eventArgs._newStage, newStage)
}


module.exports.checkSetWhitelistedStatus = (receipt, address, stage) => {

   TestLib.checkStatus(receipt)

   assert.equal(Object.keys(receipt.events).length, 1)
   assert.equal(typeof receipt.events.WhitelistedStatusUpdated, 'object')
   const eventArgs = receipt.events.WhitelistedStatusUpdated.returnValues
   assert.equal(Object.keys(eventArgs).length, 4)
   assert.equal(eventArgs._address, address)
   assert.equal(eventArgs._stage, stage)
}


module.exports.checkSetWhitelistedBatch = (receipt, addresses, stages) => {

   TestLib.checkStatus(receipt)

   assert.equal(Object.keys(receipt.events).length, 1)
   assert.equal(typeof receipt.events.WhitelistedStatusUpdated, 'object')
   const eventsArray = receipt.events.WhitelistedStatusUpdated
   assert.equal(eventsArray.length, addresses.length)

   for (i = 0; i < addresses.length; i++) {
      const e = eventsArray[i]

      assert.equal(e.event, 'WhitelistedStatusUpdated')
      assert.equal(Object.keys(e.returnValues).length, 4)
      assert.equal(e.returnValues._address, addresses[i])
      assert.equal(e.returnValues._stage, stages[i])
   }
}
