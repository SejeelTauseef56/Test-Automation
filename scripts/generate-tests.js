const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const srcDir = path.resolve(__dirname, "../src");
const testsDir = path.resolve(__dirname, "../tests");
const coverageDir = path.resolve(__dirname, "../coverage");

// Get the list of changed files
function getChangedFiles() {
  let changedFiles = [];
  try {
    // Fetch the latest changes
    execSync("git fetch origin");
    const result = execSync("git diff --name-only HEAD~1 HEAD").toString();
    changedFiles = result
      .split("\n")
      .filter((file) => file.endsWith(".js") && file.startsWith("src/"));
    console.log("Changed files:", changedFiles);
  } catch (error) {
    console.error("Error getting changed files:", error.message);
  }
  return changedFiles;
}

// Get coverage data from Jest
function getCoverage() {
  let coverage = {};
  try {
    execSync("npx jest --coverage");
    const coverageData = fs.readFileSync(
      path.join(coverageDir, "coverage-final.json"),
      "utf8"
    );
    coverage = JSON.parse(coverageData);
  } catch (error) {
    console.error("Error collecting coverage:", error.message);
  }
  return coverage;
}

// Check if a file is covered
function isCovered(file, coverage) {
  const filePath = path.relative(srcDir, file);
  return coverage[filePath] && coverage[filePath].statements.pct > 0;
}

// Generate a test file if it doesn't exist
function generateTestsForFile(filePath) {
  const fileName = path.basename(filePath, ".js");
  const testFilePath = path.resolve(testsDir, `${fileName}.test.js`);

  if (!fs.existsSync(testFilePath)) {
    const testContent = `
    const { ${fileName} } = require('../src/${fileName}');

    test('${fileName} function', () => {
      // Example test
      expect(${fileName}()).toBeDefined();
    });
    `;

    fs.writeFileSync(testFilePath, testContent.trim());
    console.log(`Generated test for ${fileName}`);
  } else {
    console.log(`Test already exists for ${fileName}`);
  }
}

// Main script execution
const changedFiles = getChangedFiles();
const coverage = getCoverage();

changedFiles.forEach((file) => {
  if (!isCovered(file, coverage)) {
    generateTestsForFile(file.replace("src/", ""));
  }
});
