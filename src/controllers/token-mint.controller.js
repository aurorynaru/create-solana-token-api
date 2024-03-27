const {
    percentAmount,
    generateSigner,
    signerIdentity,
    createSignerFromKeypair
} = require('@metaplex-foundation/umi')
const {
    TokenStandard,
    createAndMint,
    updateMetadataAccountV2
} = require('@metaplex-foundation/mpl-token-metadata')
const { createUmi } = require('@metaplex-foundation/umi-bundle-defaults')
const { mplCandyMachine } = require('@metaplex-foundation/mpl-candy-machine')
require('@solana/web3.js')
const fs = require('fs')
const path = require('path')
const assetsPath = path.join(__dirname, '..', 'assets')

const endpoints = {
    devnet: 'https://api.devnet.solana.com',
    mainnet:
        'https://mainnet.helius-rpc.com/?api-key=5ef2ec9f-025c-45c4-87d1-9a7f7ea69b4e'
}

const convert = (supply, decimal) => {
    const bigSupply = BigInt(supply)
    // Convert decimals to BigInt to use in exponentiation
    const bigDecimals = BigInt(10) ** BigInt(decimal)
    // Return the result of the multiplication as BigInt
    return bigSupply * bigDecimals
}

const tokenMintController = async (req, res) => {
    const { decimal, supply } = req.body

    if (!decimal || !supply) {
        res.send({
            is_success: false,
            message: 'invalid token supply and decimal'
        })
        return
    }

    let tokenSupply = convert(supply, decimal)

    const secret = JSON.parse(fs.readFileSync(`${assetsPath}/pk.json`))

    const umi = createUmi(endpoints[process.env.NODE_ENV])

    const private_key_uint8 = new Uint8Array(secret)

    const userWallet = umi.eddsa.createKeypairFromSecretKey(private_key_uint8)
    const userWalletSigner = createSignerFromKeypair(umi, userWallet)
    // Example Arweave link commented out

    const mint = generateSigner(umi)
    umi.use(signerIdentity(userWalletSigner))
    umi.use(mplCandyMachine())

    // The commented out createAndMint function call and its logging are preserved for context
    // const metadata = {
    //     name: 'PEPE',
    //     symbol: 'PEPE',
    //     description: 'A description of your token',
    //     image: 'https://link-to-your-token-image.png',
    //     uri: 'https://link-to-your-metadata.json'
    //     // extensions: {
    //     //     website: 'https://your-token-website.com',
    //     //     twitter: 'https://twitter.com/yourtoken',
    //     //     discord: 'https://discord.com/invite/yourtoken'
    //     // },
    //     // creator: {
    //     //     name: 'DEXLAB MINTING LAB',
    //     //     site: 'https://www.dexlab.space'
    //     // }
    // }

    if (tokenSupply < 1) {
        res.send({ is_success: false, message: 'invalid token supply' })
        return
    }

    if (decimal < 1) {
        res.send({ is_success: false, message: 'invalid decimal' })
        return
    }

    const rawData = fs.readFileSync(`${assetsPath}/data.json`, 'utf8')

    const metadata = JSON.parse(rawData)
    console.log(metadata)
    createAndMint(umi, {
        mint,
        authority: umi.identity,
        name: metadata.name,
        symbol: metadata.symbol,
        description: metadata.description,
        image: metadata.image,
        uri: metadata.uri,
        sellerFeeBasisPoints: percentAmount(0),
        decimals: decimal,
        amount: tokenSupply,
        tokenOwner: userWallet.publicKey,
        tokenStandard: TokenStandard.Fungible
    })
        .sendAndConfirm(umi)
        .then(() => {
            console.log(
                'Successfully minted 1 million tokens (',
                mint.publicKey,
                ')'
            )

            res.send({
                is_success: true,
                message: 'successfully minted your token',
                ca: mint.publicKey
            })
        })
        .catch((err) => {
            console.log('error', err)
            res.send({ is_success: false, message: 'error', error: err })
        })
}

module.exports = tokenMintController
