import React from "react";
import { useMoralis } from "react-moralis";
import { useEffect } from "react";

export default function ManualHeader() {
    let web3Enabled = true;
    const {
        enableWeb3,
        isWeb3Enabled,
        account,
        Moralis,
        deactivateWeb3,
        isWeb3EnableLoading,
    } = useMoralis();

    useEffect(() => {
        if (
            !isWeb3Enabled &&
            typeof window !== "undefined" &&
            window.localStorage.getItem("connected")
        ) {
            enableWeb3();
            // enableWeb3({provider: window.localStorage.getItem("connected")}) // add walletconnect
        }
    }, [isWeb3Enabled]);

    useEffect(() => {
        Moralis.onAccountChanged((newAccount) => {
            console.log(`Account changed to ${newAccount}`);
            if (newAccount == null) {
                // if it's null, we assumed it's disconnected
                window.localStorage.removeItem("connected");
                deactivateWeb3(); // set enableWeb3 to false
                console.log("Null account found");
            }
        });
        // onAccountChanged took the function as the parameter
    }, []);

    return (
        <div>
            {account ? (
                <div>
                    Conncted to {account.slice(0, 6)}...
                    {account.slice(length - 4)}
                </div>
            ) : (
                <button
                    onClick={async () => {
                        await enableWeb3();
                        if (typeof window !== "undefined") {
                            window.localStorage.setItem(
                                "connected",
                                "injected"
                            );
                        }
                    }}
                    disabled={isWeb3EnableLoading}
                >
                    Connect
                </button>
            )}
        </div>
    );
}
