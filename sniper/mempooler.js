import Web3 from 'web3'

const HMY_RPC_URL = "ws://10.0.0.173:9800";
const MAIN_RPC = "https://api.harmony.one";
const web3 = new Web3(HMY_RPC_URL);

import {createRequire} from "module";

const require = createRequire(import.meta.url); // construct the require method
const config = require("../etc/info.json") // use the require method
import InputDataDecoder from 'ethereum-input-data-decoder';

const decoder = new InputDataDecoder('../etc/SaleAuction.json');

const JEWEL_TO_BIGINT = 1000000000000000000;

import {bid} from "../modules/sniper_barrel.js"
import {get_hero} from "../modules/sniper_mag.js";

web3.eth.getBlockNumber().then(r => {
    console.log(r)
    listen();
})

function listen() {
    const subscription = web3.eth.subscribe('pendingTransactions', function (error, result) {
        if (error)
            console.log(error);
    })
    subscription.on("data", async function (transactionHash) {
        getTx(transactionHash);

    })
}

async function getTx(transactionHash) {
    web3.eth.getTransaction(transactionHash).then(r => {
        if (r !== null) {
            checkAuction(r, MAIN_RPC)
        }

    })
}


function checkAuction(transaction, rpc) {
    if (transaction.to !== null) {
        if (transaction.to.toString().toLowerCase() === '0x13a65b9f8039e2c032bc022171dc05b30c3f2892') {
            const result = decoder.decodeData(transaction.input);
            if (result.method === 'createAuction' && result.inputs[4] === '0000000000000000000000000000000000000000' && result.inputs[0].toString() > 6000) {

                get_hero(result.inputs[0].toString()).then(async hero => {
                    if (hero.profession === 'mining') {
                        console.log("________" + '\n heroID: '
                            + result.inputs[0].toString()
                            + '\n price: '
                            + (result.inputs[1].toString() / JEWEL_TO_BIGINT)
                            + '\n miner found in block ')
                        if (result.inputs[1].toString() / JEWEL_TO_BIGINT <= config.MINER_BUY_PRICE) {
                            await bid_loop(result, rpc,config.MINER_SALE_PRICE)
                        }
                        if (hero.class === "knight") {
                            console.log("Knight")
                            if (result.inputs[1].toString() / JEWEL_TO_BIGINT <= config.KNIGHT_BUY_PRICE) {
                                await bid_loop(result, rpc,config.KNIGHT_SALE_PRICE)
                            }
                        }
                    }
                })

            }
        }
    }
}

async function bid_loop(result, rpc,sell_price) {
    console.log('buying ...')
    for (let i = 0; i < 5; i++) {

        bid(result.inputs[0].toString(), result.inputs[1].toString(), rpc,sell_price).then(r => {
            console.log("harmony rpc" + r)
        })
        await new Promise(resolve => setTimeout(resolve, 1900));
    }
}




