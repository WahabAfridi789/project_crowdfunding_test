import React, { useContext, createContext, useEffect, useState } from "react";
import { ThirdwebSDK } from "@thirdweb-dev/sdk";
import {
  useAddress,
  useContract,
  useMetamask,
  useContractWrite,
} from "@thirdweb-dev/react";
// import { MetaMaskWallet } from "@thirdweb-dev/wallets";
import { ethers } from "ethers";
import { EditionMetadataWithOwnerOutputSchema } from "@thirdweb-dev/sdk";

const StateContext = createContext();

export const StateContextProvider = ({ children }) => {
  const [contract, setContract] = useState(null);

  useEffect(() => {
    const initializeContract = async () => {
      const sdk = new ThirdwebSDK("mumbai", {
        clientId: "525bfa30b9cc1c870ee899f8113f3e95",
      });

      const contract = await sdk.getContract(
        "0x792dE6bBDf3853cf02C38DF58e0EE549d06ffF96"
      );

      setContract(contract);
    };

    initializeContract();
  }, []); // Empty dependency array ensures the effect runs only once

  // const { contract } = useContract(
  //   "0x6dcBa79150fD14E4A6b99b6014d9BC28453493C1"
  // );

  // Connect to the Mumbai network via MetaMask
  const provider = new ethers.providers.Web3Provider(window.ethereum);

  // Get the signer from MetaMask
  const signer = provider.getSigner();

  console.log("signer: ", signer);

  const { mutateAsync: createCampaign } = useContractWrite(
    contract,
    "createCampaign",
    {
      signer: signer, // Pass the signer here
    }
  );

  const connect = useMetamask();
  const address = useAddress();

  const publishCampaign = async (form) => {
    try {
      const data = await createCampaign({
        args: [
          address, // owner
          form.title, // title
          form.description, // description
          form.target,
          new Date(form.deadline).getTime(), // deadline,
          form.image,
        ],
      });

      console.log("contract call success", data);
    } catch (error) {
      console.log("contract call failure", error);
    }
  };

  const getCampaigns = async () => {
    const campaigns = await contract.call("getCampaigns");

    const parsedCampaings = campaigns.map((campaign, i) => ({
      owner: campaign.owner,
      title: campaign.title,
      description: campaign.description,
      target: ethers.utils.formatEther(campaign.target.toString()),
      deadline: campaign.deadline.toNumber(),
      amountCollected: ethers.utils.formatEther(
        campaign.amountCollected.toString()
      ),
      image: campaign.image,
      pId: i,
    }));

    return parsedCampaings;
  };

  const getUserCampaigns = async () => {
    const allCampaigns = await getCampaigns();

    const filteredCampaigns = allCampaigns.filter(
      (campaign) => campaign.owner === address
    );

    return filteredCampaigns;
  };

  const donate = async (pId, amount) => {
    const data = await contract.call("donateToCampaign", [pId], {
      value: ethers.utils.parseEther(amount),
    });

    return data;
  };

  const getDonations = async (pId) => {
    const donations = await contract.call("getDonators", [pId]);
    const numberOfDonations = donations[0].length;

    const parsedDonations = [];

    for (let i = 0; i < numberOfDonations; i++) {
      parsedDonations.push({
        donator: donations[0][i],
        donation: ethers.utils.formatEther(donations[1][i].toString()),
      });
    }

    return parsedDonations;
  };

  return (
    <StateContext.Provider
      value={{
        address,
        contract,
        connect,
        createCampaign: publishCampaign,
        getCampaigns,
        getUserCampaigns,
        donate,
        getDonations,
      }}
    >
      {children}
    </StateContext.Provider>
  );
};

export const useStateContext = () => useContext(StateContext);
