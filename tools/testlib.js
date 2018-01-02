// ----------------------------------------------------------------------------
// testlib.js (Lite) - Library used for writing unit tests.
// Enuma Blockchain Framework
//
// Copyright (c) 2017 Enuma Technologies.
// http://www.enuma.io/
// ----------------------------------------------------------------------------

const Web3 = require('web3')
const Path = require('path')
const Chai = require('chai')

const Utils = require('./utils.js')


// GLOBALS
BigNumber = require('bignumber.js')
assert    = Chai.assert
Moment    = require('moment')
web3      = null

var fn = assert.equal

assert.equal = (a, b, c) => {

   if (a !== null && b !== null && typeof a !== 'undefined' && typeof b !== 'undefined' && a.constructor.name == 'BigNumber' && b.constructor.name == 'BigNumber') {
      assert.isTrue(a.eq(b), "BigNumber " + a.toString() + " is not equal to " + b.toString())
   } else {
      fn(a, b, c)
   }
}


module.exports.initialize = async () => {
    web3 = await Utils.buildWeb3('http://localhost:8545')
}


module.exports.deploy = async (name, args, options) => {

   return await Utils.deployContract(name, args, options)
}


module.exports.checkStatus = (receipt) => {
   checkStatus(receipt)
}


function checkStatus(receipt) {
   // Since the Ethereum Byzantium fork, there is a status field in the receipt.
   // That flag doesn't exist in the testrpc implementation yet. Remove the typeof check once it's added.
   // https://ethereum.stackexchange.com/questions/28077/how-do-i-detect-a-failed-transaction-after-the-byzantium-fork-as-the-revert-opco
   if (typeof receipt.status !== 'undefined') {
      assert.equal(receipt.status, 1)
   }
}


module.exports.getBalance = function (address) {
  return new Promise (function (resolve, reject) {
    web3.eth.getBalance(address, function (error, result) {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    })
  })
}


module.exports.getGasPrice = function () {
  return new Promise (function (resolve, reject) {
    web3.eth.getGasPrice(function (error, result) {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    })
  })
}


module.exports.assertNoEvents = (receipt) => {
   assert.equal(Object.keys(receipt.events).length, 0, "expected empty array of events")
}


module.exports.assertThrows = async (promise) => {
   try {
      await promise
   } catch (error) {
      const isInvalidOpcode = error.message.indexOf('invalid opcode') > -1
      const isOutOfGas      = error.message.indexOf('out of gas') > -1
      const isDecode        = error.message.indexOf("Couldn't decode") > -1 && error.message.indexOf("from ABI: 0x") > -1

      assert(isInvalidOpcode || isOutOfGas || isDecode, "Expected transaction to fail, but got an error instead: " + error)

      return
   }

   assert(false, "Did not throw as expected")
}
