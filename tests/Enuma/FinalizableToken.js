// ----------------------------------------------------------------------------
// FinalizableToken Contract Tests
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
//    - owner
//    - ops
//    - balances should be private
//    - allowed should be private
//    - constructor fires Transfer event
// balanceOf
//    - balanceOf(0)
//    - balanceOf(this)
//    - balanceOf(owner)
//    - balanceOf(ops)
//    - balanceOf(account1)
// transfer [ before/after finalize ] [ sender = owner, ops, normal ]
//    - transfer 0 tokens
//    - transfer 1 to address 0
//    - transfer 1 to this
//    - transfer > balance to other account
//    - transfer balance to other account
//    - transfer 1 to other account, while balance = 0
//    - transfer all tokens back
// transferFrom [ before/after finalize ] [ sender = owner, ops, normal ]
//    - transferFrom 0 address 0 to other account
//    - transferFrom 1 address 0 to other account
//    - transferFrom 0 owner to address 0
//    - transferFrom 1 owner to address 0
//    - transferFrom 0 owner to address this
//    - transferFrom 1 owner to address this
//    - transferFrom 0 owner to other account
//    - transferFrom 1 owner to other account, no allowance
//    - transferFrom 1 owner to other account
//    - transferFrom 1 ops to other account
//    - transferFrom 1 other account to this
//    - transferFrom 1 yet another account to another account
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
// finalize
//    - other account cannot call finalize
//    - ops cannot call finalize
//    - owner can call finalize
// Events
//    Transfer
//    Approval
//    Finalized
//       * Covered when appropriate in the different function tests.
//
describe('FinalizableToken Contract', () => {

   var token = null
   var accounts = null

   const TOKEN_NAME        = "A"
   const TOKEN_SYMBOL      = "B"
   const TOKEN_DECIMALS    = 18
   const DECIMALS_FACTOR   = new BigNumber(10).pow(TOKEN_DECIMALS)
   const TOKEN_TOTALSUPPLY = new BigNumber("1000000").mul(DECIMALS_FACTOR)


   var deploymentResult = null

   // Accounts used for testing
   var owner = null
   var ops = null
   var account1 = null
   var account2 = null
   var account3 = null


   before(async () => {
      await TestLib.initialize()

      accounts = await web3.eth.getAccounts()

      owner         = accounts[1]
      ops           = accounts[2]
      account1      = accounts[3]
      account2      = accounts[4]
      account3      = accounts[5]

      deploymentResult = await TestLib.deploy('FinalizableToken', [ TOKEN_NAME, TOKEN_SYMBOL, TOKEN_DECIMALS, TOKEN_TOTALSUPPLY ], { from: owner })

      token = deploymentResult.instance

      await token.methods.setOpsAddress(ops).send({ from: owner })
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

      it('owner', async () => {
         assert.equal(await token.methods.owner().call(), owner)
      })

      it('opsAddress', async () => {
         assert.equal(await token.methods.opsAddress().call(), ops)
      })

      it('balances should be private', async () => {
         assert.equal(typeof token.methods.balances, 'undefined')
      })

      it('allowed should be private', async () => {
         assert.equal(typeof token.methods.allowed, 'undefined')
      })

      it('Constructor fires Transfer event', async () => {
         const receipt = deploymentResult.receipt

         await Utils.checkTransfer(receipt, 0, owner, TOKEN_TOTALSUPPLY)
      })
   })


   context('balanceOf function', async () => {

      it('balanceOf(0)', async () => {
         assert.equal(await token.methods.balanceOf(0).call(), 0)
      })

      it('balanceOf(this)', async () => {
         assert.equal(await token.methods.balanceOf(token._address).call(), 0)
      })

      it('balanceOf(owner)', async () => {
         assert.equal(new BigNumber(await token.methods.balanceOf(owner).call()), TOKEN_TOTALSUPPLY)
      })

      it('balanceOf(ops)', async () => {
         assert.equal(await token.methods.balanceOf(ops).call(), 0)
      })

      it('balanceOf(account1)', async () => {
         assert.equal(await token.methods.balanceOf(account1).call(), 0)
      })
   })

   //var elements = [1, 2, 3]
   //elements.forEach(element => {
   //   it('test something ' + element, async () => {
   //      console.log(element)
   //   })
   //})


   context('before finalize', async () => {

      context('transfer function', async () => {

         context('sender = owner', async () => {

            before(async () => {
               assert.equal(await token.methods.finalized().call(), false)
            })


            it('transfer 0 tokens', async () => {
               assert.equal(await token.methods.transfer(account1, 0).call({ from: owner }), true)
               await Utils.checkTransfer(await token.methods.transfer(account1, 0).send({ from: owner }), owner, account1, 0)
            })

            it('transfer 1 to address 0', async () => {
               assert.equal(await token.methods.transfer(0, 1).call({ from: owner }), true)
               await Utils.checkTransfer(await token.methods.transfer(0, 1).send({ from: owner }), owner, 0, 1)
            })

            it('transfer 1 to this', async () => {
               assert.equal(await token.methods.transfer(token._address, 1).call({ from: owner }), true)
               await Utils.checkTransfer(await token.methods.transfer(token._address, 1).send({ from: owner }), owner, token._address, 1)
            })

            it('transfer > balance to other account', async () => {
               const balance = new BigNumber(await token.methods.balanceOf(owner).call())
               assert.equal(balance.gt(0), true, "Expected owner balance to be > 0.")

               await TestLib.assertCallFails(token.methods.transfer(account1, balance.add(1)).call({ from: owner }))
            })

            it('transfer balance to other account', async () => {
               const balance = new BigNumber(await token.methods.balanceOf(owner).call())

               assert.equal(await token.methods.transfer(account1, balance).call({ from: owner }), true)
               Utils.checkTransfer(await token.methods.transfer(account1, balance).send({ from: owner }), owner, account1, balance)

               assert.equal(await token.methods.balanceOf(owner).call(), 0)
               assert.equal(new BigNumber(await token.methods.balanceOf(account1).call()), balance)
            })

            it('transfer 1 to other account, while balance = 0', async () => {
               const balance = new BigNumber(await token.methods.balanceOf(owner).call())
               assert.equal(balance, 0)

               await TestLib.assertCallFails(token.methods.transfer(account1, 1).call({ from: owner }))
            })

            it('transfer all tokens back to token holder', async () => {
               const balance = new BigNumber(await token.methods.balanceOf(account1).call())
               await token.methods.transfer(owner, balance).call({ from: account1 })
            })
         })


         context('sender = ops', async () => {

            before(async () => {
               deploymentResult = await TestLib.deploy('FinalizableToken', [ TOKEN_NAME, TOKEN_SYMBOL, TOKEN_DECIMALS, TOKEN_TOTALSUPPLY ], { from: owner })

               token = deploymentResult.instance

               assert.equal(await token.methods.finalized().call(), false)

               await token.methods.setOpsAddress(ops).send({ from: owner })
               await token.methods.transfer(ops, 1000).send({ from: owner })
            })


            it('transfer 0 tokens', async () => {
               assert.equal(await token.methods.transfer(account1, 0).call({ from: ops }), true)
               await Utils.checkTransfer(await token.methods.transfer(account1, 0).send({ from: ops }), ops, account1, 0)
            })

            it('transfer 1 to address 0', async () => {
               assert.equal(await token.methods.transfer(0, 1).call({ from: ops }), true)
               await Utils.checkTransfer(await token.methods.transfer(0, 1).send({ from: ops }), ops, 0, 1)
            })

            it('transfer 1 to this', async () => {
               assert.equal(await token.methods.transfer(token._address, 1).call({ from: ops }), true)
               await Utils.checkTransfer(await token.methods.transfer(token._address, 1).send({ from: ops }), ops, token._address, 1)
            })

            it('transfer > balance to other account', async () => {
               const balance = new BigNumber(await token.methods.balanceOf(ops).call())
               assert.equal(balance.gt(0), true, "Expected owner balance to be > 0.")

               await TestLib.assertCallFails(token.methods.transfer(account1, balance.add(1)).call({ from: ops }))
            })

            it('transfer balance to other account', async () => {
               const balance = new BigNumber(await token.methods.balanceOf(ops).call())

               assert.equal(await token.methods.transfer(account1, balance).call({ from: ops }), true)
               Utils.checkTransfer(await token.methods.transfer(account1, balance).send({ from: ops }), ops, account1, balance)

               assert.equal(await token.methods.balanceOf(ops).call(), 0)
               assert.equal(await token.methods.balanceOf(account1).call(), balance)
            })

            it('transfer 1 to other account, while balance = 0', async () => {
               const balance = new BigNumber(await token.methods.balanceOf(ops).call())
               assert.equal(balance, 0)

               await TestLib.assertCallFails(token.methods.transfer(account1, 1).call({ from: ops }))
            })

            it('transfer all tokens back', async () => {
               const balance = new BigNumber(await token.methods.balanceOf(account1).call())

               await TestLib.assertCallFails(token.methods.transfer(ops, balance).call({ from: account1 }))
            })
         })


         context('sender = normal', async () => {

            before(async () => {
               assert.equal(await token.methods.finalized().call(), false)

               await token.methods.transfer(account1, 1000).send({ from: owner })
            })


            it('transfer 0 tokens', async () => {
               await TestLib.assertCallFails(token.methods.transfer(account2, 0).call({ from: account1 }))
            })

            it('transfer 1 to address 0', async () => {
               await TestLib.assertCallFails(token.methods.transfer(0, 1).call({ from: account1 }))
            })

            it('transfer 1 to this', async () => {
               await TestLib.assertCallFails(token.methods.transfer(token._address, 1).call({ from: account1 }))
            })

            it('transfer > balance to other account', async () => {
               const balance = new BigNumber(await token.methods.balanceOf(account1).call())
               assert.equal(balance.gt(0), true, "Expected owner balance to be > 0.")

               await TestLib.assertCallFails(token.methods.transfer(account1, balance.add(1)).call({ from: account1 }))
            })

            it('transfer balance to other account', async () => {
               const balance = new BigNumber(await token.methods.balanceOf(account1).call())

               await TestLib.assertCallFails(token.methods.transfer(account1, balance).call({ from: account1 }))
            })

            it('transfer 1 to other account, while balance = 0', async () => {
               const balance = new BigNumber(await token.methods.balanceOf(account1).call())
               assert.equal(balance, 1998)

               await TestLib.assertCallFails(token.methods.transfer(account1, 1).call({ from: account1 }))
            })

            it('transfer all tokens back to account1', async () => {
               const balance = new BigNumber(await token.methods.balanceOf(account1).call())

               await TestLib.assertCallFails(token.methods.transfer(account1, balance).call({ from: account2 }))
            })
         })
      })


      context('transferFrom function', async () => {

         before(async () => {
            await token.methods.transfer(account1, 1000).send({ from: owner })
         })


         context('sender = owner', async () => {

            it('transferFrom 0 address 0 to other account', async () => {
               assert.equal(await token.methods.transferFrom(0, account1, 0).call({ from: owner }), true)
               await Utils.checkTransfer(await token.methods.transferFrom(0, account1, 0).send({ from: owner }), 0, account1, 0)
            })

            it('transferFrom 1 address 0 to other account', async () => {
               await TestLib.assertCallFails(token.methods.transferFrom(0, account1, 1).call({ from: owner }))
            })

            it('transferFrom 0 owner to address 0', async () => {
               assert.equal(await token.methods.transferFrom(owner, 0, 0).call({ from: owner }), true)
               await Utils.checkTransfer(await token.methods.transferFrom(owner, 0, 0).send({ from: owner }), owner, 0, 0)
            })

            it('transferFrom 1 owner to address 0', async () => {
               await token.methods.approve(owner, 1).send({ from: owner })

               assert.equal(await token.methods.transferFrom(owner, 0, 1).call({ from: owner }), true)
               await Utils.checkTransfer(await token.methods.transferFrom(owner, 0, 1).send({ from: owner }), owner, 0, 1)
            })

            it('transferFrom 0 owner to this', async () => {
               assert.equal(await token.methods.transferFrom(owner, token._address, 0).call({ from: owner }), true)
               await Utils.checkTransfer(await token.methods.transferFrom(owner, token._address, 0).send({ from: owner }), owner, token._address, 0)
            })

            it('transferFrom 1 owner to this', async () => {
               await token.methods.approve(owner, 1).send({ from: owner })

               assert.equal(await token.methods.transferFrom(owner, token._address, 1).call({ from: owner }), true)
               await Utils.checkTransfer(await token.methods.transferFrom(owner, token._address, 1).send({ from: owner }), owner, token._address, 1)
            })

            it('transferFrom 0 owner to other account', async () => {
               assert.equal(await token.methods.transferFrom(owner, account1, 0).call({ from: owner }), true)
               await Utils.checkTransfer(await token.methods.transferFrom(owner, account1, 0).send({ from: owner }), owner, account1, 0)
            })

            it('transferFrom 0 ops to other account', async () => {
               assert.equal(await token.methods.transferFrom(ops, account1, 0).call({ from: owner }), true)
               await Utils.checkTransfer(await token.methods.transferFrom(ops, account1, 0).send({ from: owner }), ops, account1, 0)
            })

            it('transferFrom 1 ops to other account', async () => {
               await token.methods.transfer(ops, 1).send({ from: owner })
               await token.methods.approve(owner, 1).send({ from: ops })

               assert.equal(await token.methods.transferFrom(ops, account1, 1).call({ from: owner }), true)
               await Utils.checkTransfer(await token.methods.transferFrom(ops, account1, 1).send({ from: owner }), ops, account1, 1)
            })

            it('transferFrom 1 owner to other account, no allowance ', async () => {
               await TestLib.assertCallFails(token.methods.transferFrom(owner, account1, 1).call({ from: owner }))
            })

            it('transferFrom 1 owner to other account', async () => {
               await token.methods.approve(owner, 1).send({ from: owner })

               assert.equal(await token.methods.transferFrom(owner, account1, 1).call({ from: owner }), true)
               await Utils.checkTransfer(await token.methods.transferFrom(owner, account1, 1).send({ from: owner }), owner, account1, 1)
            })

            it('transferFrom 1 other account to this', async () => {
               assert.isTrue((await token.methods.balanceOf(account1).call()) > 0)

               await token.methods.approve(owner, 1).send({ from: account1 })

               assert.equal(await token.methods.transferFrom(account1, token._address, 1).call({ from: owner }), true)
               await Utils.checkTransfer(await token.methods.transferFrom(account1, token._address, 1).send({ from: owner }), account1, token._address, 1)
            })

            it('transferFrom 1 while allowance is 0', async () => {
               // Make sure account1 is funded for upcoming tests
               const balanceBefore = new BigNumber(await token.methods.balanceOf(account1).call())
               assert.isTrue(balanceBefore.gte(1))

               await token.methods.approve(owner, 0).send({ from: account1 })

               await TestLib.assertCallFails(token.methods.transferFrom(account1, account3, 1).call({ from: owner }))
            })

            it('transferFrom 10 while allowance is 1', async () => {
               const balanceBefore = new BigNumber(await token.methods.balanceOf(account1).call())
               assert.isTrue(balanceBefore.gte(10))

               await token.methods.approve(owner, 1).send({ from: account1 })

               await TestLib.assertCallFails(token.methods.transferFrom(account1, account3, 10).call({ from: owner }))
            })

            it('transferFrom 10 while allowance is 10', async () => {
               const balanceBefore = new BigNumber(await token.methods.balanceOf(account1).call())
               assert.isTrue(balanceBefore.gte(10))

               await token.methods.approve(owner, 10).send({ from: account1 })

               assert.equal(await token.methods.transferFrom(account1, account3, 10).call({ from: owner }), true)
               Utils.checkTransfer(await token.methods.transferFrom(account1, account3, 10).send({ from: owner }), account1, account3, 10)

               const balanceAfter = new BigNumber(await token.methods.balanceOf(account1).call())
               assert.equal(balanceBefore.sub(balanceAfter).toString(), "10")
            })

            it('transferFrom 10 again', async () => {
               const balanceBefore = new BigNumber(await token.methods.balanceOf(account1).call())
               assert.isTrue(balanceBefore.gte(10))

               await TestLib.assertCallFails(token.methods.transferFrom(account1, account3, 10).call({ from: owner }))
            })

            it('transferFrom 5 while allowance is 10', async () => {
               const balanceBefore = new BigNumber(await token.methods.balanceOf(account1).call())
               assert.isTrue(balanceBefore.gte(5))

               await token.methods.approve(owner, 10).send({ from: account1 })

               assert.equal(await token.methods.transferFrom(account1, account3, 5).call({ from: owner }), true)
               Utils.checkTransfer(await token.methods.transferFrom(account1, account3, 5).send({ from: owner }), account1, account3, 5)

               const balanceAfter = new BigNumber(await token.methods.balanceOf(account1).call())
               assert.equal(balanceBefore.sub(balanceAfter).toString(), "5")
            })

            it('transferFrom 1 after allowance changed from 5 -> 0', async () => {
               const balanceBefore = new BigNumber(await token.methods.balanceOf(account1).call())
               assert.isTrue(balanceBefore.gte(1))
               assert.equal(await token.methods.allowance(account1, owner).call(), 5)

               await token.methods.approve(owner, 0).send({ from: account1 })

               await TestLib.assertCallFails(token.methods.transferFrom(account1, account3, 5).call({ from: owner }))
            })

            it('transferFrom 10 + 10 + 1 while allowance is 20', async () => {
               const balance1Before = new BigNumber(await token.methods.balanceOf(account1).call())
               const balance3Before = new BigNumber(await token.methods.balanceOf(account3).call())
               assert.isTrue(balance1Before.gt(20))

               await token.methods.approve(owner, 20).send({ from: account1 })

               assert.equal(await token.methods.transferFrom(account1, account3, 10).call({ from: owner }), true)
               Utils.checkTransfer(await token.methods.transferFrom(account1, account3, 10).send({ from: owner }), account1, account3, 10)

               assert.equal(await token.methods.transferFrom(account1, account3, 10).call({ from: owner }), true)
               Utils.checkTransfer(await token.methods.transferFrom(account1, account3, 10).send({ from: owner }), account1, account3, 10)

               await TestLib.assertCallFails(token.methods.transferFrom(account1, account3, 1).call({ from: owner }))

               const balance1After = new BigNumber(await token.methods.balanceOf(account1).call())
               const balance3After = new BigNumber(await token.methods.balanceOf(account3).call())
               assert.equal(balance1After.sub(balance1Before).toString(), "-20")
               assert.equal(balance3After.sub(balance3Before).toString(), "20")
            })
         })


         context('sender = ops', async () => {

            before(async () => {
               await token.methods.transfer(ops, 1000).send({ from: owner })
            })


            it('transferFrom 0 address 0 to other account', async () => {
               assert.equal(await token.methods.transferFrom(0, account1, 0).call({ from: ops }), true)
               Utils.checkTransfer(await token.methods.transferFrom(0, account1, 0).send({ from: ops }), 0, account1, 0)
            })

            it('transferFrom 1 address 0 to other account', async () => {
               await TestLib.assertCallFails(token.methods.transferFrom(0, account1, 1).call({ from: ops }))
            })

            it('transferFrom 0 owner to address 0', async () => {
               assert.equal(await token.methods.transferFrom(owner, 0, 0).call({ from: ops }), true)
               Utils.checkTransfer(await token.methods.transferFrom(owner, 0, 0).send({ from: ops }), owner, 0, 0)
            })

            it('transferFrom 1 owner to address 0', async () => {
               await token.methods.approve(ops, 1).send({ from: owner })

               assert.equal(await token.methods.transferFrom(owner, 0, 1).call({ from: ops }), true)
               Utils.checkTransfer(await token.methods.transferFrom(owner, 0, 1).send({ from: ops }), owner, 0, 1)
            })

            it('transferFrom 0 owner to this', async () => {
               assert.equal(await token.methods.transferFrom(owner, token._address, 0).call({ from: ops }), true)
               Utils.checkTransfer(await token.methods.transferFrom(owner, token._address, 0).send({ from: ops }), owner, token._address, 0)
            })

            it('transferFrom 1 owner to this', async () => {
               await token.methods.approve(ops, 1).send({ from: owner })

               assert.equal(await token.methods.transferFrom(owner, token._address, 1).call({ from: ops }), true)
               Utils.checkTransfer(await token.methods.transferFrom(owner, token._address, 1).send({ from: ops }), owner, token._address, 1)
            })

            it('transferFrom 0 owner to other account', async () => {
               assert.equal(await token.methods.transferFrom(owner, account1, 0).call({ from: ops }), true)
               Utils.checkTransfer(await token.methods.transferFrom(owner, account1, 0).send({ from: ops }), owner, account1, 0)
            })

            it('transferFrom 1 owner to other account, no allowance ', async () => {
               await TestLib.assertCallFails(token.methods.transferFrom(owner, account1, 1).call({ from: ops }))
            })

            it('transferFrom 1 owner to other account', async () => {
               await token.methods.approve(ops, 1).send({ from: owner })

               assert.equal(await token.methods.transferFrom(owner, account1, 1).call({ from: ops }), true)
               Utils.checkTransfer(await token.methods.transferFrom(owner, account1, 1).send({ from: ops }), owner, account1, 1)
            })

            it('transferFrom 0 ops to other account', async () => {
               assert.equal(await token.methods.transferFrom(ops, account1, 0).call({ from: ops }), true)
               Utils.checkTransfer(await token.methods.transferFrom(ops, account1, 0).send({ from: ops }), ops, account1, 0)
            })

            it('transferFrom 1 ops to other account', async () => {
               await token.methods.approve(ops, 1).send({ from: ops })

               assert.equal(await token.methods.transferFrom(ops, account1, 1).call({ from: ops }), true)
               Utils.checkTransfer(await token.methods.transferFrom(ops, account1, 1).send({ from: ops }), ops, account1, 1)
            })

            it('transferFrom 1 other account to this', async () => {
               const balanceBefore = new BigNumber(await token.methods.balanceOf(account1).call())
               assert.isTrue(balanceBefore.gte(1))

               await token.methods.approve(ops, 1).send({ from: account1 })

               assert.equal(await token.methods.transferFrom(account1, account3, 1).call({ from: ops }), true)
               Utils.checkTransfer(await token.methods.transferFrom(account1, account3, 1).send({ from: ops }), account1, account3, 1)
            })

            it('transferFrom 1 while allowance is 0', async () => {
               // Make sure account1 is funded for upcoming tests
               const balanceBefore = new BigNumber(await token.methods.balanceOf(account1).call())
               assert.isTrue(balanceBefore.gte(1))

               await token.methods.approve(ops, 0).send({ from: account1 })

               await TestLib.assertCallFails(token.methods.transferFrom(account1, account3, 1).call({ from: ops }))
            })

            it('transferFrom 10 while allowance is 1', async () => {
               const balanceBefore = new BigNumber(await token.methods.balanceOf(account1).call())
               assert.isTrue(balanceBefore.gte(10))

               await token.methods.approve(ops, 1).send({ from: account1 })

               await TestLib.assertCallFails(token.methods.transferFrom(account1, account3, 10).call({ from: ops }))
            })

            it('transferFrom 10 while allowance is 10', async () => {
               const balanceBefore = new BigNumber(await token.methods.balanceOf(account1).call())
               assert.isTrue(balanceBefore.gte(10))

               await token.methods.approve(ops, 10).send({ from: account1 })

               assert.equal(await token.methods.transferFrom(account1, account3, 10).call({ from: ops }), true)
               Utils.checkTransfer(await token.methods.transferFrom(account1, account3, 10).send({ from: ops }), account1, account3, 10)

               const balanceAfter = new BigNumber(await token.methods.balanceOf(account1).call())
               assert.equal(balanceBefore.sub(balanceAfter).toString(), "10")
            })

            it('transferFrom 10 again', async () => {
               const balanceBefore = new BigNumber(await token.methods.balanceOf(account1).call())
               assert.isTrue(balanceBefore.gte(10))

               await TestLib.assertCallFails(token.methods.transferFrom(account1, account3, 10).call({ from: ops }))
            })

            it('transferFrom 5 while allowance is 10', async () => {
               const balanceBefore = new BigNumber(await token.methods.balanceOf(account1).call())
               assert.isTrue(balanceBefore.gte(5))

               await token.methods.approve(ops, 10).send({ from: account1 })

               assert.equal(await token.methods.transferFrom(account1, account3, 5).call({ from: ops }), true)
               Utils.checkTransfer(await token.methods.transferFrom(account1, account3, 5).send({ from: ops }), account1, account3, 5)

               const balanceAfter = new BigNumber(await token.methods.balanceOf(account1).call())
               assert.equal(balanceBefore.sub(balanceAfter).toString(), "5")
            })

            it('transferFrom 1 after allowance changed from 5 -> 0', async () => {
               const balanceBefore = new BigNumber(await token.methods.balanceOf(account1).call())
               assert.isTrue(balanceBefore.gte(1))

               await token.methods.approve(ops, 0).send({ from: account1 })

               await TestLib.assertCallFails(token.methods.transferFrom(account1, account3, 5).call({ from: ops }))
            })

            it('transferFrom 10 + 10 + 1 while allowance is 20', async () => {
               const balance1Before = new BigNumber(await token.methods.balanceOf(account1).call())
               const balance3Before = new BigNumber(await token.methods.balanceOf(account3).call())
               assert.isTrue(balance1Before.gt(20))

               await token.methods.approve(ops, 20).send({ from: account1 })

               assert.equal(await token.methods.transferFrom(account1, account3, 10).call({ from: ops }), true)
               Utils.checkTransfer(await token.methods.transferFrom(account1, account3, 10).send({ from: ops }), account1, account3, 10)

               assert.equal(await token.methods.transferFrom(account1, account3, 10).call({ from: ops }), true)
               Utils.checkTransfer(await token.methods.transferFrom(account1, account3, 10).send({ from: ops }), account1, account3, 10)

               await TestLib.assertCallFails(token.methods.transferFrom(account1, account3, 1).call({ from: ops }))

               const balance1After = new BigNumber(await token.methods.balanceOf(account1).call())
               const balance3After = new BigNumber(await token.methods.balanceOf(account3).call())
               assert.equal(balance1After.sub(balance1Before).toString(), "-20")
               assert.equal(balance3After.sub(balance3Before).toString(), "20")
            })
         })


         context('sender = normal ', async () => {

            before(async () => {
               await token.methods.transfer(account1, 1000).send({ from: owner })
               await token.methods.transfer(account2, 1000).send({ from: owner })
            })


            it('transferFrom 0 address 0 to other account', async () => {
               await TestLib.assertCallFails(token.methods.transferFrom(0, account1, 0).call({ from: account1 }))
            })

            it('transferFrom 1 address 0 to other account', async () => {
               await TestLib.assertCallFails(token.methods.transferFrom(0, account1, 1).call({ from: account1 }))
            })

            it('transferFrom 0 owner to address 0', async () => {
               await TestLib.assertCallFails(token.methods.transferFrom(owner, 0, 0).call({ from: account1 }))
            })

            it('transferFrom 1 owner to address 0', async () => {
               await token.methods.approve(account1, 1).send({ from: owner })

               await TestLib.assertCallFails(token.methods.transferFrom(owner, 0, 1).call({ from: account1 }))
            })

            it('transferFrom 0 owner to this', async () => {
               await TestLib.assertCallFails(token.methods.transferFrom(owner, token._address, 0).call({ from: account1 }))
            })

            it('transferFrom 1 owner to this', async () => {
               await token.methods.approve(account1, 1).send({ from: owner })

               await TestLib.assertCallFails(token.methods.transferFrom(owner, token._address, 1).call({ from: account1 }))
            })

            it('transferFrom 0 owner to other account', async () => {
               await TestLib.assertCallFails(token.methods.transferFrom(owner, account1, 0).call({ from: account1 }))
            })

            it('transferFrom 1 owner to other account, no allowance ', async () => {
               await TestLib.assertCallFails(token.methods.transferFrom(owner, account1, 1).call({ from: account1 }))
            })

            it('transferFrom 1 owner to other account', async () => {
               await token.methods.approve(account1, 1).send({ from: owner })

               await TestLib.assertCallFails(token.methods.transferFrom(owner, account1, 1).call({ from: account1 }))
            })

            it('transferFrom 0 ops to other account', async () => {
               await TestLib.assertCallFails(token.methods.transferFrom(ops, account1, 0).call({ from: account1 }))
            })

            it('transferFrom 1 ops to other account', async () => {
               await token.methods.approve(account1, 1).send({ from: ops })

               await TestLib.assertCallFails(token.methods.transferFrom(ops, account1, 1).call({ from: account1 }))
            })

            it('transferFrom 1 other account to this', async () => {
               const balanceBefore = new BigNumber(await token.methods.balanceOf(account2).call())
               assert.isTrue(balanceBefore.gte(1))

               await token.methods.approve(account1, 1).send({ from: account2 })

               TestLib.assertCallFails(token.methods.transferFrom(account2, token._address, 1).call({ from: account1 }))
            })

            it('transferFrom 1 yet another account to another account', async () => {
               const balanceBefore = new BigNumber(await token.methods.balanceOf(account2).call())
               assert.isTrue(balanceBefore.gte(1))

               await token.methods.approve(account1, 1).send({ from: account2 })

               TestLib.assertCallFails(token.methods.transferFrom(account2, account1, 1).call({ from: account1 }))
            })

            it('transferFrom 1 while allowance is 0', async () => {
               const balanceBefore = new BigNumber(await token.methods.balanceOf(account2).call())
               assert.isTrue(balanceBefore.gte(1))

               await token.methods.approve(account1, 0).send({ from: account2 })

               await TestLib.assertCallFails(token.methods.transferFrom(account2, account3, 1).call({ from: account1 }))
            })

            it('transferFrom 10 while allowance is 1', async () => {
               const balanceBefore = new BigNumber(await token.methods.balanceOf(account2).call())
               assert.isTrue(balanceBefore.gte(10))

               await token.methods.approve(account1, 1).send({ from: account2 })

               await TestLib.assertCallFails(token.methods.transferFrom(account2, account3, 10).call({ from: account1 }))
            })

            it('transferFrom 10 while allowance is 10', async () => {
               const balanceBefore = new BigNumber(await token.methods.balanceOf(account2).call())
               assert.isTrue(balanceBefore.gte(10))

               await token.methods.approve(account1, 10).send({ from: account2 })

               await TestLib.assertCallFails(token.methods.transferFrom(account2, account3, 10).call({ from: account1 }))
            })

            it('transferFrom 10 again', async () => {
               const balanceBefore = new BigNumber(await token.methods.balanceOf(account2).call())
               assert.isTrue(balanceBefore.gte(10))

               await TestLib.assertCallFails(token.methods.transferFrom(account2, account3, 10).call({ from: account1 }))
            })

            it('transferFrom 5 while allowance is 10', async () => {
               const balanceBefore = new BigNumber(await token.methods.balanceOf(account2).call())
               assert.isTrue(balanceBefore.gte(5))

               await token.methods.approve(account1, 10).send({ from: account2 })

               await TestLib.assertCallFails(token.methods.transferFrom(account2, account3, 5).call({ from: account1 }))
            })

            it('transferFrom 1 after allowance changed from 10 -> 0', async () => {
               const balanceBefore = new BigNumber(await token.methods.balanceOf(account2).call())
               assert.isTrue(balanceBefore.gte(1))

               assert.equal(await token.methods.allowance(account2, account1).call(), 10)

               await token.methods.approve(account1, 0).send({ from: account2 })

               await TestLib.assertCallFails(token.methods.transferFrom(account2, account3, 5).call({ from: account1 }))
            })

            it('transferFrom 10 + 10 + 1 while allowance is 20', async () => {
               const balance1Before = new BigNumber(await token.methods.balanceOf(account1).call())
               const balance3Before = new BigNumber(await token.methods.balanceOf(account3).call())
               assert.isTrue(balance1Before.gt(20))

               await token.methods.approve(account1, 20).send({ from: account2 })

               await TestLib.assertCallFails(token.methods.transferFrom(account2, account3, 10).call({ from: account1 }))
            })
         })
      })
   })


   context('after finalize', async () => {

      before(async () => {
         assert.equal(await token.methods.finalized().call(), false)

         await token.methods.finalize().send({ from: owner })
      })


      context('transfer function', async () => {

         context('sender = owner', async () => {

            it('transfer 0 tokens', async () => {
               assert.equal(await token.methods.transfer(account1, 0).call({ from: owner }), true)
               await Utils.checkTransfer(await token.methods.transfer(account1, 0).send({ from: owner }), owner, account1, 0)
            })

            it('transfer 1 to address 0', async () => {
               assert.equal(await token.methods.transfer(0, 1).call({ from: owner }), true)
               await Utils.checkTransfer(await token.methods.transfer(0, 1).send({ from: owner }), owner, 0, 1)
            })

            it('transfer 1 to this', async () => {
               assert.equal(await token.methods.transfer(token._address, 1).call({ from: owner }), true)
               await Utils.checkTransfer(await token.methods.transfer(token._address, 1).send({ from: owner }), owner, token._address, 1)
            })

            it('transfer > balance to other account', async () => {
               const balance = new BigNumber(await token.methods.balanceOf(owner).call())
               assert.equal(balance.gt(0), true, "Expected owner balance to be > 0.")

               await TestLib.assertCallFails(token.methods.transfer(account1, balance.add(1)).call({ from: owner }))
            })

            it('transfer balance to other account', async () => {
               const balanceOwnerBefore = new BigNumber(await token.methods.balanceOf(owner).call())
               const balance1Before = new BigNumber(await token.methods.balanceOf(account1).call())

               assert.equal(await token.methods.transfer(account1, balanceOwnerBefore).call({ from: owner }), true)
               Utils.checkTransfer(await token.methods.transfer(account1, balanceOwnerBefore).send({ from: owner }), owner, account1, balanceOwnerBefore)

               const balanceOwnerAfter = new BigNumber(await token.methods.balanceOf(owner).call())
               const balance1After = new BigNumber(await token.methods.balanceOf(account1).call())

               assert.equal(balanceOwnerAfter.toNumber(), 0)
               assert.equal(balance1After.sub(balance1Before), balanceOwnerBefore)
            })

            it('transfer 1 to other account, while balance = 0', async () => {
               const balance = new BigNumber(await token.methods.balanceOf(owner).call())
               assert.equal(balance, 0)

               await TestLib.assertCallFails(token.methods.transfer(account1, 1).call({ from: owner }))
            })

            it('transfer all tokens back', async () => {
               const balance = new BigNumber(await token.methods.balanceOf(account1).call())

               Utils.checkTransfer(await token.methods.transfer(owner, balance).send({ from: account1 }), account1, owner, balance)
            })
         })


         context('sender = ops', async () => {

            before(async () => {
               deploymentResult = await TestLib.deploy('FinalizableToken', [ TOKEN_NAME, TOKEN_SYMBOL, TOKEN_DECIMALS, TOKEN_TOTALSUPPLY ], { from: owner })

               token = deploymentResult.instance

               assert.equal(await token.methods.finalized().call(), false)

               await token.methods.setOpsAddress(ops).send({ from: owner })
               await token.methods.transfer(ops, 1000).send({ from: owner })

               await token.methods.finalize().send({ from: owner })
            })


            it('transfer 0 tokens', async () => {
               assert.equal(await token.methods.transfer(account1, 0).call({ from: ops }), true)
               await Utils.checkTransfer(await token.methods.transfer(account1, 0).send({ from: ops }), ops, account1, 0)
            })

            it('transfer 1 to address 0', async () => {
               assert.equal(await token.methods.transfer(0, 1).call({ from: ops }), true)
               await Utils.checkTransfer(await token.methods.transfer(0, 1).send({ from: ops }), ops, 0, 1)
            })

            it('transfer 1 to this', async () => {
               assert.equal(await token.methods.transfer(token._address, 1).call({ from: ops }), true)
               await Utils.checkTransfer(await token.methods.transfer(token._address, 1).send({ from: ops }), ops, token._address, 1)
            })

            it('transfer > balance to other account', async () => {
               const balance = new BigNumber(await token.methods.balanceOf(ops).call())
               assert.equal(balance.gt(0), true, "Expected owner balance to be > 0.")

               await TestLib.assertCallFails(token.methods.transfer(account1, balance.add(1)).call({ from: ops }))
            })

            it('transfer balance to other account', async () => {
               const balance = new BigNumber(await token.methods.balanceOf(ops).call())

               assert.equal(await token.methods.transfer(account1, balance).call({ from: ops }), true)
               Utils.checkTransfer(await token.methods.transfer(account1, balance).send({ from: ops }), ops, account1, balance)

               assert.equal(await token.methods.balanceOf(ops).call(), 0)
               assert.equal(await token.methods.balanceOf(account1).call(), balance)
            })

            it('transfer 1 to other account, while balance = 0', async () => {
               const balance = new BigNumber(await token.methods.balanceOf(ops).call())
               assert.equal(balance, 0)

               await TestLib.assertCallFails(token.methods.transfer(account1, 1).call({ from: ops }))
            })

            it('transfer all tokens back to ops', async () => {
               const balance = new BigNumber(await token.methods.balanceOf(account1).call())

               Utils.checkTransfer(await token.methods.transfer(ops, balance).send({ from: account1 }), account1, ops, balance)
            })
         })


         context('sender = normal', async () => {

            before(async () => {
               assert.equal(await token.methods.finalized().call(), true)

               await token.methods.transfer(account1, 1000).send({ from: owner })
            })

            it('transfer 0 tokens', async () => {
               assert.equal(await token.methods.transfer(account2, 0).call({ from: account1 }), true)
               await Utils.checkTransfer(await token.methods.transfer(account2, 0).send({ from: account1 }), account1, account2, 0)
            })

            it('transfer 1 to address 0', async () => {
               assert.equal(await token.methods.transfer(0, 1).call({ from: account1 }), true)
               await Utils.checkTransfer(await token.methods.transfer(0, 1).send({ from: account1 }), account1, 0, 1)
            })

            it('transfer 1 to this', async () => {
               assert.equal(await token.methods.transfer(token._address, 1).call({ from: account1 }), true)
               await Utils.checkTransfer(await token.methods.transfer(token._address, 1).send({ from: account1 }), account1, token._address, 1)
            })

            it('transfer > balance to other account', async () => {
               const balance = new BigNumber(await token.methods.balanceOf(account1).call())
               assert.equal(balance.gt(0), true, "Expected owner balance to be > 0.")

               await TestLib.assertCallFails(token.methods.transfer(account2, balance.add(1)).call({ from: account1 }))
            })

            it('transfer balance to other account', async () => {
               const balance = new BigNumber(await token.methods.balanceOf(account1).call())

               assert.equal(await token.methods.transfer(account2, balance).call({ from: account1 }), true)
               Utils.checkTransfer(await token.methods.transfer(account2, balance).send({ from: account1 }), account1, account2, balance)

               assert.equal(await token.methods.balanceOf(account1).call(), 0)
               assert.equal(await token.methods.balanceOf(account2).call(), balance)
            })

            it('transfer 1 to other account, while balance = 0', async () => {
               const balance = new BigNumber(await token.methods.balanceOf(account1).call())
               assert.equal(balance, 0)

               await TestLib.assertCallFails(token.methods.transfer(account2, 1).call({ from: account1 }))
            })

            it('transfer all tokens back', async () => {
               const balance = new BigNumber(await token.methods.balanceOf(account2).call())

               Utils.checkTransfer(await token.methods.transfer(account1, balance).send({ from: account2 }), account2, account1, balance)
            })

         })
      })


      context('transferFrom function', async () => {

         before(async () => {
            await token.methods.transfer(account1, 1000).send({ from: owner })
         })


         context('sender = owner', async () => {

            it('transferFrom 0 address 0 to other account', async () => {
               assert.equal(await token.methods.transferFrom(0, account1, 0).call({ from: owner }), true)
               await Utils.checkTransfer(await token.methods.transferFrom(0, account1, 0).send({ from: owner }), 0, account1, 0)
            })

            it('transferFrom 1 address 0 to other account', async () => {
               await TestLib.assertCallFails(token.methods.transferFrom(0, account1, 1).call({ from: owner }))
            })

            it('transferFrom 0 owner to address 0', async () => {
               assert.equal(await token.methods.transferFrom(owner, 0, 0).call({ from: owner }), true)
               await Utils.checkTransfer(await token.methods.transferFrom(owner, 0, 0).send({ from: owner }), owner, 0, 0)
            })

            it('transferFrom 1 owner to address 0', async () => {
               await token.methods.approve(owner, 1).send({ from: owner })

               assert.equal(await token.methods.transferFrom(owner, 0, 1).call({ from: owner }), true)
               await Utils.checkTransfer(await token.methods.transferFrom(owner, 0, 1).send({ from: owner }), owner, 0, 1)
            })

            it('transferFrom 0 owner to this', async () => {
               assert.equal(await token.methods.transferFrom(owner, token._address, 0).call({ from: owner }), true)
               await Utils.checkTransfer(await token.methods.transferFrom(owner, token._address, 0).send({ from: owner }), owner, token._address, 0)
            })

            it('transferFrom 1 owner to this', async () => {
               await token.methods.approve(owner, 1).send({ from: owner })

               assert.equal(await token.methods.transferFrom(owner, token._address, 1).call({ from: owner }), true)
               await Utils.checkTransfer(await token.methods.transferFrom(owner, token._address, 1).send({ from: owner }), owner, token._address, 1)
            })

            it('transferFrom 0 owner to other account', async () => {
               assert.equal(await token.methods.transferFrom(owner, account1, 0).call({ from: owner }), true)
               await Utils.checkTransfer(await token.methods.transferFrom(owner, account1, 0).send({ from: owner }), owner, account1, 0)
            })

            it('transferFrom 0 ops to other account', async () => {
               assert.equal(await token.methods.transferFrom(ops, account1, 0).call({ from: owner }), true)
               await Utils.checkTransfer(await token.methods.transferFrom(ops, account1, 0).send({ from: owner }), ops, account1, 0)
            })

            it('transferFrom 1 ops to other account', async () => {
               await token.methods.transfer(ops, 1).send({ from: owner })
               await token.methods.approve(owner, 1).send({ from: ops })

               assert.equal(await token.methods.transferFrom(ops, account1, 1).call({ from: owner }), true)
               await Utils.checkTransfer(await token.methods.transferFrom(ops, account1, 1).send({ from: owner }), ops, account1, 1)
            })

            it('transferFrom 1 owner to other account, no allowance ', async () => {
               await TestLib.assertCallFails(token.methods.transferFrom(owner, account1, 1).call({ from: owner }))
            })

            it('transferFrom 1 owner to other account', async () => {
               await token.methods.approve(owner, 1).send({ from: owner })

               assert.equal(await token.methods.transferFrom(owner, account1, 1).call({ from: owner }), true)
               await Utils.checkTransfer(await token.methods.transferFrom(owner, account1, 1).send({ from: owner }), owner, account1, 1)
            })

            it('transferFrom 1 other account to this', async () => {
               assert.isTrue((await token.methods.balanceOf(account1).call()) > 0)

               await token.methods.approve(owner, 1).send({ from: account1 })

               assert.equal(await token.methods.transferFrom(account1, token._address, 1).call({ from: owner }), true)
               await Utils.checkTransfer(await token.methods.transferFrom(account1, token._address, 1).send({ from: owner }), account1, token._address, 1)
            })

            it('transferFrom 1 while allowance is 0', async () => {
               // Make sure account1 is funded for upcoming tests
               const balanceBefore = new BigNumber(await token.methods.balanceOf(account1).call())
               assert.isTrue(balanceBefore.gte(1))

               await token.methods.approve(owner, 0).send({ from: account1 })

               await TestLib.assertCallFails(token.methods.transferFrom(account1, account3, 1).call({ from: owner }))
            })

            it('transferFrom 10 while allowance is 1', async () => {
               const balanceBefore = new BigNumber(await token.methods.balanceOf(account1).call())
               assert.isTrue(balanceBefore.gte(10))

               await token.methods.approve(owner, 1).send({ from: account1 })

               await TestLib.assertCallFails(token.methods.transferFrom(account1, account3, 10).call({ from: owner }))
            })

            it('transferFrom 10 while allowance is 10', async () => {
               const balanceBefore = new BigNumber(await token.methods.balanceOf(account1).call())
               assert.isTrue(balanceBefore.gte(10))

               await token.methods.approve(owner, 10).send({ from: account1 })

               assert.equal(await token.methods.transferFrom(account1, account3, 10).call({ from: owner }), true)
               Utils.checkTransfer(await token.methods.transferFrom(account1, account3, 10).send({ from: owner }), account1, account3, 10)

               const balanceAfter = new BigNumber(await token.methods.balanceOf(account1).call())
               assert.equal(balanceBefore.sub(balanceAfter).toString(), "10")
            })

            it('transferFrom 10 again', async () => {
               const balanceBefore = new BigNumber(await token.methods.balanceOf(account1).call())
               assert.isTrue(balanceBefore.gte(10))

               await TestLib.assertCallFails(token.methods.transferFrom(account1, account3, 10).call({ from: owner }))
            })

            it('transferFrom 5 while allowance is 10', async () => {
               const balanceBefore = new BigNumber(await token.methods.balanceOf(account1).call())
               assert.isTrue(balanceBefore.gte(5))

               await token.methods.approve(owner, 10).send({ from: account1 })

               assert.equal(await token.methods.transferFrom(account1, account3, 5).call({ from: owner }), true)
               Utils.checkTransfer(await token.methods.transferFrom(account1, account3, 5).send({ from: owner }), account1, account3, 5)

               const balanceAfter = new BigNumber(await token.methods.balanceOf(account1).call())
               assert.equal(balanceBefore.sub(balanceAfter).toString(), "5")
            })

            it('transferFrom 1 after allowance changed from 5 -> 0', async () => {
               const balanceBefore = new BigNumber(await token.methods.balanceOf(account1).call())
               assert.isTrue(balanceBefore.gte(1))
               assert.equal(await token.methods.allowance(account1, owner).call(), 5)

               await token.methods.approve(owner, 0).send({ from: account1 })

               await TestLib.assertCallFails(token.methods.transferFrom(account1, account3, 5).call({ from: owner }))
            })

            it('transferFrom 10 + 10 + 1 while allowance is 20', async () => {
               const balance1Before = new BigNumber(await token.methods.balanceOf(account1).call())
               const balance3Before = new BigNumber(await token.methods.balanceOf(account3).call())
               assert.isTrue(balance1Before.gt(20))

               await token.methods.approve(owner, 20).send({ from: account1 })

               assert.equal(await token.methods.transferFrom(account1, account3, 10).call({ from: owner }), true)
               Utils.checkTransfer(await token.methods.transferFrom(account1, account3, 10).send({ from: owner }), account1, account3, 10)

               assert.equal(await token.methods.transferFrom(account1, account3, 10).call({ from: owner }), true)
               Utils.checkTransfer(await token.methods.transferFrom(account1, account3, 10).send({ from: owner }), account1, account3, 10)

               await TestLib.assertCallFails(token.methods.transferFrom(account1, account3, 1).call({ from: owner }))

               const balance1After = new BigNumber(await token.methods.balanceOf(account1).call())
               const balance3After = new BigNumber(await token.methods.balanceOf(account3).call())
               assert.equal(balance1After.sub(balance1Before).toString(), "-20")
               assert.equal(balance3After.sub(balance3Before).toString(), "20")
            })
         })


         context('sender = ops', async () => {

            before(async () => {
               await token.methods.transfer(ops, 1000).send({ from: owner })
            })


            it('transferFrom 0 address 0 to other account', async () => {
               assert.equal(await token.methods.transferFrom(0, account1, 0).call({ from: ops }), true)
               Utils.checkTransfer(await token.methods.transferFrom(0, account1, 0).send({ from: ops }), 0, account1, 0)
            })

            it('transferFrom 1 address 0 to other account', async () => {
               await TestLib.assertCallFails(token.methods.transferFrom(0, account1, 1).call({ from: ops }))
            })

            it('transferFrom 0 owner to address 0', async () => {
               assert.equal(await token.methods.transferFrom(owner, 0, 0).call({ from: ops }), true)
               Utils.checkTransfer(await token.methods.transferFrom(owner, 0, 0).send({ from: ops }), owner, 0, 0)
            })

            it('transferFrom 1 owner to address 0', async () => {
               await token.methods.approve(ops, 1).send({ from: owner })

               assert.equal(await token.methods.transferFrom(owner, 0, 1).call({ from: ops }), true)
               Utils.checkTransfer(await token.methods.transferFrom(owner, 0, 1).send({ from: ops }), owner, 0, 1)
            })

            it('transferFrom 0 owner to this', async () => {
               assert.equal(await token.methods.transferFrom(owner, token._address, 0).call({ from: ops }), true)
               Utils.checkTransfer(await token.methods.transferFrom(owner, token._address, 0).send({ from: ops }), owner, token._address, 0)
            })

            it('transferFrom 1 owner to this', async () => {
               await token.methods.approve(ops, 1).send({ from: owner })

               assert.equal(await token.methods.transferFrom(owner, token._address, 1).call({ from: ops }), true)
               Utils.checkTransfer(await token.methods.transferFrom(owner, token._address, 1).send({ from: ops }), owner, token._address, 1)
            })

            it('transferFrom 0 owner to other account', async () => {
               assert.equal(await token.methods.transferFrom(owner, account1, 0).call({ from: ops }), true)
               Utils.checkTransfer(await token.methods.transferFrom(owner, account1, 0).send({ from: ops }), owner, account1, 0)
            })

            it('transferFrom 1 owner to other account, no allowance ', async () => {
               await TestLib.assertCallFails(token.methods.transferFrom(owner, account1, 1).call({ from: ops }))
            })

            it('transferFrom 1 owner to other account', async () => {
               await token.methods.approve(ops, 1).send({ from: owner })

               assert.equal(await token.methods.transferFrom(owner, account1, 1).call({ from: ops }), true)
               Utils.checkTransfer(await token.methods.transferFrom(owner, account1, 1).send({ from: ops }), owner, account1, 1)
            })

            it('transferFrom 0 ops to other account', async () => {
               assert.equal(await token.methods.transferFrom(ops, account1, 0).call({ from: ops }), true)
               Utils.checkTransfer(await token.methods.transferFrom(ops, account1, 0).send({ from: ops }), ops, account1, 0)
            })

            it('transferFrom 1 ops to other account', async () => {
               await token.methods.approve(ops, 1).send({ from: ops })

               assert.equal(await token.methods.transferFrom(ops, account1, 1).call({ from: ops }), true)
               Utils.checkTransfer(await token.methods.transferFrom(ops, account1, 1).send({ from: ops }), ops, account1, 1)
            })

            it('transferFrom 1 other account to this', async () => {
               const balanceBefore = new BigNumber(await token.methods.balanceOf(account1).call())
               assert.isTrue(balanceBefore.gte(1))

               await token.methods.approve(ops, 1).send({ from: account1 })

               assert.equal(await token.methods.transferFrom(account1, account3, 1).call({ from: ops }), true)
               Utils.checkTransfer(await token.methods.transferFrom(account1, account3, 1).send({ from: ops }), account1, account3, 1)
            })

            it('transferFrom 1 while allowance is 0', async () => {
               // Make sure account1 is funded for upcoming tests
               const balanceBefore = new BigNumber(await token.methods.balanceOf(account1).call())
               assert.isTrue(balanceBefore.gte(1))

               await token.methods.approve(ops, 0).send({ from: account1 })

               await TestLib.assertCallFails(token.methods.transferFrom(account1, account3, 1).call({ from: ops }))
            })

            it('transferFrom 10 while allowance is 1', async () => {
               const balanceBefore = new BigNumber(await token.methods.balanceOf(account1).call())
               assert.isTrue(balanceBefore.gte(10))

               await token.methods.approve(ops, 1).send({ from: account1 })

               await TestLib.assertCallFails(token.methods.transferFrom(account1, account3, 10).call({ from: ops }))
            })

            it('transferFrom 10 while allowance is 10', async () => {
               const balanceBefore = new BigNumber(await token.methods.balanceOf(account1).call())
               assert.isTrue(balanceBefore.gte(10))

               await token.methods.approve(ops, 10).send({ from: account1 })

               assert.equal(await token.methods.transferFrom(account1, account3, 10).call({ from: ops }), true)
               Utils.checkTransfer(await token.methods.transferFrom(account1, account3, 10).send({ from: ops }), account1, account3, 10)

               const balanceAfter = new BigNumber(await token.methods.balanceOf(account1).call())
               assert.equal(balanceBefore.sub(balanceAfter).toString(), "10")
            })

            it('transferFrom 10 again', async () => {
               const balanceBefore = new BigNumber(await token.methods.balanceOf(account1).call())
               assert.isTrue(balanceBefore.gte(10))

               await TestLib.assertCallFails(token.methods.transferFrom(account1, account3, 10).call({ from: ops }))
            })

            it('transferFrom 5 while allowance is 10', async () => {
               const balanceBefore = new BigNumber(await token.methods.balanceOf(account1).call())
               assert.isTrue(balanceBefore.gte(5))

               await token.methods.approve(ops, 10).send({ from: account1 })

               assert.equal(await token.methods.transferFrom(account1, account3, 5).call({ from: ops }), true)
               Utils.checkTransfer(await token.methods.transferFrom(account1, account3, 5).send({ from: ops }), account1, account3, 5)

               const balanceAfter = new BigNumber(await token.methods.balanceOf(account1).call())
               assert.equal(balanceBefore.sub(balanceAfter).toString(), "5")
            })

            it('transferFrom 1 after allowance changed from 5 -> 0', async () => {
               const balanceBefore = new BigNumber(await token.methods.balanceOf(account1).call())
               assert.isTrue(balanceBefore.gte(1))

               await token.methods.approve(ops, 0).send({ from: account1 })

               await TestLib.assertCallFails(token.methods.transferFrom(account1, account3, 5).call({ from: ops }))
            })

            it('transferFrom 10 + 10 + 1 while allowance is 20', async () => {
               const balance1Before = new BigNumber(await token.methods.balanceOf(account1).call())
               const balance3Before = new BigNumber(await token.methods.balanceOf(account3).call())
               assert.isTrue(balance1Before.gt(20))

               await token.methods.approve(ops, 20).send({ from: account1 })

               assert.equal(await token.methods.transferFrom(account1, account3, 10).call({ from: ops }), true)
               Utils.checkTransfer(await token.methods.transferFrom(account1, account3, 10).send({ from: ops }), account1, account3, 10)

               assert.equal(await token.methods.transferFrom(account1, account3, 10).call({ from: ops }), true)
               Utils.checkTransfer(await token.methods.transferFrom(account1, account3, 10).send({ from: ops }), account1, account3, 10)

               await TestLib.assertCallFails(token.methods.transferFrom(account1, account3, 1).call({ from: ops }))

               const balance1After = new BigNumber(await token.methods.balanceOf(account1).call())
               const balance3After = new BigNumber(await token.methods.balanceOf(account3).call())
               assert.equal(balance1After.sub(balance1Before).toString(), "-20")
               assert.equal(balance3After.sub(balance3Before).toString(), "20")
            })
         })


         context('sender = normal ', async () => {

            before(async () => {
               await token.methods.transfer(account1, 1000).send({ from: owner })
               await token.methods.transfer(account2, 1000).send({ from: owner })
            })


            it('transferFrom 0 address 0 to other account', async () => {
               assert.equal(await token.methods.transferFrom(0, account2, 0).call({ from: account1 }), true)
               Utils.checkTransfer(await token.methods.transferFrom(0, account2, 0).send({ from: account1 }), 0, account2, 0)
            })

            it('transferFrom 1 address 0 to other account', async () => {
               await TestLib.assertCallFails(token.methods.transferFrom(0, account2, 1).call({ from: account1 }))
            })

            it('transferFrom 0 owner to address 0', async () => {
               assert.equal(await token.methods.transferFrom(owner, 0, 0).call({ from: account1 }), true)
               Utils.checkTransfer(await token.methods.transferFrom(owner, 0, 0).send({ from: account1 }), owner, 0, 0)
            })

            it('transferFrom 1 owner to address 0', async () => {
               await token.methods.approve(account1, 1).send({ from: owner })

               assert.equal(await token.methods.transferFrom(owner, 0, 1).call({ from: account1 }), true)
               Utils.checkTransfer(await token.methods.transferFrom(owner, 0, 1).send({ from: account1 }), owner, 0, 1)
            })

            it('transferFrom 0 owner to this', async () => {
               assert.equal(await token.methods.transferFrom(owner, token._address, 0).call({ from: account1 }), true)
               Utils.checkTransfer(await token.methods.transferFrom(owner, token._address, 0).send({ from: account1 }), owner, token._address, 0)
            })

            it('transferFrom 1 owner to this', async () => {
               await token.methods.approve(account1, 1).send({ from: owner })

               assert.equal(await token.methods.transferFrom(owner, token._address, 1).call({ from: account1 }), true)
               Utils.checkTransfer(await token.methods.transferFrom(owner, token._address, 1).send({ from: account1 }), owner, token._address, 1)
            })

            it('transferFrom 0 owner to other account', async () => {
               assert.equal(await token.methods.transferFrom(owner, account2, 0).call({ from: account1 }), true)
               Utils.checkTransfer(await token.methods.transferFrom(owner, account2, 0).send({ from: account1 }), owner, account2, 0)
            })

            it('transferFrom 1 owner to other account, no allowance ', async () => {
               await TestLib.assertCallFails(token.methods.transferFrom(owner, account2, 1).call({ from: account1 }))
            })

            it('transferFrom 1 owner to other account', async () => {
               await token.methods.approve(account1, 1).send({ from: owner })

               assert.equal(await token.methods.transferFrom(owner, account2, 1).call({ from: account1 }), true)
               Utils.checkTransfer(await token.methods.transferFrom(owner, account2, 1).send({ from: account1 }), owner, account2, 1)
            })

            it('transferFrom 0 ops to other account', async () => {
               assert.equal(await token.methods.transferFrom(ops, account2, 0).call({ from: account1 }), true)
               Utils.checkTransfer(await token.methods.transferFrom(ops, account2, 0).send({ from: account1 }), ops, account2, 0)
            })

            it('transferFrom 1 ops to other account', async () => {
               await token.methods.approve(account1, 1).send({ from: ops })

               assert.equal(await token.methods.transferFrom(ops, account2, 1).call({ from: account1 }), true)
               Utils.checkTransfer(await token.methods.transferFrom(ops, account2, 1).send({ from: account1 }), ops, account2, 1)
            })

            it('transferFrom 1 other account to this', async () => {
               const balanceBefore = new BigNumber(await token.methods.balanceOf(account2).call())
               assert.isTrue(balanceBefore.gte(1))

               await token.methods.approve(account1, 1).send({ from: account2 })

               assert.equal(await token.methods.transferFrom(account2, account3, 1).call({ from: account1 }), true)
               Utils.checkTransfer(await token.methods.transferFrom(account2, account3, 1).send({ from: account1 }), account2, account3, 1)
            })

            it('transferFrom 1 while allowance is 0', async () => {
               const balanceBefore = new BigNumber(await token.methods.balanceOf(account2).call())
               assert.isTrue(balanceBefore.gte(1))

               await token.methods.approve(account1, 0).send({ from: account2 })

               await TestLib.assertCallFails(token.methods.transferFrom(account2, account3, 1).call({ from: account1 }))
            })

            it('transferFrom 10 while allowance is 1', async () => {
               const balanceBefore = new BigNumber(await token.methods.balanceOf(account2).call())
               assert.isTrue(balanceBefore.gte(10))

               await token.methods.approve(account1, 1).send({ from: account2 })

               await TestLib.assertCallFails(token.methods.transferFrom(account2, account3, 10).call({ from: account1 }))
            })

            it('transferFrom 10 while allowance is 10', async () => {
               const balanceBefore = new BigNumber(await token.methods.balanceOf(account2).call())
               assert.isTrue(balanceBefore.gte(10))

               await token.methods.approve(account1, 10).send({ from: account2 })

               assert.equal(await token.methods.transferFrom(account2, account3, 10).call({ from: account1 }), true)
               Utils.checkTransfer(await token.methods.transferFrom(account2, account3, 10).send({ from: account1 }), account2, account3, 10)

               const balanceAfter = new BigNumber(await token.methods.balanceOf(account2).call())
               assert.equal(balanceBefore.sub(balanceAfter).toString(), "10")
            })

            it('transferFrom 10 again', async () => {
               const balanceBefore = new BigNumber(await token.methods.balanceOf(account2).call())
               assert.isTrue(balanceBefore.gte(10))

               await TestLib.assertCallFails(token.methods.transferFrom(account2, account3, 10).call({ from: account1 }))
            })

            it('transferFrom 5 while allowance is 10', async () => {
               const balanceBefore = new BigNumber(await token.methods.balanceOf(account2).call())
               assert.isTrue(balanceBefore.gte(5))

               await token.methods.approve(account1, 10).send({ from: account2 })

               assert.equal(await token.methods.transferFrom(account2, account3, 5).call({ from: account1 }), true)
               Utils.checkTransfer(await token.methods.transferFrom(account2, account3, 5).send({ from: account1 }), account2, account3, 5)

               const balanceAfter = new BigNumber(await token.methods.balanceOf(account2).call())
               assert.equal(balanceBefore.sub(balanceAfter).toString(), "5")
            })

            it('transferFrom 1 after allowance changed from 5 -> 0', async () => {
               const balanceBefore = new BigNumber(await token.methods.balanceOf(account2).call())
               assert.isTrue(balanceBefore.gte(1))

               await token.methods.approve(account1, 0).send({ from: account2 })

               await TestLib.assertCallFails(token.methods.transferFrom(account2, account3, 5).call({ from: account1 }))
            })

            it('transferFrom 10 + 10 + 1 while allowance is 20', async () => {
               const balance1Before = new BigNumber(await token.methods.balanceOf(account1).call())
               const balance2Before = new BigNumber(await token.methods.balanceOf(account2).call())
               const balance3Before = new BigNumber(await token.methods.balanceOf(account3).call())
               assert.isTrue(balance2Before.gt(20))

               await token.methods.approve(account1, 20).send({ from: account2 })

               assert.equal(await token.methods.transferFrom(account2, account3, 10).call({ from: account1 }), true)
               Utils.checkTransfer(await token.methods.transferFrom(account2, account3, 10).send({ from: account1 }), account2, account3, 10)

               assert.equal(await token.methods.transferFrom(account2, account3, 10).call({ from: account1 }), true)
               Utils.checkTransfer(await token.methods.transferFrom(account2, account3, 10).send({ from: account1 }), account2, account3, 10)

               await TestLib.assertCallFails(token.methods.transferFrom(account2, account3, 1).call({ from: account1 }))

               const balance1After = new BigNumber(await token.methods.balanceOf(account1).call())
               const balance2After = new BigNumber(await token.methods.balanceOf(account2).call())
               const balance3After = new BigNumber(await token.methods.balanceOf(account3).call())
               assert.equal(balance1After.sub(balance1Before).toString(), "0")
               assert.equal(balance2After.sub(balance2Before).toString(), "-20")
               assert.equal(balance3After.sub(balance3Before).toString(), "20")
            })
         })
      })
   })

   context('approve function', async () => {

      it('approve(0, 0)', async () => {
         Utils.checkApprove(await token.methods.approve(0, 0).send({ from: owner }), owner, 0, 0)
      })

      it('approve(0, 1)', async () => {
         Utils.checkApprove(await token.methods.approve(0, 1).send({ from: owner }), owner, 0, 1)
      })

      it('approve(this, 1)', async () => {
         Utils.checkApprove(await token.methods.approve(token._address, 1).send({ from: owner }), owner, token._address, 1)
      })

      it('approve(other account, 0)', async () => {
         Utils.checkApprove(await token.methods.approve(account1, 0).send({ from: owner }), owner, account1, 0)
      })

      it('approve(other account, 1)', async () => {
         Utils.checkApprove(await token.methods.approve(account1, 1).send({ from: owner }), owner, account1, 1)
      })

      it('approve(other account, > balance)', async () => {
         const balance = new BigNumber(await token.methods.balanceOf(owner).call())

         Utils.checkApprove(await token.methods.approve(account1, 0).send({ from: owner }), owner, account1, 0)
         Utils.checkApprove(await token.methods.approve(account1, balance.add(1)).send({ from: owner }), owner, account1, balance.add(1))
         Utils.checkApprove(await token.methods.approve(account1, 0).send({ from: owner }), owner, account1, 0)
      })

      it('approve amount without approving 0 first', async () => {
         assert.equal(await token.methods.allowance(owner, account1).call(), 0)

         Utils.checkApprove(await token.methods.approve(account1, 10).send({ from: owner }), owner, account1, 10)
         Utils.checkApprove(await token.methods.approve(account1, 20).send({ from: owner }), owner, account1, 20)

         assert.equal(await token.methods.allowance(owner, account1).call(), 20)
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
         assert.equal(await token.methods.allowance(token._address, account1).call(), 0)
      })

      it('allowance(other account, yet another account)', async () => {
         await token.methods.approve(account2, 123).send({ from: account1})

         assert.equal(await token.methods.allowance(account1, account2).call(), 123)
      })
   })


   context('finalize function', async () => {

      before(async () => {
         deploymentResult = await TestLib.deploy('FinalizableToken', [ TOKEN_NAME, TOKEN_SYMBOL, TOKEN_DECIMALS, TOKEN_TOTALSUPPLY ], { from: owner })

         token = deploymentResult.instance

         await token.methods.setOpsAddress(ops).send({ from: owner })
      })


      it('other account cannot call finalize', async () => {
         assert.equal(await token.methods.finalized().call(), false)
         await TestLib.assertCallFails(token.methods.finalize().call({ from: account1 }))
      })

      it('ops cannot call finalize', async () => {
         assert.equal(await token.methods.finalized().call(), false)
         assert.equal(await token.methods.opsAddress().call(), ops)
         await TestLib.assertCallFails(token.methods.finalize().call({ from: ops }))
      })

      it('owner can call finalize', async () => {
         assert.equal(await token.methods.finalized().call(), false)
         assert.equal(await token.methods.owner().call(), owner)
         assert.equal(await token.methods.finalize().call({ from: owner }), true)
         Utils.checkFinalize(await token.methods.finalize().send({ from: owner }))
         assert.equal(await token.methods.finalized().call(), true)
      })
   })
})
