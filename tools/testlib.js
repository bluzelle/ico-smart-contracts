// ----------------------------------------------------------------------------
// testlib.js (Lite) - Library used for writing unit tests.
// Enuma Blockchain Platform
//
// Copyright (c) 2017 Enuma Technologies.
// https://www.enuma.io/
// ----------------------------------------------------------------------------

const fs   = require('fs')
const Web3 = require('web3')
const Path = require('path')
const Chai = require('chai')


const Utils = require('./utils.js')


// GLOBALS
global.BigNumber = require('bignumber.js')
global.assert    = Chai.assert
global.Moment    = require('moment')
global.web3      = null


var fn = assert.equal

assert.equal = (a, b, c) => {

   if (a !== null && b !== null && typeof a !== 'undefined' && typeof b !== 'undefined' && a.constructor.name == 'BigNumber' && b.constructor.name == 'BigNumber') {
      assert.isTrue(a.eq(b), "BigNumber " + a.toString() + " is not equal to " + b.toString())
   } else {
      fn(a, b, c)
   }
}


module.exports.initialize = async () => {
   const configFilePath = Utils.findConfigFilePath(Path.resolve('./'))
   const config = JSON.parse(fs.readFileSync(configFilePath))

   global.web3 = await Utils.buildWeb3(config.web3Url)
}


module.exports.deploy = async (name, args, options) => {

   return await Utils.deployContract(web3, name, args, options)
}


module.exports.checkStatus = (receipt) => {
   checkStatus(receipt)
}


function checkStatus(receipt) {
   // Since the Ethereum Byzantium fork, there is a status field in the receipt.
   assert.equal(receipt.status, 1, "Transaction receipt 'status' != 1")
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


module.exports.assertSendFails = async (promise) => {
   try {
      const receipt = await promise
      assert(receipt.status == '0x0', "Expected transaction receipt to have status 0")
   } catch (error) {
      const isRevert = /^.+VM Exception.+revert$/.test(error.message)
      //const isInvalidOpcode = error.message.indexOf('invalid opcode') > -1
      //const isOutOfGas      = error.message.indexOf('out of gas') > -1

      //assert(isInvalidOpcode || isOutOfGas || isDecode, "Expected transaction to fail, but got an error instead: " + error)
      assert(isRevert, "Expected transaction to fail, but got an error instead: " + error)
   }
}


module.exports.assertCallFails = async (promise) => {
   try {
      await promise
   } catch (error) {
      const isInvalidOpcode = /^.+VM Exception.+invalid opcode$/.test(error.message)
      const isCallFailure   = /^.+decode.+from ABI: 0x$/.test(error.message)
      const isRevert        = /^.+VM Exception.+revert$/.test(error.message)

      assert(isCallFailure || isRevert || isInvalidOpcode, "Expected 'call' to fail, but got an error instead: " + error)

      return
   }

   assert(false, "Did not throw as expected")
}

