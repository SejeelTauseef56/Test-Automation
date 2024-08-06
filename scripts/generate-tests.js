const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const srcDir = path.resolve(__dirname, "../src");
const testsDir = path.resolve(__dirname, "../tests");

function getChangedFiles() {
  let changedFiles = [];
  try {
    const result = execSync("git diff --name-only HEAD~1 HEAD").toString();
    changedFiles = result.split("\n").filter((file) => file.endsWith(".js"));
  } catch (error) {
    console.log("Error getting changed files:", error.message);
    // Handle cases where there's no previous commit or other issues
    console.log("Fallback to getting all files");
    changedFiles = execSync("git ls-tree -r HEAD --name-only")
      .toString()
      .split("\n")
      .filter((file) => file.endsWith(".js"));
  }
  return changedFiles;
}

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
changedFiles.forEach((file) => {
  if (file.startsWith("src/")) {
    generateTestsForFile(file.replace("src/", ""));
  }
});
