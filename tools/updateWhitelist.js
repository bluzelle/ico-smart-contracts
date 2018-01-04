// ----------------------------------------------------------------------------
// Bluzelle Whitelisting Script
//
// Copyright (c) 2017 Bluzelle Networks Pte Ltd.
// http://www.bluzelle.com/
// The MIT Licence.
//
// Based on whitelisting scripts from Enuma Technologies.
// Copyright (c) 2017 Enuma Technologies
// https://www.enuma.io/
// ----------------------------------------------------------------------------

const fs        = require('fs')
const Web3      = require('web3')
const Chai      = require('chai')
const BigNumber = require('bignumber.js')
const assert    = Chai.assert
const Moment    = require('moment')


//
// Configuration
//
const config          = JSON.parse(fs.readFileSync('../config.json'))
const web3Url         = config.web3Url
const abiFilePath     = '../build/BluzelleTokenSale.abi'
const opsAddress      = '0xb0030c1cc4b979ee749e71b17c082b915dcd3c92'
const contractAddress = '0x15E43D1Cdec9640Dc8cdDaB30C1578F40993b935'
const startTime       = 1511870400
const maxBatchSize    = 20 //  We don't want the batches to be too big else it will consume more gas than allowed in a block.



const web3 = new Web3(new Web3.providers.HttpProvider(web3Url))



//
// Main function to process the whitelist
//
async function run() {

   // Load the Bluzelle sale contract ABI.
   const abi = JSON.parse(fs.readFileSync(abiFilePath).toString());

   // Set default options (e.g. maximum gas allowed for transactions).
   const options = {
      gas : '4700000'
   }

   // Get instance of the contract.
   const instance = new web3.eth.Contract(abi, contractAddress, options)

   // Do some checks to make sure we are talking to the right contract.
   assert.equal(await instance.methods.startTime().call(), startTime)

   // Get the list of addresses to whitelist
   const addresses = await getAddresses()

   if (!addresses || addresses.length == 0) {
      console.log('No address to process')
      system.exit(1)
   }

   // Update the whitelist 1 address at a time as opposed to in batch.
   const stage = 1
   //await updateWhitelist1By1(instance, addresses, stage)
   await updateWhitelistBatch(instance, addresses, stage)

   console.log(addresses.length + ' addresses processed successfully.')
}



async function updateWhitelist1By1(instance, addresses, stage) {

   for (var i = 0; i < addresses.length; i++) {
      const address = addresses[i]

      // Just do a sanity check first to make sure everything is ok. It should return true.
      assert.equal(await instance.methods.setWhitelistedStatus(address, stage).call({ from: opsAddress }), true)

      // Send the transaction to the blockchain.
      const receipt = await instance.methods.setWhitelistedStatus(address, stage).send({ from: opsAddress })

      // Make sure the receipt looks correct
      assert.equal(receipt.events.WhitelistedStatusUpdated.event, "WhitelistedStatusUpdated")
      assert.equal(receipt.events.WhitelistedStatusUpdated.returnValues._address, address)
      assert.equal(receipt.events.WhitelistedStatusUpdated.returnValues._stage, stage)

      // Verify the whitelisted state in the sale contract
      assert.equal(await instance.methods.whitelist(address).call(), stage)
   }
}


async function updateWhitelistBatch(instance, addresses, stage) {

   // Break the list of addresses into batches
   var batches = []
   var tempArray = addresses.slice()
   while (tempArray.length > 0) {
      const batch = tempArray.splice(0, maxBatchSize)
      batches.push(batch)
   }

   // Process addresses in batch
   console.log('Sending whitelist info in ' + batches.length + ' batches.')
   for (var i = 0; i < batches.length; i++) {
      console.log('Processing batch ' + (i + 1) + ' of ' + batches.length)

      const batch = batches[i]

      // Just do a sanity check first to make sure everything is ok. It should return true.
      assert.equal(await instance.methods.setWhitelistedBatch(batch, stage).call({ from: opsAddress }), true)

      // Send the transaction to the blockchain.
      const receipt = await instance.methods.setWhitelistedBatch(batch, stage).send({ from: opsAddress })
      console.log(receipt)

      // Validate the receipt
      const events = receipt.events.WhitelistedStatusUpdated
      assert.equal(Object.keys(events).length, batch.length)
      for (var j = 0; j < batch.length; j++) {
         assert.equal(events[j].returnValues._address, batch[j])
         assert.equal(events[j].returnValues._stage, stage)

         // Verify the whitelisted state in the sale contract
         assert.equal(await instance.methods.whitelist(batch[j]).call(), stage)
      }
   }
}


//
// getAddresses - Helper function to read whitelist addresses from stdin
//
async function getAddresses() {

   const lines = fs.readFileSync(0).toString().trim().split("\n")

   if (lines.length == 0) {
      console.log("No lines to process from stdin.")
      system.exit(1)
   }

   var addresses = []
   for (var i = 0; i < lines.length; i++) {
      const address = lines[i].trim()

      // Make sure that all addresses we read from stdin are checksumed.
      if (web3.utils.checkAddressChecksum(address) !== true) {
         console.log("Invalid checksumed address: " + address)
         system.exit(1)
      }

      addresses.push(address)
   }

   return addresses
}


run()
