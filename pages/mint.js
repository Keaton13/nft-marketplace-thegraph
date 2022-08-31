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
    const chainString = chainId ? parseInt(chainId).toString() : "31337"
    const marketplaceAddress = networkMapping[chainString].NftMarketplace[0]
    const basicNftAddress = networkMapping[chainString].BasicNft[0]
    const dispatch = useNotification()

    const { runContractFunction } = useWeb3Contract()

    async function Mint() {
        console.log("Minting...")
        // const nftAddress = data.data[0].inputResult
        // const tokenId = data.data[1].inputResult
        // const price = ethers.utils.parseUnits(data.data[2].inputResult, "ether").toString()
        const approveOptions = {
            abi: nftAbi,
            contractAddress: basicNftAddress,
            functionName: "mintNft",
        }

        const tx = await runContractFunction({
            params: approveOptions,
            onError: (error) => {
                console.log(error)
            },
        })
        const txReciept = await tx.wait(1);
        handleMintSuccess(txReciept);
    }

    const handleMintSuccess = async (txReciept) => {
        console.log("Minting Success!!")
        console.log(txReciept)
        let tokenId = txReciept.events[0].args.tokenId
        let nftAddress = basicNftAddress
        approveAndList(nftAddress, tokenId)
        dispatch({
            type: "success",
            message: "NFT Minted!!",
            title: "NFT Minted",
            position: "topR",
        })
    }

    async function approveAndList(nftAddress, tokenId) {
        console.log("Approve and List")
        let price = ethers.utils.parseEther("0.1")
        const approveOptions = {
            abi: nftAbi,
            contractAddress: nftAddress,
            functionName: "approve",
            params: {
                to: marketplaceAddress,
                tokenId: tokenId,
            },
        }

        const tx2 = await runContractFunction({
            params: approveOptions,
            onSuccess: () => handleApproveSuccess(nftAddress, tokenId, price),
            onError: (error) => {
                console.log(error)
            },
        })
    }

    async function handleApproveSuccess(nftAddress, tokenId, price) {
        console.log("Ok! Now time to list")
        const listedOptions = {
            abi: nftMarketplaceAbi,
            contractAddress: marketplaceAddress,
            functionName: "listItem",
            params: {
                nftAddress: nftAddress,
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
        console.log("List Success!")
        dispatch({
            type: "success",
            message: "NFT listing",
            title: "NFT listed",
            position: "topR",
        })
    }

    return (
        <div className={styles.container}>
            <h2>Price</h2>
            <h3>0.01</h3>
            <button onClick={Mint}>MINT!</button>
            {/* <Form
                onSubmit={approveAndList}
                data={[
                    {
                        name: "NFT Address",
                        type: "text",
                        inputWidth: "50%",
                        value: "",
                        key: "nftAddress",
                    },
                    {
                        name: "Price (in ETH)",
                        type: "number",
                        value: "0.1",
                        key: "price",
                    },
                ]}
                title="Mint your NFT!"
                id="Main Form"
            /> */}
        </div>
    )
}
