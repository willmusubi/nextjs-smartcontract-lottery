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
    const [numPlayers, setNumPlayers] = useState("0");
    const [recentWinner, setRecentWinner] = useState("0");

    const dispatch = useNotification();

    const { runContractFunction: enterLottery } = useWeb3Contract({
        abi: abi,
        contractAddress: lotteryAddress,
        functionName: "enterLottery",
        params: {},
        msgValue: entranceFee,
    });

    const { runContractFunction: getEntranceFee } = useWeb3Contract({
        abi: abi,
        contractAddress: lotteryAddress,
        functionName: "getEntranceFee",
        params: {},
    });

    const { runContractFunction: getNumPlayers } = useWeb3Contract({
        abi: abi,
        contractAddress: lotteryAddress,
        functionName: "getNumPlayers",
        params: {},
    });

    const { runContractFunction: getRecentWinner } = useWeb3Contract({
        abi: abi,
        contractAddress: lotteryAddress,
        functionName: "getRecentWinner",
        params: {},
    });

    async function updateUI() {
        setEntranceFee((await getEntranceFee()).toString());
        setNumPlayers((await getNumPlayers()).toString());
        setRecentWinner((await getRecentWinner()).toString());
    }

    useEffect(() => {
        if (isWeb3Enabled) {
            updateUI();
        }
    }, [isWeb3Enabled]); // Header will enable it if it unenabled

    const handleSuccess = async function (tx) {
        await tx.wait(1);
        handleNewNotification(tx);
        updateUI(); // make it automatically update after enter lottery call success
    };

    const handleNewNotification = () => {
        dispatch({
            type: "info",
            message: "Transaction Complete",
            title: "Tx Notification",
            position: "topR",
            icon: "bell",
        });
    };

    return (
        <div>
            {lotteryAddress ? (
                <div>
                    <button
                        onClick={async () => {
                            const tx = await enterLottery({
                                // onComplete:
                                // onError:
                                onSuccess: handleSuccess, // once the transaction is successfully confirmed, call handleSuccess, so we need to wait for one block to use handleSuccess
                                onError: (error) => console.log(error), // it's good add it for any runContractFunctions to know if something breaks
                            });
                            const filter = { transactionHash: tx };
                        }}
                    >
                        Enter Lottery
                    </button>
                    Entrance Fee: {ethers.utils.formatEther(entranceFee)} Ether
                    Players: {numPlayers}
                    Recent Winner: {recentWinner}
                </div>
            ) : (
                <div>
                    No Lottery Address Detected, Please try switch the network
                </div>
            )}
        </div>
    );
}
