const updateJsonFile = require('../../services/update-json-file.service')
const uploadArweaveService = require('../../services/upload-arweave.service')

const uploadArweaveImageController = async (req, res) => {
    try {
        const { name, symbol, description, img_name } = req.body

        console.log('Executing upload image')
        const imgTransactionId = await uploadArweaveService({
            filename: img_name
        })

        console.log('Executing update json file')
        await updateJsonFile({
            name,
            symbol,
            description,
            image: `https://arweave.net/${imgTransactionId}`,
            uri: null
        })

        res.send({ transaction_id: imgTransactionId })
    } catch (error) {
        console.log(error)
    }
}

module.exports = uploadArweaveImageController
