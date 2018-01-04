// ----------------------------------------------------------------------------
// ERC20Token Contract Tests
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
//    - name
//    - symbol
//    - decimals
//    - totalSupply
//    - balances should be private
//    - allowed should be private
//    - there is no owner property
//    - constructor fires Transfer event
// balanceOf
//    - balanceOf(0)
//    - balanceOf(this)
//    - balanceOf(tokenHolder)
// transfer
//    - transfer 0 tokens
//    - transfer 1 to address 0
//    - transfer 1 to this
//    - transfer > balance to other account
//    - transfer balance to other account
//    - transfer 1 to other account, while balance = 0
//    - transfer all tokens back to token holder
// transferFrom
//    - transferFrom 0 address 0 to other account
//    - transferFrom 1 address 0 to other account
//    - transferFrom 0 tokenHolder to address 0
//    - transferFrom 1 tokenHolder to address 0
//    - transferFrom 0 tokenHolder to address this
//    - transferFrom 1 tokenHolder to address this
//    - transferFrom 0 tokenHolder to other account
//    - transferFrom 1 tokenHolder to other account, no allowance
//    - transferFrom 1 tokenHolder to other account
//    - transferFrom 1 other account to this
//    - transferFrom 1 this to other account [ * This case is not possible ]
//    - transferFrom 1 while allowance is 0
//    - transferFrom 10 while allowance is 1
//    - transferFrom 10 while allowance is 10
//    - transferFrom 10 again
//    - transferFrom 5 while allowance is 10
//    - transferFrom 1 after allowance changed from 5 -> 0
//    - transferFrom 10 + 10 + 1 while allowance is 20
// approve
//    - approve(0, 0)
//    - approve(0, 1)
//    - approve(this, 1)
//    - approve(other account, 0)
//    - approve(other account, 1)
//    - approve(other account, > balance)
//    - approve amount without approving 0 first
//    - approve 0 after amount has been approved
// allowance
//    - allowance(0, 0)
//    - allowance(this, this)
//    - allowance(this, other account)
//    - allowance(other account, yet another account)
// Events
//    Transfer
//    Approval
//       * Covered when appropriate in the different function tests.
//
describe('ERC20Token Contract', () => {

   var token = null
   var accounts = null

   const TOKEN_NAME        = "A"
   const TOKEN_SYMBOL      = "B"
   const TOKEN_DECIMALS    = 18
   const DECIMALS_FACTOR   = new BigNumber(10).pow(TOKEN_DECIMALS)
   const TOKEN_TOTALSUPPLY = new BigNumber("1000000").mul(DECIMALS_FACTOR)

   var deploymentResult = null

   // Accounts used for testing
   var tokenHolder  = null
   var otherAccount = null
   var otherAccount2 = null


   before(async () => {
      await TestLib.initialize()

      accounts = await web3.eth.getAccounts()

      tokenHolder  = accounts[1]
      otherAccount = accounts[2]
      otherAccount2 = accounts[3]

      deploymentResult = await TestLib.deploy('ERC20Token', [ TOKEN_NAME, TOKEN_SYMBOL, TOKEN_DECIMALS, TOKEN_TOTALSUPPLY, tokenHolder ])

      token = deploymentResult.instance
   })


   context('Construction and basic properties', async () => {

      it('name', async () => {
         assert.equal(await token.methods.name().call(), TOKEN_NAME)
      })

      it('symbol', async () => {
         assert.equal(await token.methods.symbol().call(), TOKEN_SYMBOL)
      })

      it('decimals', async () => {
         assert.equal(await token.methods.decimals().call(), TOKEN_DECIMALS)
      })

      it('totalSupply', async () => {
         assert.equal(new BigNumber(await token.methods.totalSupply().call()), TOKEN_TOTALSUPPLY)
      })

      it('balances should be private', async () => {
         assert.equal(typeof token.methods.balances, 'undefined')
      })

      it('allowed should be private', async () => {
         assert.equal(typeof token.methods.allowed, 'undefined')
      })

      it('there is no owner property', async () => {
         assert.equal(typeof token.methods.owner, 'undefined')
      })

      it('Constructor fires Transfer event', async () => {
         const receipt = deploymentResult.receipt

         await Utils.checkTransfer(receipt, 0, tokenHolder, TOKEN_TOTALSUPPLY)
      })
   })


   context('balanceOf function', async () => {

      it('balanceOf(0)', async () => {
         assert.equal(await token.methods.balanceOf(0).call(), 0)
      })

      it('balanceOf(this)', async () => {
         assert.equal(await token.methods.balanceOf(token._address).call(), 0)
      })

      it('balanceOf(tokenHolder)', async () => {
         assert.equal(new BigNumber(await token.methods.balanceOf(tokenHolder).call()), TOKEN_TOTALSUPPLY)
      })
   })


   context('transfer function', async () => {

      it('transfer 0 tokens', async () => {
         assert.equal(await token.methods.transfer(otherAccount, 0).call({ from: tokenHolder }), true)
         await Utils.checkTransfer(await token.methods.transfer(otherAccount, 0).send({ from: tokenHolder }), tokenHolder, otherAccount, 0)
      })

      it('transfer 1 to address 0', async () => {
         assert.equal(await token.methods.transfer(0, 1).call({ from: tokenHolder }), true)
         await Utils.checkTransfer(await token.methods.transfer(0, 1).send({ from: tokenHolder }), tokenHolder, 0, 1)
      })

      it('transfer 1 to this', async () => {
         assert.equal(await token.methods.transfer(token._address, 1).call({ from: tokenHolder }), true)
         await Utils.checkTransfer(await token.methods.transfer(token._address, 1).send({ from: tokenHolder }), tokenHolder, token._address, 1)
      })

      it('transfer > balance to other account', async () => {
         const balance = new BigNumber(await token.methods.balanceOf(tokenHolder).call())
         assert.equal(balance.gt(0), true, "Expected tokenHolder balance to be > 0.")

         await TestLib.assertCallFails(token.methods.transfer(otherAccount, balance.add(1)).call({ from: tokenHolder }))
      })

      it('transfer balance to other account', async () => {
         const balance = new BigNumber(await token.methods.balanceOf(tokenHolder).call())

         assert.equal(await token.methods.transfer(otherAccount, balance).call({ from: tokenHolder }), true)
         Utils.checkTransfer(await token.methods.transfer(otherAccount, balance).send({ from: tokenHolder }), tokenHolder, otherAccount, balance)

         assert.equal(await token.methods.balanceOf(tokenHolder).call(), 0)
         assert.equal(new BigNumber(await token.methods.balanceOf(otherAccount).call()), balance)
      })

      it('transfer 1 to other account, while balance = 0', async () => {
         const balance = new BigNumber(await token.methods.balanceOf(tokenHolder).call())
         assert.equal(balance, 0)

         await TestLib.assertCallFails(token.methods.transfer(otherAccount, 1).call({ from: tokenHolder }))
      })

      it('transfer all tokens back to token holder', async () => {
         const balance = new BigNumber(await token.methods.balanceOf(otherAccount).call())

         assert.equal(await token.methods.transfer(tokenHolder, balance).call({ from: otherAccount }), true)
         Utils.checkTransfer(await token.methods.transfer(tokenHolder, balance).send({ from: otherAccount }), otherAccount, tokenHolder, balance)

         assert.equal(await token.methods.balanceOf(otherAccount).call(), 0)
         assert.equal(new BigNumber(await token.methods.balanceOf(tokenHolder).call()), balance)
      })
   })


   context('transferFrom function', async () => {

      it('transferFrom 0 address 0 to other account', async () => {
         assert.equal(await token.methods.transferFrom(0, otherAccount, 0).call({ from: tokenHolder }), true)
         await Utils.checkTransfer(await token.methods.transferFrom(0, otherAccount, 0).send({ from: tokenHolder }), 0, otherAccount, 0)
      })

      it('transferFrom 1 address 0 to other account', async () => {
         await TestLib.assertCallFails(token.methods.transferFrom(0, otherAccount, 1).call({ from: tokenHolder }))
      })

      it('transferFrom 0 tokenHolder to address 0', async () => {
         assert.equal(await token.methods.transferFrom(tokenHolder, 0, 0).call({ from: tokenHolder }), true)
         await Utils.checkTransfer(await token.methods.transferFrom(tokenHolder, 0, 0).send({ from: tokenHolder }), tokenHolder, 0, 0)
      })

      it('transferFrom 1 tokenHolder to address 0', async () => {
         await token.methods.approve(tokenHolder, 1).send({ from: tokenHolder })

         assert.equal(await token.methods.transferFrom(tokenHolder, 0, 1).call({ from: tokenHolder }), true)
         await Utils.checkTransfer(await token.methods.transferFrom(tokenHolder, 0, 1).send({ from: tokenHolder }), tokenHolder, 0, 1)
      })

      it('transferFrom 0 tokenHolder to this', async () => {
         assert.equal(await token.methods.transferFrom(tokenHolder, token._address, 0).call({ from: tokenHolder }), true)
         await Utils.checkTransfer(await token.methods.transferFrom(tokenHolder, token._address, 0).send({ from: tokenHolder }), tokenHolder, token._address, 0)
      })

      it('transferFrom 1 tokenHolder to this', async () => {
         await token.methods.approve(tokenHolder, 1).send({ from: tokenHolder })

         assert.equal(await token.methods.transferFrom(tokenHolder, token._address, 1).call({ from: tokenHolder }), true)
         await Utils.checkTransfer(await token.methods.transferFrom(tokenHolder, token._address, 1).send({ from: tokenHolder }), tokenHolder, token._address, 1)
      })

      it('transferFrom 0 tokenHolder to other account', async () => {
         assert.equal(await token.methods.transferFrom(tokenHolder, otherAccount, 0).call({ from: tokenHolder }), true)
         await Utils.checkTransfer(await token.methods.transferFrom(tokenHolder, otherAccount, 0).send({ from: tokenHolder }), tokenHolder, otherAccount, 0)
      })

      it('transferFrom 1 tokenHolder to other account, no allowance', async () => {
         await TestLib.assertCallFails(token.methods.transferFrom(tokenHolder, otherAccount, 1).call({ from: tokenHolder }))
      })

      it('transferFrom 1 tokenHolder to other account', async () => {
         await token.methods.approve(tokenHolder, 1).send({ from: tokenHolder })

         assert.equal(await token.methods.transferFrom(tokenHolder, otherAccount, 1).call({ from: tokenHolder }), true)
         await Utils.checkTransfer(await token.methods.transferFrom(tokenHolder, otherAccount, 1).send({ from: tokenHolder }), tokenHolder, otherAccount, 1)
      })

      it('transferFrom 1 other account to this', async () => {
         assert.isTrue((await token.methods.balanceOf(otherAccount).call()) > 0)

         await token.methods.approve(otherAccount, 1).send({ from: otherAccount })

         assert.equal(await token.methods.transferFrom(otherAccount, token._address, 1).call({ from: otherAccount }), true)
         await Utils.checkTransfer(await token.methods.transferFrom(otherAccount, token._address, 1).send({ from: otherAccount }), otherAccount, token._address, 1)
      })

      it('transferFrom 1 while allowance is 0', async () => {
         // Make sure otherAccount is funded for upcoming tests
         await token.methods.transfer(otherAccount, 55).send({ from: tokenHolder })

         assert.equal((await token.methods.balanceOf(otherAccount).call()), 55)

         await token.methods.approve(otherAccount, 0).send({ from: tokenHolder })

         await TestLib.assertCallFails(token.methods.transferFrom(otherAccount, token._address, 1).call({ from: otherAccount }))
      })

      it('transferFrom 10 while allowance is 1', async () => {
         assert.equal((await token.methods.balanceOf(otherAccount).call()), 55)

         await token.methods.approve(otherAccount, 1).send({ from: tokenHolder })

         await TestLib.assertCallFails(token.methods.transferFrom(otherAccount, token._address, 10).call({ from: otherAccount }))
      })

      it('transferFrom 10 while allowance is 10', async () => {
         assert.equal((await token.methods.balanceOf(otherAccount).call()), 55)

         await token.methods.approve(otherAccount, 10).send({ from: otherAccount })

         assert.equal(await token.methods.transferFrom(otherAccount, token._address, 10).call({ from: otherAccount }), true)
         await Utils.checkTransfer(await token.methods.transferFrom(otherAccount, token._address, 10).send({ from: otherAccount }), otherAccount, token._address, 10)

         assert.equal((await token.methods.balanceOf(otherAccount).call()), 45)
      })

      it('transferFrom 10 again', async () => {
         assert.equal((await token.methods.balanceOf(otherAccount).call()), 45)

         await TestLib.assertCallFails(token.methods.transferFrom(otherAccount, token._address, 10).call({ from: otherAccount }))
      })

      it('transferFrom 5 while allowance is 10', async () => {
         assert.equal((await token.methods.balanceOf(otherAccount).call()), 45)

         await token.methods.approve(otherAccount, 10).send({ from: otherAccount })

         assert.equal(await token.methods.transferFrom(otherAccount, token._address, 5).call({ from: otherAccount }), true)
         await Utils.checkTransfer(await token.methods.transferFrom(otherAccount, token._address, 5).send({ from: otherAccount }), otherAccount, token._address, 5)

         assert.equal((await token.methods.balanceOf(otherAccount).call()), 40)
      })

      it('transferFrom 1 after allowance changed from 5 -> 0', async () => {
         assert.equal(await token.methods.allowance(otherAccount, otherAccount).call(), 5)

         await token.methods.approve(otherAccount, 0).send({ from: otherAccount })

         await TestLib.assertCallFails(token.methods.transferFrom(otherAccount, token._address, 5).call({ from: otherAccount }))
      })

      it('transferFrom 10 + 10 + 1 while allowance is 20', async () => {
         const balanceBefore = new BigNumber(await token.methods.balanceOf(otherAccount).call())

         assert.isTrue(balanceBefore.gt(20))

         await token.methods.approve(otherAccount, 20).send({ from: otherAccount })

         assert.equal(await token.methods.transferFrom(otherAccount, token._address, 10).call({ from: otherAccount }), true)
         await Utils.checkTransfer(await token.methods.transferFrom(otherAccount, token._address, 10).send({ from: otherAccount }), otherAccount, token._address, 10)

         assert.equal(await token.methods.transferFrom(otherAccount, token._address, 10).call({ from: otherAccount }), true)
         await Utils.checkTransfer(await token.methods.transferFrom(otherAccount, token._address, 10).send({ from: otherAccount }), otherAccount, token._address, 10)

         await TestLib.assertCallFails(token.methods.transferFrom(otherAccount, token._address, 1).call({ from: otherAccount }))

         const balanceAfter = new BigNumber(await token.methods.balanceOf(otherAccount).call())

         assert.equal(balanceBefore.sub(balanceAfter).toString(), "20")
      })


      context('approve function', async () => {

         it('approve(0, 0)', async () => {
            Utils.checkApprove(await token.methods.approve(0, 0).send({ from: tokenHolder }), tokenHolder, 0, 0)
         })

         it('approve(0, 1)', async () => {
            Utils.checkApprove(await token.methods.approve(0, 1).send({ from: tokenHolder }), tokenHolder, 0, 1)
         })

         it('approve(this, 1)', async () => {
            Utils.checkApprove(await token.methods.approve(token._address, 1).send({ from: tokenHolder }), tokenHolder, token._address, 1)
         })

         it('approve(other account, 0)', async () => {
            Utils.checkApprove(await token.methods.approve(otherAccount, 0).send({ from: tokenHolder }), tokenHolder, otherAccount, 0)
         })

         it('approve(other account, 1)', async () => {
            Utils.checkApprove(await token.methods.approve(otherAccount, 1).send({ from: tokenHolder }), tokenHolder, otherAccount, 1)
         })

         it('approve(other account, > balance)', async () => {
            const balance = new BigNumber(await token.methods.balanceOf(tokenHolder).call())

            Utils.checkApprove(await token.methods.approve(otherAccount, 0).send({ from: tokenHolder }), tokenHolder, otherAccount, 0)
            Utils.checkApprove(await token.methods.approve(otherAccount, balance.add(1)).send({ from: tokenHolder }), tokenHolder, otherAccount, balance.add(1))
            Utils.checkApprove(await token.methods.approve(otherAccount, 0).send({ from: tokenHolder }), tokenHolder, otherAccount, 0)
         })

         it('approve amount without approving 0 first', async () => {
            assert.equal(await token.methods.allowance(tokenHolder, otherAccount).call(), 0)

            Utils.checkApprove(await token.methods.approve(otherAccount, 10).send({ from: tokenHolder }), tokenHolder, otherAccount, 10)
            Utils.checkApprove(await token.methods.approve(otherAccount, 20).send({ from: tokenHolder }), tokenHolder, otherAccount, 20)

            assert.equal(await token.methods.allowance(tokenHolder, otherAccount).call(), 20)
         })
      })


      context('allowance function', async () => {

         it('allowance(0,0)', async () => {
            assert.equal(await token.methods.allowance(0, 0).call(), 0)
         })

         it('allowance(this,this)', async () => {
            assert.equal(await token.methods.allowance(token._address, token._address).call(), 0)
         })

         it('allowance(this,other account)', async () => {
            assert.equal(await token.methods.allowance(token._address, otherAccount).call(), 0)
         })

         it('allowance(other account, yet another account)', async () => {
            await token.methods.approve(otherAccount2, 123).send({ from: otherAccount})

            assert.equal(await token.methods.allowance(otherAccount, otherAccount2).call(), 123)
         })
      })
   })
})
