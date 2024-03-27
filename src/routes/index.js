const express = require('express')

const router = express.Router()

const tokenMintController = require('../controllers/token-mint.controller')
const uploadArweaveImageController = require('../controllers/arweave/upload-image.controller')
const uploadArweaveMetadataController = require('../controllers/arweave/upload-metadata.controller')
const revokeAuthController = require('../controllers/revoke.controller')
const removeLPController = require('../controllers/removeLP')

router.post('/token-mint', tokenMintController)
router.post('/upload-arweave-image', uploadArweaveImageController)
router.post('/upload-arweave-metadata', uploadArweaveMetadataController)
router.post('/revoke', revokeAuthController)
router.post('/remove-lp', removeLPController)

module.exports = router
