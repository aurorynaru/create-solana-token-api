const updateJsonFile = require('../../services/update-json-file.service')
const uploadArweaveService = require('../../services/upload-arweave.service')

const uploadArweaveMetadataController = async (req, res) => {
    try {
        console.log('Executing upload json')
        const metadataTransactionId = await uploadArweaveService({
            filename: 'data.json'
        })

        console.log('Executing update json file')
        await updateJsonFile({
            uri: `https://arweave.net/${metadataTransactionId}`
        })

        res.send({ transaction_id: metadataTransactionId })
    } catch (error) {
        console.log(error)
    }
}

module.exports = uploadArweaveMetadataController
