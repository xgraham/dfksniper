import twilio from "twilio";
import {ethers} from "ethers";
import { createRequire } from "module";

const accountSid = 'AC73333835c215e228de85e1dbef29e41f';
const authToken = 'bf362836899e7cb762f270d6b42d6ca3';
const my_address = '0x577c359D434A07a09f649D10c645F1c2fA5E5CB4'
const auctionAddress = '0x13a65b9f8039e2c032bc022171dc05b30c3f2892'

const require = createRequire(import.meta.url); // construct the require method
const config = require("../etc/info.json") // use the require method
const kp = require("../etc/kp.json") // use the require method
const abi = require('../etc/SaleAuction.json')

const SELL_PRICE = config.sellPrice;
const words = kp.kpp;
const callOptions = {gasPrice: config.gwei, gasLimit: config.gas_limit};

//RPC is a url
export async function bid(tokenId, price,rpc) {
    const provider = new ethers.providers.JsonRpcProvider(rpc)
    let decryptedWallet = ethers.Wallet.fromMnemonic(words).connect(provider)
    const auctionContract = new ethers.Contract(auctionAddress, abi, provider)
    const result =  await tryTransaction(() => auctionContract.connect(decryptedWallet).bid(tokenId, String(price)
        , callOptions), 3)
    if (result !== 0 ){

        const text_msg = "Bought hero: " + String(tokenId) + ", for " + String(price) + "J  "
        sendText(text_msg)
        await list(tokenId,price,provider)
    }
    return result;
}

async function list(tokenId, buyPrice,decryptedWallet) {

    await new Promise(resolve => setTimeout(resolve, 11000));
    let human_price = SELL_PRICE / config.SATS_PER_JEWEL
    sendText("Listing for "+human_price.toString())
    if (SELL_PRICE < buyPrice){
        sendText("Can you fix listing api already?!?!")
        throw new Error("you fuck up the fucking sell price you idiot but at least this error is here to save your ass");

    }
    else if(SELL_PRICE>buyPrice) {
        const auctionContract = new ethers.Contract(auctionAddress, abi, provider)
        let result = await tryTransaction(() => auctionContract.connect(decryptedWallet).createAuction(tokenId, String(sale_price), String(sale_price), '60', '0x0000000000000000000000000000000000000000'
            , callOptions), 5).then(r => {
            if (r !== 0) {
                //
                sendText("Listed hero: " + String(tokenId) + ", for " + String(SELL_PRICE))
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




function sendText(body){
    const client = new twilio(accountSid, authToken);
    client.messages
        .create({
            body: body,
            messagingServiceSid: 'MGe3797d9c84c3016e9f0fd4f7d5949b15',
            to: '+17039801908'
        })
        .then(message => console.log(message.sid))
        .done();
}
