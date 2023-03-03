import { useWeb3Contract, useMoralis } from "react-moralis";
import { contractAddresses, abi } from "../constants"; // folder will be good enough
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { useNotification } from "web3uikit";

export default function LotteryEntrance() {
    const { chainId: chainIdHex, isWeb3Enabled } = useMoralis(); // The chainId here is a hex, so we explicitly rename it
    const chainId = parseInt(chainIdHex);
    const lotteryAddress =
        chainId in contractAddresses ? contractAddresses[chainId][0] : null;
    // let entranceFee = "";  // we have to use state hook to get it rerendered
    const [entranceFee, setEntranceFee] = useState("0");

    // const { runContractFunction: enterLottery } = useWeb3Contract({
    //     abi: abi,
    //     contractAddress: lotteryAddress,
    //     functionName: "enterLottery",
    //     params: {},
    //     // msgValue:
    // });

    const { runContractFunction: getEntranceFee } = useWeb3Contract({
        abi: abi,
        contractAddress: lotteryAddress,
        functionName: "getEntranceFee",
        params: {},
    });

    useEffect(() => {
        if (isWeb3Enabled) {
            async function updateUI() {
                const entranceFeeFromCall = await getEntranceFee();
                setEntranceFee(ethers.utils.formatEther(entranceFeeFromCall));
            }
            updateUI();
        }
    }, [isWeb3Enabled]); // Header will enable it if it unenabled

    return (
        <div>
            Hi from LotteryEntrance<div>{entranceFee}</div>
        </div>
    );
}
