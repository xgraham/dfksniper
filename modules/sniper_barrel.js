import twilio from "twilio";
import {ethers} from "ethers";
import { createRequire } from "module";
import {sendText} from "../etc/util.js";

const require = createRequire(import.meta.url); // construct the require method
const auctionAddress = '0x13a65b9f8039e2c032bc022171dc05b30c3f2892'

const kp = require("../etc/kp.json") // use the require method
const abi = require('../etc/SaleAuction.json')
const config = require('../etc/info.json')

const WORDS = kp.kpp;
const callOptions = {gasPrice: config.gwei, gasLimit: config.gas_limit};


//RPC is a url
export async function bid(tokenId, price,rpc,sell_price) {
    const provider = new ethers.providers.JsonRpcProvider(rpc)
    let decryptedWallet = ethers.Wallet.fromMnemonic(WORDS).connect(provider)
    const auctionContract = new ethers.Contract(auctionAddress, abi, provider)
    const result =  await tryTransaction(() => auctionContract.connect(decryptedWallet).bid(tokenId, String(price)
        , callOptions), 3)
    if (result !== 0 ){

        const text_msg = "Bought hero: " + String(tokenId) + ", for " + String(price) + "J  from mempool"
        sendText(text_msg)
        await list(tokenId,price,decryptedWallet,provider,sell_price)
    }
    return result;
}

async function list(tokenId, buyPrice,decryptedWallet,provider, sell_price) {

    await new Promise(resolve => setTimeout(resolve, 11000));
    let human_price = sell_price / config.SATS_PER_JEWEL
    sendText("Listing for "+human_price.toString())
    if (sell_price < buyPrice){
        throw new Error("Sale price lower than buy price");

    }
    else if(sell_price>buyPrice) {

        const auctionContract = new ethers.Contract(auctionAddress, abi, provider)
        let result = await tryTransaction(() => auctionContract.connect(decryptedWallet).createAuction(tokenId, String(sale_price), String(sale_price), '60', '0x0000000000000000000000000000000000000000'
            , callOptions), 5).then(r => {
            if (r !== 0) {
                //
                sendText("Listed hero: " + String(tokenId) + ", for " + String(sell_price))
            } else {
                console.log("listing error?\n")
            }
        })
        return result;
    }


}

async function tryTransaction(transaction, attempts) {
    for (let i = 0; i < attempts; i++) {
        try {
            const tx = await transaction()
            let receipt = await tx.wait()
            if (receipt.status !== 1) {
                console.log(`Receipt had a status of ${receipt.status}`)
            }
            return receipt
        } catch (err) {
            console.log(err)
            console.log('Failed to buy\n')
            return 0;
        }
    }
}


