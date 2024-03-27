const web3 = require('@solana/web3.js')
const splToken = require('@solana/spl-token')

const splTransferController = async (req, res) => {
    const { mint_address, private_key } = req.body
    // Connect to cluster
    const connection = new web3.Connection(
        web3.clusterApiUrl('mainnet-beta'),
        'confirmed'
    )

    // Sender's wallet
    const senderSecretKey = Uint8Array.from([
        /* Your sender's secret key array here */
    ])
    const senderWallet = web3.Keypair.fromSecretKey(senderSecretKey)

    // Specify the token mint address
    const mintAddress = new web3.PublicKey(mint_address)

    // Recipient's token account address (not the wallet address, but the token account address)
    const recipientTokenAddress = new web3.PublicKey(
        'Recipient token account address here'
    )

    // Create a new token class
    const token = new splToken.Token(
        connection,
        mintAddress,
        splToken.TOKEN_PROGRAM_ID,
        senderWallet // Use the sender's wallet to authorize transactions
    )

    // Get the sender's token account
    const senderTokenAccount = await token.getOrCreateAssociatedAccountInfo(
        senderWallet.publicKey
    )

    // Define the amount to transfer
    // Note: The amount should be in the smallest unit of the token (like wei in Ethereum)
    const amount = 100 // Example: 100 tokens

    // Perform the transfer
    await token.transfer(
        senderTokenAccount.address,
        recipientTokenAddress,
        senderWallet.publicKey,
        [],
        amount
    )

    console.log(
        `Transferred ${amount} tokens to ${recipientTokenAddress.toString()}`
    )
}

module.exports = splTransferController
