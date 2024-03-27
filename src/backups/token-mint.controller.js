import {
    percentAmount,
    generateSigner,
    signerIdentity,
    createSignerFromKeypair
} from '@metaplex-foundation/umi'
import {
    TokenStandard,
    createAndMint,
    updateMetadataAccountV2
} from '@metaplex-foundation/mpl-token-metadata'
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults'
import { mplCandyMachine } from '@metaplex-foundation/mpl-candy-machine'
import '@solana/web3.js'
import * as fs from 'fs'
const path = require('path')
const assetsPath = path.join(__dirname, '..', 'assets')

const endpoints = {
    devnet: 'https://api.devnet.solana.com',
    mainnet: 'https://api.mainnet-beta.solana.com'
}

const tokenMintController = async (req, res) => {
    const { name, symbol, description, image, uri } = req.body

    const secret = JSON.parse(fs.readFileSync(`${assetsPath}/pk.json`))

    const umi = createUmi(endpoints[process.env.NODE_ENV])

    const private_key_uint8 = new Uint8Array(secret)

    const userWallet = umi.eddsa.createKeypairFromSecretKey(private_key_uint8)
    const userWalletSigner = createSignerFromKeypair(umi, userWallet)
    //https://arweave.net/T0uu24t6AQb7FzhR9PAUZPrBPrCjZ3jWE4cbm4lIdKY

    const mint = generateSigner(umi)
    umi.use(signerIdentity(userWalletSigner))
    umi.use(mplCandyMachine())

    // createAndMint(umi, {
    //     mint,
    //     authority: umi.identity,
    //     name: metadata.name,
    //     symbol: metadata.symbol,
    //     description: metadata.description,
    //     image: metadata.image,
    //     uri: metadata.uri,
    //     sellerFeeBasisPoints: percentAmount(0),
    //     decimals: 8,
    //     amount: 1000000000_00000000n,
    //     tokenOwner: userWallet.publicKey,
    //     tokenStandard: TokenStandard.Fungible
    // })
    //     .sendAndConfirm(umi)
    //     .then(() => {
    //         console.log(
    //             'Successfully minted 1 million tokens (',
    //             mint.publicKey,
    //             ')'
    //         )
    //     })
    const metadata = {
        name: 'Your Token Name',
        symbol: 'TOKENSYMBOL',
        description: 'A description of your token',
        image: 'https://link-to-your-token-image.png',
        uri: 'https://link-to-your-metadata.json',
        // Add extensions here
        extensions: {
            website: 'https://your-token-website.com',
            // You can add more custom fields here as needed
            twitter: 'https://twitter.com/yourtoken',
            discord: 'https://discord.com/invite/yourtoken'
            // Any other relevant links or additional data
        },
        tags: [],
        creator: {
            name: 'DEXLAB MINTING LAB',
            site: 'https://www.dexlab.space'
        }
    }

    // Update your createAndMint call to include the updated metadata
    createAndMint(umi, {
        mint,
        authority: umi.identity,
        name: metadata.name,
        symbol: metadata.symbol,
        description: metadata.description,
        image: metadata.image,
        uri: metadata.uri,
        sellerFeeBasisPoints: percentAmount(0),
        decimals: 8,
        amount: 1000000000_00000000n,
        tokenOwner: userWallet.publicKey,
        tokenStandard: TokenStandard.Fungible,
        // Make sure to pass the entire metadata object, including the extensions
        metadata: metadata // Ensure this aligns with how your framework expects extended metadata to be passed
    })
        .sendAndConfirm(umi)
        .then(() => {
            console.log(
                'Successfully minted 1 million tokens (',
                mint.publicKey,
                ')'
            )
        })

    res.send({ is_success: true, message: 'yes' })
}

module.exports = tokenMintController
