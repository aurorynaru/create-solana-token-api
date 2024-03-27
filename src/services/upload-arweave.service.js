const Arweave = require('arweave')
const fs = require('fs')
const path = require('path')
const assetsPath = path.join(__dirname, '..', 'assets')

const fileExtensions = {
    json: 'application/json',
    jpeg: 'image/jpeg',
    jpg: 'image/jpeg',
    png: 'image/png'
}

const uploadArweaveService = async ({ filename = 'data.json' }) => {
    try {
        console.log(`Executing == uploadArweaveService == filename ${filename}`)

        // initialize an arweave instance
        const arweave = Arweave.init({
            host: 'arweave.net',
            port: 443,
            protocol: 'https'
        })

        const fileExtension = filename.split('.')[1]

        const key = JSON.parse(
            fs.readFileSync(`${assetsPath}/key.json`, 'utf8')
        )

        const add = await arweave.wallets.jwkToAddress(key)

        const data = fs.readFileSync(`${assetsPath}/${filename}`)

        // create a data transaction
        let transaction = await arweave.createTransaction(
            {
                data
            },
            key
        )

        // add a custom tag that tells the gateway how to serve this data to a browser
        const sat = transaction.addTag(
            'Content-Type',
            fileExtensions[fileExtension]
        )

        // you must sign the transaction with your key before posting
        await arweave.transactions.sign(transaction, key)

        // create an uploader that will seed your data to the network
        let uploader = await arweave.transactions.getUploader(transaction, data)

        // run the uploader until it completes the upload.
        while (!uploader.isComplete) {
            await uploader.uploadChunk()
            console.log(
                `${uploader.pctComplete}% complete, ${uploader.uploadedChunks}/${uploader.totalChunks}`
            )
        }

        if (uploader.isComplete) {
            console.log(uploader)
            arweave.wallets.getLastTransactionID(add).then((transactionId) => {
                console.log(transactionId)
            })
        }

        return uploader.transaction.id
    } catch (error) {
        console.log(`Error == uploadArweaveService == filename ${filename}`)
    }
}

module.exports = uploadArweaveService
