import { NetworkIDE } from '../blockchain-app'

export const LANGUAGE_VERSIONS_STELLAR = {
  //   javascript: '18.15.0',
  //   typescript: '5.0.3',
  //   python: '3.10.0',
  //   java: '15.0.2',
  //   csharp: '6.12.0',
  rust: '1.58.0',
  sol: 'soon',
}

export const LANGUAGE_VERSIONS_CROSSFI = {
  //   javascript: '18.15.0',
  //   typescript: '5.0.3',
  //   python: '3.10.0',
  //   java: '15.0.2',
  //   csharp: '6.12.0',
  sol: '0.6.0',
  rust: 'soon',
}

export const CHAIN_SPECS = {
  STELLAR: {
    value: NetworkIDE.STELLAR,
    text: 'Soroban',
    imgSource: '/images/workspace/stellar-new.svg',
    imgStyle: 'w-[16px]',
  },
  CROSSFI: {
    value: NetworkIDE.CROSSFI,
    text: 'Crossfi',
    imgSource: '/images/workspace/crossfi-2.png',
    imgStyle: 'w-[18px]',
  },
}

export const CHAIN_TO_TEMPLATE = {
  STELLAR: `#![no_std]
use soroban_sdk::{contractimpl, Env, contract};
    
#[contract]
pub struct SumContract;
    
#[contractimpl]
impl SumContract {
  /// This is a simple sum smart-contract.
  ///
  /// start coding here
  pub fn add(env: Env, a: i32, b: i32) -> i32 {
    a + b
  }
}`,
  CROSSFI: `// SPDX-License-Identifier: MIT
// compiler version must be greater than or equal to 0.8.24 and less than 0.9.0
pragma solidity ^0.8.24;

contract HelloWorld {
    string public greet = "Hello World!";
}`,
}

export const CODE_SNIPPETS = {
  javascript: `\nfunction greet(name) {\n\tconsole.log("Hello, " + name + "!");\n}\n\ngreet("Alex");\n`,
  typescript: `\ntype Params = {\n\tname: string;\n}\n\nfunction greet(data: Params) {\n\tconsole.log("Hello, " + data.name + "!");\n}\n\ngreet({ name: "Alex" });\n`,
  python: `\ndef greet(name):\n\tprint("Hello, " + name + "!")\n\ngreet("Alex")\n`,
  java: `\npublic class HelloWorld {\n\tpublic static void main(String[] args) {\n\t\tSystem.out.println("Hello World");\n\t}\n}\n`,
  csharp:
    'using System;\n\nnamespace HelloWorld\n{\n\tclass Hello { \n\t\tstatic void Main(string[] args) {\n\t\t\tConsole.WriteLine("Hello World in C#");\n\t\t}\n\t}\n}\n',
  php: "<?php\n\n$name = 'Alex';\necho $name;\n",
}
