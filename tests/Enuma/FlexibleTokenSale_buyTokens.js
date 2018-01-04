// ----------------------------------------------------------------------------
// FlexibleTokenSale Contract Tests
// Enuma Blockchain Platform
//
// Copyright (c) 2017 Enuma Technologies.
// https://www.enuma.io/
// ----------------------------------------------------------------------------

const Utils = require('./lib/StdTestUtils.js')


// ----------------------------------------------------------------------------
// Tests Summary
// ----------------------------------------------------------------------------
// default payable function
//    - buyTokens as normal
// buyTokens
//    - buyTokens as normal
//    - buyTokens as ops
//    - buyTokens as owner
//    - buyTokens for another account
//    - buyTokens for 0
//    - buyTokens for this
//    - buyTokens for wallet
//    - buyTokens for owner
//    - buyTokens for ops
//    - buyTokens for token contract
//    - buyTokens with 0 ETH
//    - buyTokens with 1 wei
//    - buyTokens with minimum contribution - 1 wei
//    - buyTokens with minimum contribution
//    - buyTokens with more ETH than maxTokensPerAccount allows
//    - buyTokens with bonus = 0
//    - buyTokens with bonus = 755
//    - buyTokens with bonus = 10000
//    - buyTokens with more ETH than left for sale
//    - buyTokens with less tokens left than maxTokensPerAccount
//    - buyTokens with enough ETH to buy all tokens in a single transaction, and more...
//    - buyTokens with an additional minimum contribution
//    - buyTokens before start date
//    - buyTokens after end date
//    - buyTokens when sale finalized
//
describe('FlexibleTokenSale Contract - buyTokens tests', () => {

   const TOKEN_NAME        = "A"
   const TOKEN_SYMBOL      = "B"
   const TOKEN_DECIMALS    = 18
   const DECIMALS_FACTOR   = new BigNumber(10).pow(TOKEN_DECIMALS)
   const TOKEN_TOTALSUPPLY = new BigNumber("10000000").mul(DECIMALS_FACTOR)

   const START_TIME        = Moment().add(1, 'M').unix()
   const END_TIME          = Moment().add(2, 'M').unix()

   var contributionMin     = null

   var sale = null
   var token = null
   var accounts = null

   // Accounts used for testing
   var owner    = null
   var ops      = null
   var wallet   = null
   var account1 = null
   var account2 = null


   const buyTokens = async (from, to, amount) => {
      return Utils.buyTokens(
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


   var deploymentResult = null

   const redeploy = async () => {
      deploymentResult = await TestLib.deploy('FinalizableToken', [ TOKEN_NAME, TOKEN_SYMBOL, TOKEN_DECIMALS, TOKEN_TOTALSUPPLY ], { from: owner })
      token = deploymentResult.instance

      deploymentResult = await TestLib.deploy('FlexibleTokenSaleMock', [ START_TIME, END_TIME, wallet, START_TIME - 10000 ], { from: owner })
      sale = deploymentResult.instance

      contributionMin = new BigNumber(await sale.methods.contributionMin().call())
      assert.isTrue(contributionMin.gt(0), "Expected contributionMin to be > 0")
      await token.methods.setOpsAddress(sale._address).send({ from: owner })
      await sale.methods.setOpsAddress(ops).send({ from: owner })
      await sale.methods.initialize(token._address).send({ from: owner })
      await sale.methods.setSaleWindow(START_TIME, END_TIME).send({ from: owner })
      await sale.methods.changeTime(START_TIME + 1).send({ from: owner })

      await token.methods.transfer(sale._address, new BigNumber(5000000).mul(DECIMALS_FACTOR)).send({ from: owner })
   }


   before(async () => {
      await TestLib.initialize()

      accounts = await web3.eth.getAccounts()

      owner    = accounts[1]
      ops      = accounts[2]
      wallet   = accounts[3]
      account1 = accounts[4]
      account2 = accounts[5]

      await redeploy()
   })


   context('buyTokens', async () => {

      it('buyTokens as normal', async () => {
         await buyTokens(account1, account1, contributionMin)
      })

      it('buyTokens as ops', async () => {
         await buyTokens(ops, ops, contributionMin)
      })

      it('buyTokens as owner', async () => {
         await buyTokens(owner, owner, contributionMin)
      })

      it('buyTokens for another account', async () => {
         await buyTokens(account1, account2, contributionMin)
      })

      // Note: This fails because web3 doesn't want to getBalance on address 0
      //it('buyTokens for 0', async () => {
      //   await buyTokens(account1, 0, contributionMin)
      //})

      it('buyTokens for this', async () => {
         await TestLib.assertCallFails(buyTokens(account1, sale._address, contributionMin))
      })

      it('buyTokens for wallet', async () => {
         await buyTokens(account1, wallet, contributionMin)
      })

      it('buyTokens for owner', async () => {
         await buyTokens(account1, owner, contributionMin)
      })

      it('buyTokens for ops', async () => {
         await buyTokens(account1, ops, contributionMin)
      })

      it('buyTokens for token contract', async () => {
         await TestLib.assertCallFails(buyTokens(account1, token._address, contributionMin))
      })

      it('buyTokens with 0 ETH', async () => {
         await TestLib.assertCallFails(buyTokens(account1, account1, new BigNumber(0)))
      })

      it('buyTokens with 1 wei', async () => {
         await TestLib.assertCallFails(buyTokens(account1, account1, new BigNumber(1)))
      })

      it('buyTokens with minimum contribution - 1 wei', async () => {
         await TestLib.assertCallFails(buyTokens(account1, account1, contributionMin.sub(1)))
      })

      it('buyTokens with minimum contribution', async () => {
         await buyTokens(account1, account1, contributionMin)
      })

      it('buyTokens with more ETH than maxTokensPerAccount allows', async () => {
         const balance = new BigNumber(await token.methods.balanceOf(account1).call())
         await sale.methods.setMaxTokensPerAccount(balance.add(1)).send({ from: owner })
         await buyTokens(account1, account1, -1)
         await sale.methods.setMaxTokensPerAccount(0).send({ from: owner })
      })

      it('buyTokens with bonus = 0', async () => {
         await sale.methods.setBonus(0).send({ from: owner })
         await buyTokens(account1, account1, contributionMin)
      })

      it('buyTokens with bonus = 755', async () => {
         await sale.methods.setBonus(755).send({ from: owner })
         await buyTokens(account1, account1, contributionMin)
      })

      it('buyTokens with bonus = 10000', async () => {
         await sale.methods.setBonus(10000).send({ from: owner })
         await buyTokens(account1, account1, contributionMin)
      })

      it('buyTokens with more ETH than left for sale', async () => {
         assert.equal(await sale.methods.maxTokensPerAccount().call(), 0)
         await buyTokens(account1, account1, -1)
      })

      it('buyTokens with less tokens left than maxTokensPerAccount', async () => {
         await redeploy()

         const balance = new BigNumber(await token.methods.balanceOf(sale._address).call())

         await sale.methods.setMaxTokensPerAccount(balance.add(1000000)).send({ from: owner })

         await buyTokens(account1, account1, -1)
      })

      it('buyTokens with enough ETH to buy all tokens in a single transaction, and more...', async () => {
         await redeploy()

         await buyTokens(account1, account1, -1)
      })

      it('buyTokens with an additional minimum contribution', async () => {
         await TestLib.assertCallFails(buyTokens(account1, account1, contributionMin))
      })

      it('buyTokens before start time', async () => {
         await redeploy()

         await sale.methods.changeTime(START_TIME - 1000).send({ from: owner })

         await TestLib.assertCallFails(buyTokens(account1, account1, contributionMin))
      })

      it('buyTokens during sale time', async () => {
         await sale.methods.changeTime(START_TIME + 1).send({ from: owner })

         await buyTokens(account1, account1, contributionMin)
      })

      it('buyTokens after end time', async () => {
         await sale.methods.changeTime(END_TIME + 1).send({ from: owner })

         await TestLib.assertCallFails(buyTokens(account1, account1, contributionMin))
      })

      it('buyTokens after finalized', async () => {
         await sale.methods.changeTime(START_TIME + 1).send({ from: owner })
         await sale.methods.finalize().send({ from: owner })

         await TestLib.assertCallFails(buyTokens(account1, account1, contributionMin))
      })
   })
})
