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

    const {
        runContractFunction: enterLottery,
        isLoading,
        isFetching,
    } = useWeb3Contract({
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
        <div className="p-5">
            <h1 className="py-4 px-4 font-bold text-3xl">Musubi Lottery</h1>
            {lotteryAddress ? (
                <div className="">
                    <button
                        className="bg-purple-400 hover:bg-purple-500 text-white font-bold py-2 px-4 rounded ml-4"
                        onClick={async () => {
                            const tx = await enterLottery({
                                // onComplete:
                                // onError:
                                onSuccess: handleSuccess, // once the transaction is successfully confirmed, call handleSuccess, so we need to wait for one block to use handleSuccess
                                onError: (error) => console.log(error), // it's good add it for any runContractFunctions to know if something breaks
                            });
                            const filter = { transactionHash: tx };
                        }}
                        disabled={isLoading || isFetching} // to make the button unclickable when interact with wallet and chains
                    >
                        {isLoading || isFetching ? (
                            <div className="animate-spin spinner-border h-6 w-24 border-b-2 rounded-full"></div>
                        ) : (
                            "Enter Lottery"
                        )}
                    </button>
                    <div className="py-1 px-4 mt-4">
                        Entrance Fee: {ethers.utils.formatEther(entranceFee)}{" "}
                        Ether
                    </div>
                    <div className="py-1 px-4">Players: {numPlayers}</div>
                    <div className="py-1 px-4">
                        Recent Winner: {recentWinner}
                    </div>
                </div>
            ) : (
                <div>
                    No Lottery Address Detected, Please try switch the network
                </div>
            )}
        </div>
    );
}
