#!/usr/bin/env node
// Copyright 2022-2023 SIL International
import { CommanderError, program } from 'commander';
import * as fv from './fv.js';
import * as fs from 'fs';
import require from './cjs-require.js';

////////////////////////////////////////////////////////////////////
// Get parameters
////////////////////////////////////////////////////////////////////
program
//  .version(version, '-v, --version', 'output the current version')
  .description("Utilities to compare kmp.json with keyboards.csv")
    .option("-c, --csv <path to keyboards.csv text file>", "path to keyboards.csv text file")
    .option("-j, --json <path to kmp.json", "path to kmp.json file")
    .exitOverride();
try {
  program.parse();
} catch (error: unknown) {
  if (error instanceof CommanderError) {
    console.error(error.message);
  }
  process.exit(1);
}

// Debugging parameters
const options = program.opts();
const debugMode = true;
if (debugMode) {
  console.log('Parameters:');
  if (options.csv) {
    console.log(`keyboards.csv path: "${options.csv}"`);
  }
  if (options.json) {
    console.log(`JSON file: "${options.json}"`);
  }
  console.log('\n');
}

// Check if csv/JSON files exists
if (options.csv && !fs.existsSync(options.csv)) {
  console.error("Can't open keyboards.csv text file " + options.csv);
  process.exit(1);
}
if (options.json && !fs.existsSync(options.json)) {
  console.error("Can't open kmp.json " + options.json);
  process.exit(1);
}

// Validate required parameters given
if (!options.csv && !options.json) {
  console.error("Need to pass another parameters <-c> <-j>");
  process.exit(1);
}

////////////////////////////////////////////////////////////////////
// Routing commands to functions
////////////////////////////////////////////////////////////////////

const csvText = fs.readFileSync(options.csv, 'utf-8');
const csv = convertCSV(csvText);
let kmp;
try {
  kmp = require(options.json);
} catch (e) {
  console.error("Invalid JSON file. Exiting")
  process.exit(1);
}

compareVersions(csv, kmp);

console.log('All done processing');

////////////////////////////////////////////////////////////////////
// Processor functions
////////////////////////////////////////////////////////////////////

function convertCSV(csvText: any) : fv.fvType[] {
  let f : fv.fvType[] = [];
  let lines = csvText.split('\n');
  // Discard header line
  lines = lines.splice(1);
  lines.forEach( l => {
    const  s = l.split(',');    
    let unit : fv.fvType = {
      Shortname : s[0],
      // ID : string; This is the key for the object
      Name: s[2],
      Region: s[3],
      Web_9_0_Keyboard : s[4],
      Version: s[5],
      LanguageID : s[6],
      LanguageName : s[7]
    }
    f[s[1]] = unit;
  });

  return f;

}

/**
 * Compare keyboard versions
 * @param {any} csv - Contents of keyboards.csv
 * @param {any} kmp - Contents of kmp.json
 */
function compareVersions(csv: any, kmp: any) {
  const keyboards = kmp.keyboards;
  console.log('id\tkeyboard.csv\tkmp.json');
  keyboards.forEach(k => {
    let id = k.id;
    if (!csv[id]) {
      console.error(`keyboards.csv doesn't contain ${id}`);
    } else {
      if (k.version != csv[id].Version) {
        console.error(`${id}\t${csv[id].Version}\t${k.version}`);
      }
    }
  });
}
