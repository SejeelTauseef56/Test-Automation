const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// Define directories to scan for changes
const srcDir = path.resolve(__dirname, "../src");
const testsDir = path.resolve(__dirname, "../tests");

// Function to find all changed files (example: using git diff)
function getChangedFiles() {
  const result = execSync("git diff --name-only HEAD~1 HEAD").toString();
  return result.split("\n").filter((file) => file.endsWith(".js"));
}

// Example function to generate a simple test based on file name
function generateTestsForFile(filePath) {
  const fileName = path.basename(filePath, ".js");
  const testFilePath = path.resolve(testsDir, `${fileName}.test.js`);

  if (!fs.existsSync(testFilePath)) {
    // Create a simple test file
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
changedFiles.forEach((file) => {
  if (file.startsWith("src/")) {
    generateTestsForFile(file.replace("src/", ""));
  }
});
