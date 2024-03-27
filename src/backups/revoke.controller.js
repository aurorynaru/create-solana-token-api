const {
    clusterApiUrl,
    Connection,
    PublicKey,
    Keypair
} = require('@solana/web3.js')
const { AuthorityType, setAuthority } = require('@solana/spl-token')
const bs58 = require('bs58')
const fs = require('fs')

const clusterUrls = {
    mainnet: 'mainnet-beta',
    devnet: 'devnet'
}

const RevokeToken = async () => {
    const connection = new Connection(
        clusterApiUrl(clusterUrls[process.env.NODE_ENV]),
        'confirmed'
    )

    const secret = JSON.parse(
        fs.readFileSync('C:/Users/juara/Desktop/testcoin/newpk.json')
    )

    // const dep = JSON.parse(
    //     fs.readFileSync('C:/Users/juara/Desktop/SPL/secret.json')
    // )

    const feePayer = Keypair.fromSecretKey(Uint8Array.from(secret))

    const mintPubkey = new PublicKey(
        '8iBWst8bqQGtQmo2xbcJESHLLu2sfRKqGb91ssWmKW4r'
    )

    const newM = new PublicKey('11111111111111111111111111111111')

    const tokenAccount = new PublicKey(
        '4hVEQJ1Y3XSq5djGLe2tYkUS1REhjNo9f4ssAghjEiv9'
    )

    // let response = await connection.getTokenAccountsByOwner(
    //     feePayer.publicKey, // owner here
    //     {
    //         programId: TOKEN_PROGRAM_ID
    //     }
    // )

    // console.log(response)

    // authority type

    // 1) for mint account
    // AuthorityType.MintTokens
    // AuthorityType.FreezeAccount

    // 2) for token account
    // AuthorityType.AccountOwner
    // AuthorityType.CloseAccount

    // Example of setting authority
    let txhash0 = await setAuthority(
        connection,
        feePayer,
        mintPubkey,
        feePayer,
        AuthorityType.MintTokens,
        null
    )

    // let txhash4 = await setAuthority(
    //     connection,
    //     feePayer,
    //     mintPubkey,
    //     feePayer,
    //     AuthorityType.FreezeAccount,
    //     null
    // )

    // console.log(`txhash: ${txhash4}`)

    // let transactionSignature = await setAuthority(
    //     connection,
    //     feePayer,
    //     tokenAccount,
    //     feePayer,
    //     AuthorityType.AccountOwner,
    //     newM
    // )

    console.log(`txhash: ${txhash0}`)
}

module.exports = RevokeToken
