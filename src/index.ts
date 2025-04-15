#!/usr/bin/env node

import path from "path";
import os from "os";
import fs from "fs";

import { program } from "commander";
import AdmZip from "adm-zip";
import chalk from "chalk";
import { Change, diffLines } from "diff";

enum ErrorMessages {
  NO_ARGS = "Please provide paths to both files",
  NOT_ZIP = "Error happened, please check if paths lead to zip files",
}

function stopScriptSuccess() {
  process.exit(0);
}

function stopScriptError() {
  process.exit(1);
}

function logDiff(diff: Change[]) {
  const now = Date.now();
  const userHomeDir = os.homedir();
  const diffPath = `${userHomeDir}/${now}-diff.txt`;

  console.log(chalk.yellow(`Content diff will be stored in ${diffPath}`));

  let content = ``;

  for (const change of diff) {
    if (change.added) {
      content += `+++ ${change.value}\n`;
    } else if (change.removed) {
      content += `--- ${change.value}\n`;
    } else {
      content += `${change.value}\n`;
    }
  }

  fs.writeFileSync(diffPath, content);
}

// function clearLastLine() {
//   process.stdout.write('\x1b[1A');
//   process.stdout.write('\x1b[2K');
// }

program
  .option("-a, --a <string>", "path to file 'a'")
  .option("-b, --b <string>", "path to file 'b'")

program.parse();

const options = program.opts();

const { a, b } = options;

if (!a || !b) {
  console.error(ErrorMessages.NO_ARGS);
  stopScriptError();
}

const aPath = path.resolve(a);
const bPath = path.resolve(b);

let aZip = null;
let bZip = null;

try {
  aZip = new AdmZip(aPath);
  bZip = new AdmZip(bPath);
} catch (error) {
  console.error(ErrorMessages.NOT_ZIP);
  stopScriptError();
}

const aZipEntries = aZip?.getEntries() ?? [];
const bZipEntries = bZip?.getEntries() ?? [];

console.log(chalk.blue(`Found ${aZipEntries.length} entries in ${aPath}`));
console.log(chalk.blue(`Found ${bZipEntries.length} entries in ${bPath}`));

const aZipEntriesByName = new Map<string, string>();

for (const aZipEntry of aZipEntries) {
  aZipEntriesByName.set(aZipEntry.entryName, aZipEntry.entryName);
}

for (const bZipEntry of bZipEntries) {
  if (aZipEntriesByName.has(bZipEntry.entryName)) {
    console.log(chalk.green(`Found match by name:`), chalk.bgGreen(bZipEntry.entryName));

    const matchedName = bZipEntry.entryName;
    const aZipEntryData = aZip?.readAsText(matchedName);
    const bZipEntryData = bZip?.readAsText(matchedName);

    const match = aZipEntryData === bZipEntryData;

    if (match) {
      console.log(chalk.bgGreen((`Found exact match: ${matchedName}`)));
      stopScriptSuccess();
    } else {
      console.log(chalk.red(`Content didn't match:`), chalk.bgRed(matchedName));
      const diff = diffLines(aZipEntryData!, bZipEntryData!);
      logDiff(diff);
    }
  }
}

console.log(chalk.yellow("No exact matches found"));
stopScriptError();
