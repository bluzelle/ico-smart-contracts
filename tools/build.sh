#!/bin/bash
mkdir -p "../build/"
solc --bin --abi --optimize --optimize-runs 200 --overwrite -o "../build/" "../contracts"/*.sol "../contracts/Enuma"/*.sol

