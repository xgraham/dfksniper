import twilio from "twilio";
import {ethers} from "ethers";
import { createRequire } from "module";
import {sendText} from "../etc/util.js";
const my_address = '0x577c359D434A07a09f649D10c645F1c2fA5E5CB4'

const require = createRequire(import.meta.url); // construct the require method

const abi = require('../etc/SaleAuction.json')

const RPC_URL = "http://10.0.0.173:9500";

const provider = new ethers.providers.JsonRpcProvider(RPC_URL)
let my_auctions;


getUserAuctions(0,false).then(r => {
    let result = String(r);
    my_auctions = result.split(',')
    getUserAuctions(30, true).then(r => {
        result = String(r);
        my_auctions = result.split(',')
    });
});

//delay in seconds
async function getUserAuctions(delay,repeat) {
    let heroPrice;
    if(repeat) {
        while(true) {
            await new Promise(resolve => setTimeout(resolve, delay * 1000));

            const provider = new ethers.providers.JsonRpcProvider(getRpc())
            const auctionAddress = '0x13a65b9f8039e2c032bc022171dc05b30c3f2892'
            const auctionContract = new ethers.Contract(auctionAddress, abi, provider)
            try {
                let hero_arr  = await auctionContract.getUserAuctions(my_address);
                console.clear();
                console.log(String(hero_arr).split(','))
                if(hero_arr.length < my_auctions.length){
                    let difference = my_auctions.filter(x => !hero_arr.includes(x));

                    my_auctions = String(hero_arr).split(',')
                    console.log("my hero sold")
                    const text_msg = "A hero sold," + difference.toString();
                    sendText(text_msg)

                }
                my_auctions = hero_arr
            } catch (e) {
                console.log(e)
                await new Promise(resolve => setTimeout(resolve, delay * 1000));
            }
        }
    }
    else{
        await new Promise(resolve => setTimeout(resolve, delay * 1000));

        const provider = new ethers.providers.JsonRpcProvider(getRpc())
        const auctionAddress = '0x13a65b9f8039e2c032bc022171dc05b30c3f2892'
        const auctionContract = new ethers.Contract(auctionAddress, abi, provider)
        try {
            heroPrice = await auctionContract.getUserAuctions(my_address);
            console.log("my auctions "  )
            console.log(String(heroPrice).split(','));
            my_auctions = heroPrice;
        } catch (e) {
            console.log('error probably rpc timeout')
        }
    }
    return heroPrice;

}


function getRpc() {
    return RPC_URL;
}




