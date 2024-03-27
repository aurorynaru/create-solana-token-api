const path = require('path')
const assetsPath = path.join(__dirname, '..', 'assets')

const updateJsonFile = async (newData) => {
    const fs = require('fs')

    // Path to your JSON file
    const filePath = `${assetsPath}/data.json`

    // Step 1: Read the JSON file
    try {
        const data = fs.readFileSync(filePath, 'utf8')

        // Step 2: Parse the file content to a JavaScript object
        const obj = JSON.parse(data)

        // Step 3: Modify the object
        // For example, add a new property or update an existing one
        Object.keys(newData).forEach((key) => {
            if (newData[key] === null) {
                // If the new value is explicitly null, delete the key
                delete obj[key]
            } else {
                // Otherwise, update or add the key-value pair
                obj[key] = newData[key]
            }
        })

        // Step 4: Convert the object back to a JSON string
        const json = JSON.stringify(obj, null, 2) // The second argument `null` and third `2` are for formatting purposes

        // Write the JSON string back to the file
        await fs.writeFileSync(filePath, json, 'utf8')

        console.log('JSON file has been updated successfully.')
    } catch (error) {
        console.error('Error reading or writing the file:', error)
        return false
    }

    return true
}

module.exports = updateJsonFile
