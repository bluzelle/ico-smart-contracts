// ----------------------------------------------------------------------------
// Bluzelle Contracts Deployment Script
//
// Copyright (c) 2017 Bluzelle Networks Pte Ltd.
// http://www.bluzelle.com/
//
// The MIT Licence.
// ----------------------------------------------------------------------------

const Web3         = require('web3')
const BigNumber    = require('bignumber.js')
const Moment       = require('moment')
const Chai         = require('chai')
assert             = Chai.assert

const Utils        = require('./utils.js')


// ----------------------------------------------------------------------------
// Script Summary
// ----------------------------------------------------------------------------
// This script is used for the initial deployment of the Bluzelle token and
// token sale smart contracts to the Ethereum network (testnet or mainnet).
// Here are the steps that it covers:
//
// 1. Deploy the token contract.
// 2. Deploy the sale contract.
// 3. Initialize the sale contract.
// 4. Set the ops key of token to the sale contract.
// 5. Set the ops key of sale to a ops key.
// 6. Send presale tokens from owner to sale contract.
// ** For each step, validate all properties and events.
// ----------------------------------------------------------------------------


const TOKEN_NAME            = "Bluzelle Token"
const TOKEN_SYMBOL          = "BLZ"
const TOKEN_DECIMALS        = 18
const DECIMALS_FACTOR       = new BigNumber(10).pow(TOKEN_DECIMALS)
const TOKEN_TOTALSUPPLY     = new BigNumber("500000000").mul(DECIMALS_FACTOR)

const CONTRIBUTION_MIN      = new BigNumber(0.1).mul(DECIMALS_FACTOR)


// Presale configuration
const PRESALE_TOKENS                 = new BigNumber("15000000").mul(DECIMALS_FACTOR)
const PRESALE_TOKENSPERKETHER        = new BigNumber("1700000")
const PRESALE_BONUS                  = new BigNumber("12000")
const PRESALE_MAXTOKENSPERACCOUNT    = new BigNumber("17000").mul(DECIMALS_FACTOR)
const PRESALE_STARTTIME              = 1511870400
const PRESALE_ENDTIME                = 1512043200


var sale = null
var token = null
var accounts = null

// Accounts used for testing
var owner    = null
var ops      = null
var wallet   = null

var receipts = []


function recordTransaction(description, receipt, display) {
   if (display) {
      console.log("TxID     : " + receipt.transactionHash)
      console.log("Gas used : " + receipt.gasUsed)
   }

   receipts.push([ description, receipt ])
}


