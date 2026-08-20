#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const code = fs.readFileSync(path.join(__dirname, '..', 'store.js'), 'utf8');
const start = code.indexOf('function parseFirebaseConfig');
const end = code.indexOf('function loadExternalScript');
const { parseFirebaseConfig } = vm.runInNewContext(code.slice(start, end) + '\n({ parseFirebaseConfig })');

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

const snippet = `// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
const firebaseConfig = {
  apiKey: "AIza-test",
  authDomain: "pl-predictions-pro.firebaseapp.com",
  projectId: "pl-predictions-pro",
  storageBucket: "pl-predictions-pro.appspot.com",
  messagingSenderId: "123",
  appId: "1:123:web:abc",
};
`;
const fromJs = parseFirebaseConfig(snippet);
assert(fromJs.apiKey === 'AIza-test', 'parse console snippet');
assert(fromJs.projectId === 'pl-predictions-pro', 'projectId from snippet');

const fromJson = parseFirebaseConfig(JSON.stringify({ apiKey: 'k', projectId: 'p' }));
assert(fromJson.apiKey === 'k', 'parse strict JSON');

assert(parseFirebaseConfig('') == null, 'empty is null');

let threw = false;
try { parseFirebaseConfig('hello'); } catch (e) { threw = true; }
assert(threw, 'garbage should throw');

console.log('All firebase config tests passed.');
