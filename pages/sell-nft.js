import Head from "next/head"
import Image from "next/image"
import styles from "../styles/Home.module.css"
import { Form, useNotification } from "web3uikit"
import { useMoralis, useWeb3Contract } from "react-moralis"
import { ethers } from "ethers"
import nftAbi from "../constants/BasicNft.json"
import nftMarketplaceAbi from "../constants/NftMarketplace.json"
import networkMapping from "../constants/networkMapping.json"

export default function Home() {
    const { chainId } = useMoralis()
    // 0x234
    const chainString = "5"
    const marketplaceAddress = networkMapping[chainString].NftMarketplace[0]
    const basicNftAddress = networkMapping[chainString].BasicNft[0]
    const dispatch = useNotification()

    const { runContractFunction } = useWeb3Contract()

    async function approveAndList(data) {
        console.log("Approving...")
        console.log(data)
        const tokenId = data.data[0].inputResult
        const price = ethers.utils.parseUnits(data.data[1].inputResult, "ether").toString()

        const approveOptions = {
            abi: nftAbi,
            contractAddress: basicNftAddress,
            functionName: "approve",
            params: {
                to: marketplaceAddress,
                tokenId: tokenId,
            },
        }

        await runContractFunction({
            params: approveOptions,
            onSuccess: () => handleApproveSuccess(basicNftAddress, tokenId, price),
            onError: (error) => {
                console.log(error)
            },
        })
    }

    async function handleApproveSuccess(basicNftAddress, tokenId, price) {
        console.log("Ok! Now time to list")
        const listedOptions = {
            abi: nftMarketplaceAbi,
            contractAddress: marketplaceAddress,
            functionName: "listItem",
            params: {
                nftAddress: basicNftAddress,
                tokenId: tokenId,
                price: price,
            },
        }

        await runContractFunction({
            params: listedOptions,
            onSuccess: () => handleListSuccess(),
            onError: (error) => console.log(error),
        })
    }

    async function handleListSuccess() {
        dispatch({
            type: "success",
            message: "NFT listing",
            title: "NFT listed",
            position: "topR",
        })
    }

    return (
        <div className="grid grid-cols-3 gap-4 content-center mt-6">
            <div class="relative w-96 h-96 ..."></div>
            <div class="relative w-96 h-96 ...">
                <Form
                    onSubmit={approveAndList}
                    data={[
                        {
                            name: "Token ID",
                            type: "number",
                            value: "",
                            key: "tokenId",
                        },
                        {
                            name: "Price (in ETH)",
                            type: "number",
                            value: "",
                            key: "price",
                        },
                    ]}
                    title="Sell your NFT!"
                    id="Main Form"
                />
            </div>
            <div class="relative w-96 h-96 ..."></div>
        </div>
    )
}
