/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.9",
    defaultNetwork: "mumbai",
    networks: {
      hardhat: {},
      mumbai: {
        url: "https://rpc.ankr.com/polygon_mumbai",
        accounts: [`0x294b3b84b314dd3d133d0c7847c4a4547408609a923fb5634eac247e5f674a1e`],
      },
    },
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
};
