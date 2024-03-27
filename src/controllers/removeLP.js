const assert = require('assert')

const {
    Token,
    LOOKUP_TABLE_CACHE,
    SPL_ACCOUNT_LAYOUT,
    buildSimpleTransaction,
    jsonInfo2PoolKeys,
    Liquidity,
    TOKEN_PROGRAM_ID,
    LiquidityPoolKeys,
    TxVersion,
    TokenAmount
} = require('@raydium-io/raydium-sdk')
const { Keypair, PublicKey, Connection } = require('@solana/web3.js')
const { buildAndSendTx, getWalletTokenAccount } = require('../functions/utils')
const fs = require('fs')
const path = require('path')
const assetsPath = path.join(__dirname, '..', 'assets')
const formatAmmKeysById = require('../functions/formatAmmKeysById')
const getAmmIdLpMint = require('../functions/getAmmID-LPMint')

const secret = JSON.parse(fs.readFileSync(`${assetsPath}/pk.json`))

const wallet = Keypair.fromSecretKey(Uint8Array.from(secret))

const makeTxVersion = TxVersion.V0

const connection = new Connection(process.env.RPC_URL)

async function ammRemoveLiquidity(input) {
    // -------- pre-action: fetch basic info --------
    const targetPoolInfo = await formatAmmKeysById(input.targetPool)
    console.log('done targetPoolInfo')
    assert(targetPoolInfo, 'cannot find the target pool')

    // -------- step 1: make instructions --------
    const poolKeys = jsonInfo2PoolKeys(targetPoolInfo)

    console.log('poolKeys')
    const removeLiquidityInstructionResponse =
        await Liquidity.makeRemoveLiquidityInstructionSimple({
            connection,
            poolKeys,
            userKeys: {
                owner: input.wallet.publicKey,
                payer: input.wallet.publicKey,
                tokenAccounts: input.walletTokenAccounts
            },
            amountIn: input.removeLpTokenAmount,
            makeTxVersion
        })

    console.log('done removeLiquidityInstructionResponse')

    return {
        txids: await buildAndSendTx(
            removeLiquidityInstructionResponse.innerTransactions
        )
    }
}
// const lpMint = 'CQurpF3WS3yEqFEt1Bu8s5zmZqznQG3EJkcYvsyg3sLc'
// const amount = 2118988
// const decimal = 6
// const lpname = 'WIF-SOL'

const newLPToken = (lpMint, decimal, lpName) => {
    const token = new Token(
        TOKEN_PROGRAM_ID,
        new PublicKey(lpMint),
        decimal,
        lpName,
        lpName
    )
    return token
}
const removeLP = async (req, res) => {
    try {
        const { ca, amount, decimal, lpName } = req.body
        const AmmIdLPMint = await getAmmIdLpMint(ca)

        const { ammId, lpMint } = AmmIdLPMint

        const lpToken = newLPToken(lpMint, decimal, lpName)

        console.log('Dont lpToken')
        const removeLpTokenAmount = new TokenAmount(lpToken, amount)
        console.log('done removeLPTokenAmount')
        const targetPool = ammId
        console.log('done targetPool')
        const walletTokenAccounts = await getWalletTokenAccount(
            connection,
            wallet.publicKey
        )
        console.log('Done walletTokenAccounts')

        try {
            const { txids } = await ammRemoveLiquidity({
                removeLpTokenAmount,
                targetPool,
                walletTokenAccounts,
                wallet: wallet
            })

            console.log('txids', txids)
            res.send({
                'Liquidity removal tx:': txids
            })
        } catch (innerError) {
            console.error(innerError)
            res.send({ 'removal error': innerError })
        }
    } catch (error) {
        res.send({ 'failed ': error })
    }
}

module.exports = removeLP
