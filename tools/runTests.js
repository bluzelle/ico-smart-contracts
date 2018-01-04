// ----------------------------------------------------------------------------
// runTests.js - Utility for running unit tests under Mocha
// Enuma Blockchain Platform
//
// Copyright (c) 2017 Enuma Technologies.
// https://www.enuma.io/
// ----------------------------------------------------------------------------

const fs = require('fs')
const Web3 = require('web3')
const Path = require('path')
const Mocha = require('mocha')
const AsyncFile = require('async-file')



async function findTestFiles(folderPath) {
   const fileNames = await AsyncFile.readdir(folderPath)

   var filePaths = []
   for (i = 0; i < fileNames.length; i++) {
      if (fileNames[i].endsWith(".js") !== true) {
         continue
      }

      filePaths.push(Path.join(folderPath, fileNames[i]))
   }

   return filePaths
}


async function run(filePath) {

   var filePaths = null

   if (filePath) {
      filePaths = [ filePath ]
   } else {
      const testDir = Path.join(__dirname, '../tests')
      const enumaTestDir = Path.join(testDir, 'Enuma')

      filePaths = []
      if (fs.existsSync(enumaTestDir)) {
         filePaths = filePaths.concat(await findTestFiles(enumaTestDir))
      }

      filePaths = filePaths.concat(await findTestFiles(testDir))
   }

   const configFilePath = findConfigFilePath(Path.resolve('./'))
   const rootPath = Path.dirname(configFilePath)

   const testLib = require(Path.join(rootPath, 'tools/testlib.js'))
   testLib.initialize()

   global.TestLib = testLib

   var mocha = new Mocha({
      ui       : 'bdd',
      reporter : 'spec',
      //reporter: 'json'
      timeout  : 20000 // 20 seconds timeout since deployment to test/main net may take time...
   })

   for (i = 0; i < filePaths.length; i++) {
      mocha.addFile(
         filePaths[i]
      )
   }

   try {
      var runner = mocha.run( (errors) => {
      })
   } catch (error) {
      console.log(error.stack)
   }
}


if (process.argv.length > 2) {
   run(process.argv[2])
}
else {
   run()
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
