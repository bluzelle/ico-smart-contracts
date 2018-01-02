// ----------------------------------------------------------------------------
// runTests.js - Utility for running unit tests under Mocha
// Enuma Blockchain Framework
//
// Copyright (c) 2017 Enuma Technologies.
// http://www.enuma.io/
// ----------------------------------------------------------------------------

const fs = require('fs')
const Web3 = require('web3')
const Path = require('path')
const Mocha = require('mocha')
const AsyncFile = require('async-file')


async function run(filePath) {

   var filePaths = null

   if (filePath) {
      filePaths = [ filePath ]
   } else {
      const testDir = Path.join(__dirname, '../tests')

      const fileNames = await AsyncFile.readdir(testDir)

      filePaths = []
      for (i = 0; i < fileNames.length; i++) {
         if (fileNames[i].endsWith(".js") !== true) {
            continue
         }

         filePaths.push(Path.join(testDir, fileNames[i]))
      }
   }


   var mocha = new Mocha({
      ui       : 'bdd',
      reporter : 'spec',
      //reporter: 'json'
      timeout  : 20000 // 20 seconds timeout since deployment to test/main net may take time...
   });

   for (i = 0; i < filePaths.length; i++) {
      if (filePaths[i].endsWith(".js") !== true) {
         continue
      }

      mocha.addFile(
         filePaths[i]
      )
   }

   var runner = mocha.run( (errors) => {
   })
}

if (process.argv.length > 2) {
   run(process.argv[2])
}
else {
   run()
}