async function run() {

   const web3 = await Utils.buildWeb3('http://localhost:8545')

   accounts = await web3.eth.getAccounts()

   owner    = accounts[1]
   ops      = accounts[2]
   wallet   = accounts[3]

   var o = null
   var receipt = null
   var returnValues = null
   var deploymentResult = null


   console.log('')
   console.log('----------------------------------------------------------------------------------')

   //
   // Verify that all addresses are checksumed
   //
   assert.equal(web3.utils.checkAddressChecksum(owner), true)
   assert.equal(web3.utils.checkAddressChecksum(ops), true)
   assert.equal(web3.utils.checkAddressChecksum(wallet), true)

   //
   //
   // Deploy BluzelleToken
   //
   deploymentResult = await Utils.deployContract('BluzelleToken', [ ], { from: owner })
   recordTransaction('BluzelleToken.new', deploymentResult.receipt, false)
   token = deploymentResult.instance
   receipt = deploymentResult.receipt

   // Check that the Bluzelle constructor did properly fire the transfer event.
   assert.equal(Object.keys(receipt.events).length, 1)
   returnValues = receipt.events.Transfer.returnValues
   assert.equal(Object.keys(returnValues).length, 6)
   assert.equal(returnValues._from, 0)
   assert.equal(returnValues._to, owner)
   assert.equal(returnValues._value, TOKEN_TOTALSUPPLY.toNumber())

   // Check that the owner token balance is as expected
   assert.isTrue(new BigNumber(await token.methods.balanceOf(owner).call()).eq(TOKEN_TOTALSUPPLY))
   console.log('')

   //
   // Deploy BluzelleTokenSale
   //
   //deploymentResult = await Utils.deployContract('BluzelleTokenSaleMock', [ wallet, Moment().unix() ], { from: owner })
   deploymentResult = await Utils.deployContract('BluzelleTokenSale', [ wallet ], { from: owner })
   recordTransaction('BluzelleTokenSale.new', deploymentResult.receipt)
   sale = deploymentResult.instance
   assert.equal(await sale.methods.owner().call(), owner)
   assert.equal(await sale.methods.currentStage().call(), 1)
   assert.equal(await sale.methods.bonus().call(), PRESALE_BONUS)
   assert.equal(await sale.methods.tokensPerKEther().call(), PRESALE_TOKENSPERKETHER.toNumber())
   assert.equal(await sale.methods.maxTokensPerAccount().call(), PRESALE_MAXTOKENSPERACCOUNT.toNumber())
   assert.equal(await sale.methods.startTime().call(), PRESALE_STARTTIME)
   assert.equal(await sale.methods.endTime().call(), PRESALE_ENDTIME)
   console.log('')

   //
   // Initialize the sale contract
   //
   console.log('Initializing the sale contract')
   o = await sale.methods.initialize(token._address).send({ from: owner })
   recordTransaction('BluzelleTokenSale.initialize', o, true)
   assert.equal(await sale.methods.token().call(), token._address)

   const factor = new BigNumber(await sale.methods.tokenConversionFactor().call())
   const expectedFactor = new BigNumber(10).pow(18 - TOKEN_DECIMALS + 3 + 4)
   assert.equal(factor.toNumber(), expectedFactor.toNumber())

   assert.equal(Object.keys(o.events).length, 1)
   assert.equal(typeof o.events.Initialized, 'object')
   console.log('')

   //
   // Set the ops keys
   //
   console.log('Setting the ops key of the token to the sale contract')
   o = await token.methods.setOpsAddress(sale._address).send({ from: owner })
   recordTransaction('BluzelleToken.setOpsAddress', o, true)
   assert.equal(await token.methods.opsAddress().call(), sale._address)
   console.log('')

   console.log('Setting the ops key of the sale to a ops key')
   o = await sale.methods.setOpsAddress(ops).send({ from: owner })
   recordTransaction('BluzelleTokenSale.setOpsAddress', o, true)
   assert.equal(await sale.methods.opsAddress().call(), ops)
   console.log('')

   //
   // Send presale tokens to the sale contract
   //
   console.log('Sending presale tokens to the sale contract')
   o = await token.methods.transfer(sale._address, PRESALE_TOKENS).send({ from: owner })
   recordTransaction('BluzelleToken.transfer', o, true)
   // Check that the Bluzelle constructor did properly fire the transfer event.
   assert.equal(Object.keys(o.events).length, 1)
   returnValues = o.events.Transfer.returnValues
   assert.equal(Object.keys(returnValues).length, 6)
   assert.equal(returnValues._from, owner)
   assert.equal(returnValues._to, sale._address)
   assert.equal(returnValues._value, PRESALE_TOKENS.toNumber())
   assert.isTrue(new BigNumber(await token.methods.balanceOf(sale._address).call()).eq(PRESALE_TOKENS))
   console.log('')

   //
   // Gas Statistics
   //
   console.log('----------------------------------------------------------------------------------')
   console.log('Gas usage summary')
   console.log('----------------------------------------------------------------------------------')
   var totalGas = 0
   for (i = 0; i < receipts.length; i++) {
      console.log(receipts[i][0].padEnd(33) + receipts[i][1].gasUsed)
      totalGas += receipts[i][1].gasUsed
   }
   console.log('----------------------------------------------------------------------------------')
   console.log('Total gas recorded '.padEnd(33) + totalGas)

   console.log('')
   console.log('Deployment completed successfully.')
   console.log('')
}


run().catch(error => {
   console.log(error)
})
