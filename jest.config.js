// jest.config.js
// Sync object
/** @type {import('@jest/types').Config.InitialOptions} */
const config = {
    verbose: true,
    transformIgnorePatterns:  ["/node_modules/(?!esm-seedrandom)"],
    transform: {"^.+\\.mjs$": "babel-jest", "\\.[jt]sx?$": "babel-jest"},
    moduleFileExtensions: ["js", "json", "jsx", "node", "mjs"]

    
  };
  
  module.exports = config;
  
  // Or async function
  /*
  module.exports = async () => {
    return {
      verbose: true,
    };
  }
    */