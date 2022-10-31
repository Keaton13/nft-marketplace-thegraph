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
    console.log(chainString);
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
        const txReciept = await tx.wait(1)
        handleMintSuccess(txReciept)
    }

    const handleMintSuccess = async (txReciept) => {
        console.log("Minting Success!!")
        console.log(txReciept)
        let tokenId = txReciept.events[0].args.tokenId
        approveAndList(basicNftAddress, tokenId)
        dispatch({
            type: "success",
            message: "NFT Minted!!",
            title: "NFT Minted",
            position: "topR",
        })
    }

    async function approveAndList(basicNftAddress, tokenId) {
        console.log("Approving...")
        let price = "100000000000000000"
        tokenId = ethers.BigNumber.from(tokenId._hex)
        console.log(price)
        console.log(tokenId)
        const approveOptions = {
            abi: nftAbi,
            contractAddress: basicNftAddress,
            functionName: "approve",
            params: {
                to: marketplaceAddress,
                tokenId: tokenId,
            },
        }

        const tx2 = await runContractFunction({
            params: approveOptions,
            onSuccess: () => handleApproveSuccess(basicNftAddress, tokenId, price),
            onError: (error) => {
                console.log(error)
            },
        })
    }

    async function handleApproveSuccess(basicNftAddress, tokenId, price) {
        console.log("Ok! Now time to list")
        console.log(basicNftAddress, tokenId, price)
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
        console.log("List Success!")
        dispatch({
            type: "success",
            message: "NFT listing",
            title: "NFT listed",
            position: "topR",
        })
    }

    return (
        <div className="grid grid-cols-3 gap-4 content-center mt-6">
            <div class="relative w-96 h-96 ...">
            </div>
            <div className="relative h-96 w-96 content center text-center bg-slate-100 shadow-2xl rounded-xl text-neutral-500 ...">
                <div class="absolute inset-x-0 top-0 h-16 font-bold text-3xl ...">
                    <h3 className="mt-6">Mint Your NFT</h3>
                    <h5 className="mt-6 underline underline-offset-8 text-xl">Price: 0.01 eth</h5>
                    <button className="rounded-xl text-center mt-6 h-12 text-base w-36 shadow-2xl bg-cyan-400" onClick={Mint}>Mint!</button>
                </div>
            </div>
            <div className="relative h-96 w-96 ...">
            </div>
        </div>
    )
}
