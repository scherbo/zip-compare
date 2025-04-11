#!/usr/bin/env node

import { program } from "commander";
import AdmZip from "adm-zip";
import chalk from "chalk";
import { Change, diffLines } from "diff";
import path from "path";

function stopScriptSuccess() {
  process.exit(0);
}

function stopScriptError() {
  process.exit(1);
}

function printDiff(diff: Change[]) {
  console.log(chalk.yellow("Content diff:"));
  for (const change of diff) {
    if (change.added) {
      console.log(chalk.green(change.value));
    } else if (change.removed) {
      console.log(chalk.red(change.value));
    } else {
      console.log(change.value);
    }
  }
}

program
  .option("-a, --a <string>", "path to file 'a'")
  .option("-b, --b <string>", "path to file 'b'")

program.parse();

const options = program.opts();

const { a, b } = options;

if (!a || !b) {
  console.error("Please provide paths to both files");
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
  console.error("Error happened, please check if paths lead to zip files");
  stopScriptError();
}

const aZipEntries = aZip?.getEntries() ?? [];
const bZipEntries = bZip?.getEntries() ?? [];

for (const aZipEntry of aZipEntries) {
  for (const bZipEntry of bZipEntries) {
    if (aZipEntry.entryName === bZipEntry.entryName) {
      console.log(chalk.blue(`Found match by name:`), chalk.bgBlue(aZipEntry.entryName));

      const aZipEntryData = aZip?.readAsText(aZipEntry.entryName);
      const bZipEntryData = bZip?.readAsText(bZipEntry.entryName);

      const match = aZipEntryData === bZipEntryData;

      if (match) {
        console.log(chalk.bgGreen((`Found exact match: ${aZipEntry.entryName}`)));
        stopScriptSuccess();
      } else {
        console.log(chalk.red(`Content didn't match:`), chalk.bgRed(aZipEntry.entryName));
        const diff = diffLines(aZipEntryData!, bZipEntryData!);
        printDiff(diff);
      }
    }
  }
}

console.log(chalk.yellow("No exact matches found, please try other zip files"));
stopScriptError();
