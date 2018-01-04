// ----------------------------------------------------------------------------
// utils.js - Set of helpers used by the tools.
// Enuma Blockchain Platform
//
// Copyright (c) 2017 Enuma Technologies.
// https://www.enuma.io/
// ----------------------------------------------------------------------------

const fs = require('fs')
const Web3 = require('web3')
const Path = require('path')


const projectRoot = Path.resolve('../')


module.exports.buildWeb3 = async (url) => {
   return buildWeb3(url)
}


async function buildWeb3(url) {
   return new Web3(new Web3.providers.HttpProvider(url))
}


module.exports.deployContract = async (name, args, options) => {
   const web3 = await buildWeb3()

   const abi = loadAbiByName(projectRoot, name)
   const bin = loadByteCodeByName(projectRoot, name)

   return deployContract(web3, name, abi, bin, args, options)
}


function loadAbiByName(projectRoot, name) {
   const filePath = Path.join(projectRoot, "build/" + name + ".abi")

   return loadAbiByPath(filePath)
}


function loadByteCodeByName(projectRoot, name) {
   const filePath = Path.join(projectRoot, "build/" + name + ".bin")

   return loadByteCodeByPath(filePath)
}


function loadAbiByPath(abiFilePath) {
   return JSON.parse(fs.readFileSync(abiFilePath).toString())
}


function loadByteCodeByPath(binFilePath) {
   return fs.readFileSync(binFilePath).toString()
}


async function deployContract(web3, name, abi, bytecode, args, options) {

   if (!options) {
      options = {}
   }

   if (!options.from) {
      options.from = await web3.eth.getCoinbase()
   }
   if (!options.gas) {
      options.gas = 4700000
      gasPrice: '20000000000'
   }

   options.data = "0x" + bytecode

   if (args) {
      options.arguments = args
   } else {
      options.arguments = []
   }

   const contract = new web3.eth.Contract(abi, null, options);

   var tx = contract.deploy(options)

   var txid = null
   var receipt = null

   console.log("Deploying contract " + name)

   const instance = await tx.send()
      .on('receipt', (value) => {
         receipt = value
      })
      .on('transactionHash', function(value){
         console.log("TxID     : " + value)
         txid = value
      })

   const code = await web3.eth.getCode(instance.options.address)

   if (code.length <= 2) {
       throw new Error("Contract deployment failed. Empty code.")
   }

   // Print summary
   console.log("Address  : " + instance.options.address)
   console.log("Gas used : " + receipt.gasUsed)

   return {
      receipt  : receipt,
      instance : instance
   }
}


module.exports.findConfigFilePath = (folderPath) => {
   return findConfigFilePath(folderPath)
}


function findConfigFilePath(folderPath) {
   const filePath = Path.join(folderPath, "config.json")

   if (fs.existsSync(filePath)) {
      return filePath
   }

   const parentFolderPath = Path.dirname(folderPath)

   if (folderPath == '/' || parentFolderPath == folderPath) {
      return null
   }

   return findConfigFilePath(parentFolderPath)
}


