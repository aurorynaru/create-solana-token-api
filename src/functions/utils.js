const {
    LOOKUP_TABLE_CACHE,
    buildSimpleTransaction,
    findProgramAddress,
    SPL_ACCOUNT_LAYOUT,
    TOKEN_PROGRAM_ID,
    TokenAccount,
    TxVersion
} = require('@raydium-io/raydium-sdk')
const {
    Connection,
    Keypair,
    PublicKey,
    SendOptions,
    Signer,
    Transaction,
    VersionedTransaction
} = require('@solana/web3.js')
const fs = require('fs')
const path = require('path')
const assetsPath = path.join(__dirname, '..', 'assets')

const secret = JSON.parse(fs.readFileSync(`${assetsPath}/pk.json`))

const wallet = Keypair.fromSecretKey(Uint8Array.from(secret))

const makeTxVersion = TxVersion.V0

const connection = new Connection(process.env.RPC_URL)

const addLookupTableInfo = LOOKUP_TABLE_CACHE

async function sendTx(connection, payer, txs, options) {
    const txids = []
    for (const iTx of txs) {
        if (iTx instanceof VersionedTransaction) {
            iTx.sign([payer])
            txids.push(await connection.sendTransaction(iTx, options))
        } else {
            txids.push(await connection.sendTransaction(iTx, [payer], options))
        }
    }
    return txids
}

async function getWalletTokenAccount(connection, wallet) {
    const walletTokenAccount = await connection.getTokenAccountsByOwner(
        wallet,
        {
            programId: TOKEN_PROGRAM_ID
        }
    )
    console.log(walletTokenAccount)
    return walletTokenAccount.value.map((i) => ({
        pubkey: i.pubkey,
        programId: i.account.owner,
        accountInfo: SPL_ACCOUNT_LAYOUT.decode(i.account.data)
    }))
}

async function buildAndSendTx(innerSimpleV0Transaction, options) {
    const willSendTx = await buildSimpleTransaction({
        connection,
        makeTxVersion,
        payer: wallet.publicKey,
        innerTransactions: innerSimpleV0Transaction,
        addLookupTableInfo: addLookupTableInfo
    })

    return await sendTx(connection, wallet, willSendTx, options)
}

function getATAAddress(programId, owner, mint) {
    const { publicKey, nonce } = findProgramAddress(
        [owner.toBuffer(), programId.toBuffer(), mint.toBuffer()],
        new PublicKey('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL')
    )
    return { publicKey, nonce }
}

async function sleepTime(ms) {
    console.log(new Date().toLocaleString(), 'sleepTime', ms)
    return new Promise((resolve) => setTimeout(resolve, ms))
}

// Exporting the functions
module.exports = {
    sendTx,
    getWalletTokenAccount,
    buildAndSendTx,
    getATAAddress,
    sleepTime
}
