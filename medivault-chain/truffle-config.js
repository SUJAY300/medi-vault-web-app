module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",
      port: 7545,        // same as Ganache CLI above
      network_id: "5777" // same as chainId
    },
  },

  compilers: {
    solc: {
      version: "0.8.19",
      settings: { 
        optimizer: { enabled: true, runs: 200 },
        evmVersion: "istanbul"
      }
    }
  }
};
