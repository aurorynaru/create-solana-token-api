const {
    clusterApiUrl,
    Connection,
    PublicKey,
    Keypair
} = require('@solana/web3.js')

const { AuthorityType, setAuthority } = require('@solana/spl-token')
const path = require('path')
const assetsPath = path.join(__dirname, '..', 'assets')
const fs = require('fs')

const revokeAuthController = async (req, res) => {
    const { ca, TAA, mintAuth, freezeAuth, renounceOwnership } = req.body
    console.log(mintAuth)
    console.log(freezeAuth)
    const secret = JSON.parse(fs.readFileSync(`${assetsPath}/pk.json`))

    const feePayer = Keypair.fromSecretKey(Uint8Array.from(secret))

    const connection = new Connection(
        clusterApiUrl('mainnet-beta'),
        'confirmed'
    )

    const dead = new PublicKey('11111111111111111111111111111111')

    let mintHash
    let freezeHash
    let ownerHash

    if (mintAuth) {
        mintHash = await setAuthority(
            connection, // connection
            feePayer, // payer
            ca, // mint account
            feePayer, // current authority
            AuthorityType.MintTokens, // authority type to revoke (MintTokens)
            null // new authority (pass `null` to revoke)
        )
    }

    if (freezeAuth) {
        freezeHash = await setAuthority(
            connection, // connection
            feePayer, // payer
            ca, // token account
            feePayer, // current authority
            AuthorityType.FreezeAccount, // authority type to revoke (AccountOwner)
            null // new authority (pass `null` to revoke)
        )
    }

    if (renounceOwnership) {
        ownerHash = await setAuthority(
            connection,
            feePayer,
            TAA,
            feePayer,
            AuthorityType.AccountOwner,
            dead
        )
    }

    const responseObject = {}

    if (mintHash !== undefined) {
        responseObject.mintAuth = {
            message: 'mint authority revoked',
            mintHash: `tx: ${mintHash}`
        }
    }
    if (freezeHash !== undefined) {
        responseObject.freezeAuth = {
            message: 'freeze authority revoked',
            freezeHash: `tx: ${freezeHash}`
        }
    }
    if (ownerHash !== undefined) {
        responseObject.renounceOwnership = {
            message: 'renounced token ownership',
            ownerHash: `tx: ${ownerHash}`
        }
    }

    res.send(responseObject)
}

module.exports = revokeAuthController
