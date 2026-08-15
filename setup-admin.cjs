const fs = require("fs");
const { execFileSync } = require("child_process");

const args = JSON.parse(fs.readFileSync("./adminArgs.json", "utf8"));

const json = JSON.stringify(args);

console.log("Running admin setup...");
console.log("Email:", args.email);

try {
  const output = execFileSync(
    "npx.cmd",
    ["convex", "run", "admin:setupAdmin", json],
    {
      encoding: "utf8",
      stdio: ["inherit", "pipe", "pipe"],
    }
  );

  console.log(output);
} catch (error) {
  console.error("CONVEX ERROR:");

  if (error.stdout) {
    console.error(error.stdout.toString());
  }

  if (error.stderr) {
    console.error(error.stderr.toString());
  }

  console.error(error.message);

  process.exit(1);
}
