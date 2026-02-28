// metro.config.js (important for monorepo setups)
const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const projectRoot = __dirname;
const config = getDefaultConfig(projectRoot);

// Ensure Metro resolves dependencies correctly when nested in /apps/mobile
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
];

module.exports = config;
