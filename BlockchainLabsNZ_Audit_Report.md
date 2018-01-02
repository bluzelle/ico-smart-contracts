# Bluzelle Audit Report

## Preamble
This audit report was undertaken by BlockchainLabs.nz for the purpose of providing feedback to Bluzelle. It has subsequently been shared publicly without any express or implied warranty.

Solidity contracts were sourced from the public Github repo [njmurarka/ico-solidity](https://github.com/njmurarka/ico-solidity) prior to commit [c1878866127df502c41036f14f30ad737119c201](https://github.com/njmurarka/ico-solidity/tree/c1878866127df502c41036f14f30ad737119c201) - we would encourage all community members and token holders to make their own assessment of the contracts.

## Scope
All Solidity code contained in [/contracts](https://github.com/BlockchainLabsNZ/bluzelle-contracts/tree/c1878866127df502c41036f14f30ad737119c201) was considered in scope along with the tests contained in [/tests](https://github.com/BlockchainLabsNZ/bluzelle-contracts/tree/c1878866127df502c41036f14f30ad737119c201/tests) as a basis for static and dynamic analysis.

## Focus Areas
The audit report is focused on the following key areas - though this is not an exhaustive list.
### Correctness
- No correctness defects uncovered during static analysis?
- No implemented contract violations uncovered during execution?
- No other generic incorrect behaviour detected during execution?
- Adherence to adopted standards such as ERC20?
### Testability
- Test coverage across all functions and events?
- Test cases for both expected behaviour and failure modes?
- Settings for easy testing of a range of parameters?
- No reliance on nested callback functions or console logs?
- Avoidance of test scenarios calling other test scenarios?
### Security
- No presence of known security weaknesses?
- No funds at risk of malicious attempts to withdraw/transfer?
- No funds at risk of control fraud?
- Prevention of Integer Overflow or Underflow?
### Best Practice
- Explicit labeling for the visibility of functions and state variables?
- Proper management of gas limits and nested execution?
- Latest version of the Solidity compiler?

## Focus Areas
The audit report is focused on the following key areas - though this is not an exhaustive list.
### Correctness
- No correctness defects uncovered during static analysis?
- No implemented contract violations uncovered during execution?
- No other generic incorrect behaviour detected during execution?
- Adherence to adopted standards such as ERC20?
### Testability
- Test coverage across all functions and events?
- Test cases for both expected behaviour and failure modes?
- Settings for easy testing of a range of parameters?
- No reliance on nested callback functions or console logs?
- Avoidance of test scenarios calling other test scenarios?
### Security
- No presence of known security weaknesses?
- No funds at risk of malicious attempts to withdraw/transfer?
- No funds at risk of control fraud?
- Prevention of Integer Overflow or Underflow?
### Best Practice
- Explicit labeling for the visibility of functions and state variables?
- Proper management of gas limits and nested execution?
- Latest version of the Solidity compiler?

## Classification
### Defect Severity
- Minor - A defect that does not have a material impact on the contract execution and is likely to be subjective.
- Moderate - A defect that could impact the desired outcome of the contract execution in a specific scenario.
- Major - A defect that impacts the desired outcome of the contract execution or introduces a weakness that may be exploited.
- Critical - A defect that presents a significant security vulnerability or failure of the contract across a range of scenarios.

## Findings
### Minor
- **Add a README.md file outlining deployment steps to increase transparency** -  We recommend adding a README.md file detailing deployment steps so contributors can best understand the procedure of participating ... [View on GitHub](https://github.com/BlockchainLabsNZ/polymath-contracts/blob/master/README.md)
  - [ ] Not Fixed

### Moderate
- None found

### Major
- None found

### Critical
- None found

## Conclusion

Overall we have been fully satisfied with the resulting contracts following the audit feedback period. We took part in carefully reviewing all source code provided, including deployment testing.

To further satisfy test coverage, both `BluzelleToken.sol` and `BluzelleTokenSale.sol` were deployed onto the Kovan Test Network to achieve simulation of a mock sale.

The developers have followed common best practices, as well as made some improvements upon existing frameworks. We were pleased to see a demonstrated awareness for compiling contracts in a modular format to avoid confusion.

The only area we suggest for improvement are attaching a README.md with deployment and crowdsale participation instructions, this does not affect the security of the contracts.
