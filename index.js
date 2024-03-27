require('dotenv').config()
require('express-async-errors')

const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')

const router = require('./src/routes')

const app = express()
const SERVER_PORT = process.env.SERVER_PORT || 4000

app.use(cors())

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.use(router)

/** for catching all 404 errors **/
app.use((req, res) => {
    res.status(404).send('Resource not found')
})

/** for catching all internal errors **/
app.use((err, req, res, next) => {
    console.log(err)
    res.status(500).json({
        is_success: false,
        message: err.message,
        stack: err.stack
    })
})

app.listen(SERVER_PORT, function () {
    console.log('Server is running on Port:' + SERVER_PORT)
})

module.exports = app
