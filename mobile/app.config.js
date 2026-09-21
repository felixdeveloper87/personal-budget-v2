const fs = require("node:fs");
const path = require("node:path");

function readRootEnvironmentValue(name) {
  try {
    const environmentPath = path.resolve(__dirname, "..", ".env");
    const contents = fs.readFileSync(environmentPath, "utf8");
    const line = contents
      .split(/\r?\n/)
      .find((entry) => entry.trimStart().startsWith(`${name}=`));

    if (!line) return undefined;
    const value = line.slice(line.indexOf("=") + 1).trim();
    return value.replace(/^(['"])(.*)\1$/, "$2") || undefined;
  } catch {
    return undefined;
  }
}

module.exports = ({ config }) => ({
  ...config,
  extra: {
    ...config.extra,
    logoDevToken:
      process.env.EXPO_PUBLIC_LOGO_DEV_TOKEN ||
      readRootEnvironmentValue("VITE_LOGO_DEV_TOKEN"),
  },
});
