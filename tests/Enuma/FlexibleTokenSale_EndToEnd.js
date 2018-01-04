// ----------------------------------------------------------------------------
// FlexibleTokenSale End-To-End Scenario Test
// Enuma Blockchain Platform
//
// Copyright (c) 2017 Enuma Technologies.
// https://www.enuma.io/
// ----------------------------------------------------------------------------

const StdUtils = require('./lib/StdTestUtils.js')


// ----------------------------------------------------------------------------
// Tests Summary
// ----------------------------------------------------------------------------
// - Initial Deployment
//    - Deploy the token contract
//    - Deploy the sale contract
//    - Initialize the sale contract
//    - Set the ops key of token to the sale contract
//    - Set the ops key of sale to a ops key
// - Before Presale
//    - Set the sale window
//    - Set the bonus amount
//    - Set the per account contribution limit
//    - Set the token price
//    - Give tokens to the sale contract
// - During Presale
//    - Contributor makes purchase
//    - Contributor makes purchase on behalf of another account
//    - Suspend the presale
//    - Change the bonus amount to 1500 (15.00% bonus)
//    - Resume the presale
//    - Contributor makes purchase
//    - Change the window end time to end presale early
// - After Presale
//    - Reclaim unsold tokens
// - Before Public Sale
//    - Set new time window for the public sale
//    - Set a new bonus amount
//    - Set the per account contribution limit
//    - Assign new amount of tokens for sale
// - During Public Sale
//    - Contributor buys max allowed tokens
//    - Raise per account contribution limit
//    - Contributor buys max allowed tokens
//    - Remove the account contribution limit
//    - Contributor buys all remaining tokens
// - After Public Sale
//    - Reclaim tokens (should be 0)
//    - Finalize the token
//    - Finalize the sale
//
describe('FlexibleTokenSale End-To-End Scenario', () => {

   const TOKEN_NAME            = "FinalizableToken"
   const TOKEN_SYMBOL          = "FNT"
   const TOKEN_DECIMALS        = 18
   const DECIMALS_FACTOR       = new BigNumber(10).pow(TOKEN_DECIMALS)
   const TOKEN_TOTALSUPPLY     = new BigNumber("500000000").mul(DECIMALS_FACTOR)

   const CONTRIBUTION_MIN      = new BigNumber(0.1).mul(DECIMALS_FACTOR)


   // Presale configuration
   const PRESALE_TOKENS                 = new BigNumber("15000000").mul(DECIMALS_FACTOR)
   const PRESALE_TOKENSPERKETHER        = 1700000
   const PRESALE_BONUS                  = 2000
   const PRESALE_MAXTOKENSPERACCOUNT    = new BigNumber(17000).mul(DECIMALS_FACTOR)
   const PRESALE_STARTTIME              = Moment().add(1, 'months')
   const PRESALE_ENDTIME                = Moment().add(2, 'months')

   // Public sale configuration
   const PUBLICSALE_TOKENS              = new BigNumber("85000000").mul(DECIMALS_FACTOR)
   const PUBLICSALE_TOKENSPERKETHER     = 1700000
   const PUBLICSALE_BONUS               = 0
   const PUBLICSALE_MAXTOKENSPERACCOUNT = new BigNumber(50000).mul(DECIMALS_FACTOR)
   const PUBLICSALE_STARTTIME           = Moment(PRESALE_STARTTIME).add(2, 'days')
   const PUBLICSALE_ENDTIME             = Moment(PUBLICSALE_STARTTIME).add(1, 'months')


   var sale = null
   var token = null
   var accounts = null

   // Accounts used for testing
   var owner    = null
   var ops      = null
   var wallet   = null
   var account1 = null
   var account2 = null
   var account3 = null
   var account4 = null
   var account5 = null
   var account6 = null
   var account7 = null


   const buyTokens = async (from, to, amount) => {
      return StdUtils.buyTokens(
         token,
         sale,
         owner,
         wallet,
         DECIMALS_FACTOR,
         from,
         to,
         amount
      )
   }


   before(async () => {
      await TestLib.initialize()

      accounts = await web3.eth.getAccounts()

      owner    = accounts[1]
      ops      = accounts[2]
      wallet   = accounts[3]
      account1 = accounts[4]
      account2 = accounts[5]
      account3 = accounts[6]
      account4 = accounts[7]
      account5 = accounts[8]
      account6 = accounts[9]
      account7 = accounts[10]

      var deploymentResult = null
   })


   context('Initial deployment', async () => {

      it('Deploy the token contract', async () => {
         deploymentResult = await TestLib.deploy('FinalizableToken', [ TOKEN_NAME, TOKEN_SYMBOL, TOKEN_DECIMALS, TOKEN_TOTALSUPPLY ], { from: owner })
         token = deploymentResult.instance

         assert.equal(new BigNumber(await token.methods.balanceOf(owner).call()), TOKEN_TOTALSUPPLY)
      })

      it('Deploy the sale contract', async () => {
         deploymentResult = await TestLib.deploy('FlexibleTokenSaleMock', [ PRESALE_STARTTIME.unix(), PRESALE_ENDTIME.unix(), wallet, Moment().unix() ], { from: owner })
         sale = deploymentResult.instance

         assert.equal(await sale.methods.owner().call(), owner)
      })

      it('Initialize the sale contract', async () => {
         await sale.methods.initialize(token._address).send({ from: owner })
         assert.equal(await sale.methods.token().call(), token._address)
         assert.equal(new BigNumber(await sale.methods.tokenConversionFactor().call()), new BigNumber(10).pow(18 - TOKEN_DECIMALS + 3 + 4))
      })

      it('Set the ops key of the token to the sale contract', async () => {
         await token.methods.setOpsAddress(sale._address).send({ from: owner })
         assert.equal(await token.methods.opsAddress().call(), sale._address)
      })

      it('Set the ops key of the sale to a ops key', async () => {
         await sale.methods.setOpsAddress(ops).send({ from: owner })
         assert.equal(await sale.methods.opsAddress().call(), ops)
      })
   })


   context('Before presale', async () => {

      it('Set the sale window', async () => {
         await sale.methods.setSaleWindow(PRESALE_STARTTIME.unix(), PRESALE_ENDTIME.unix()).send({ from: owner })
         assert.equal(await sale.methods.startTime().call(), PRESALE_STARTTIME.unix())
         assert.equal(await sale.methods.endTime().call(), PRESALE_ENDTIME.unix())
      })

      it('Set bonus amount', async () => {
         await sale.methods.setBonus(PRESALE_BONUS).send({ from: owner })
         assert.equal(await sale.methods.bonus().call(), PRESALE_BONUS)
      })

      it('Set per account contribution limit', async () => {
         await sale.methods.setMaxTokensPerAccount(PRESALE_MAXTOKENSPERACCOUNT).send({ from: owner })
         assert.equal(new BigNumber(await sale.methods.maxTokensPerAccount().call()), PRESALE_MAXTOKENSPERACCOUNT)
      })

      it('Set the token price', async () => {
         await sale.methods.setTokensPerKEther(PRESALE_TOKENSPERKETHER).send({ from: owner })
         assert.equal(await sale.methods.tokensPerKEther().call(), PRESALE_TOKENSPERKETHER)
      })

      it('Give tokens to the sale contract', async () => {
         await token.methods.transfer(sale._address, PRESALE_TOKENS).send({ from: owner })
         assert.equal(new BigNumber(await token.methods.balanceOf(sale._address).call()), PRESALE_TOKENS)
      })
   })


   context('During Presale', async () => {

      before(async () => {
         await sale.methods.changeTime(PRESALE_STARTTIME.unix() + 1).send({ from: owner })
      })


      it('Contributor makes purchase', async () => {
         await buyTokens(account1, account1, new BigNumber(web3.utils.toWei('0.1', 'ether')))
      })

      it('Contributor makes purchase on behalf of another account', async () => {
         await buyTokens(account6, account2, new BigNumber(web3.utils.toWei('0.1', 'ether')))
      })

      it('Suspend the sale', async () => {
         await sale.methods.suspend().send({ from: owner })
         assert.equal(await sale.methods.suspended().call(), true)
      })

      it('Change the bonus amount to 1500 (15.00% bonus)', async () => {
         await sale.methods.setBonus(1500).send({ from: owner })
         assert.equal(await sale.methods.bonus().call(), 1500)
      })

      it('Resume the sale', async () => {
         await sale.methods.resume().send({ from: owner })
         assert.equal(await sale.methods.suspended().call(), false)
      })

      it('Contributor makes purchase', async () => {
         await buyTokens(account2, account2, new BigNumber(web3.utils.toWei('0.1', 'ether')))
      })

      it('Change the time window to end the presale early', async () => {
         await sale.methods.setSaleWindow(PRESALE_STARTTIME.unix(), Moment(PRESALE_ENDTIME).subtract(3, 'days').unix()).send({ from: owner })
         await sale.methods.changeTime(Moment(PRESALE_ENDTIME).subtract(1, 'days').unix()).send({ from: owner })
         await TestLib.assertCallFails(buyTokens(account2, account2, new BigNumber(web3.utils.toWei('0.1', 'ether'))))
      })
   })


   context('After Presale', async() => {

      it('Reclaim unsold tokens', async () => {
         const ownerTokensBefore = new BigNumber(await token.methods.balanceOf(owner).call())
         const saleTokensBefore = new BigNumber(await token.methods.balanceOf(sale._address).call())

         await sale.methods.reclaimTokens().send({ from: owner })

         const ownerTokensAfter = new BigNumber(await token.methods.balanceOf(owner).call())
         const saleTokensAfter = new BigNumber(await token.methods.balanceOf(sale._address).call())

         assert.isTrue(saleTokensBefore.gt(0))
         assert.equal(saleTokensAfter, new BigNumber(0))

         assert.equal(ownerTokensAfter.sub(ownerTokensBefore), saleTokensBefore)
      })
   })


   context('Before Public Sale', async () => {

      it('Set new time window for the public sale', async () => {
         await sale.methods.setSaleWindow(PUBLICSALE_STARTTIME.unix(), PUBLICSALE_ENDTIME.unix()).send({ from: owner })
         assert.equal(await sale.methods.startTime().call(), PUBLICSALE_STARTTIME.unix())
         assert.equal(await sale.methods.endTime().call(), PUBLICSALE_ENDTIME.unix())
      })

      it('Set a new bonus amount', async () => {
         await sale.methods.setBonus(PUBLICSALE_BONUS).send({ from: owner })
         assert.equal(await sale.methods.bonus().call(), PUBLICSALE_BONUS)
      })

      it('Set per account contribution limit', async () => {
         await sale.methods.setMaxTokensPerAccount(PUBLICSALE_MAXTOKENSPERACCOUNT).send({ from: owner })
         assert.equal(new BigNumber(await sale.methods.maxTokensPerAccount().call()), PUBLICSALE_MAXTOKENSPERACCOUNT)
      })

      it('Set the token price', async () => {
         await sale.methods.setTokensPerKEther(PUBLICSALE_TOKENSPERKETHER).send({ from: owner })
         assert.equal(await sale.methods.tokensPerKEther().call(), PUBLICSALE_TOKENSPERKETHER)
      })

      it('Give tokens to the sale contract', async () => {
         await token.methods.transfer(sale._address, PUBLICSALE_TOKENS).send({ from: owner })
         assert.equal(new BigNumber(await token.methods.balanceOf(sale._address).call()), PUBLICSALE_TOKENS)
      })
   })


   context('During Public Sale', async () => {

      var tokenSoldPresale = null


      before(async () => {
         await sale.methods.changeTime(PUBLICSALE_STARTTIME.unix() + 1).send({ from: owner })

         tokensSoldPresale = new BigNumber(await sale.methods.totalTokensSold().call())
      })


      it('Contributor buys max allowed tokens', async () => {
         await buyTokens(account7, account7, -1)
      })

      it('Raise per account contribution limit', async () => {
         await sale.methods.setMaxTokensPerAccount(PUBLICSALE_MAXTOKENSPERACCOUNT.mul(2)).send({ from: owner })
      })

      it('Contributor buys max allowed tokens', async () => {
         await buyTokens(account7, account7, -1)
      })

      it('Remove per account contribution limit', async () => {
         await sale.methods.setMaxTokensPerAccount(0).send({ from: owner })
      })

      it('Contributor buys all remaining tokens', async () => {
         await buyTokens(account7, account7, -1)

         assert.equal(new BigNumber(await sale.methods.totalTokensSold().call()), tokensSoldPresale.add(PUBLICSALE_TOKENS))
      })
   })


   context('After Public Sale', async () => {

      it('Reclaim unsold tokens', async () => {
         const ownerTokensBefore = new BigNumber(await token.methods.balanceOf(owner).call())
         const saleTokensBefore = new BigNumber(await token.methods.balanceOf(sale._address).call())

         await sale.methods.reclaimTokens().send({ from: owner })

         const ownerTokensAfter = new BigNumber(await token.methods.balanceOf(owner).call())
         const saleTokensAfter = new BigNumber(await token.methods.balanceOf(sale._address).call())

         assert.isTrue(saleTokensBefore.eq(0))
         assert.equal(saleTokensAfter, new BigNumber(0))

         assert.equal(ownerTokensAfter.sub(ownerTokensBefore), 0)
      })

      it('Finalize the token', async () => {
         assert.equal(await token.methods.finalized().call(), false)
         await token.methods.finalize().send({ from: owner })
         assert.equal(await token.methods.finalized().call(), true)
      })

      it('Finalize the sale', async () => {
         // IMPORTANT: Finalizing the sale contract means that it can never be used for later sales. Another
         //            sale contract would need to be deployed. If the contract should be used to more sales
         //            in the future, consider calling 'suspend' instead.
         assert.equal(await sale.methods.finalized().call(), false)
         await sale.methods.finalize().send({ from: owner })
         assert.equal(await sale.methods.finalized().call(), true)
      })
   })
})
