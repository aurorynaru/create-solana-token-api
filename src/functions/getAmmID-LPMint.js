// const ca = 'EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm'
const url = 'https://api.raydium.io/v2/main/pairs'

const getAmmIdLpMint = async (ca) => {
    try {
        const response = await fetch(url)

        if (!response.ok) {
            throw new Error('Network response was not ok')
        }

        console.log('checking...')
        const data = await response.json()

        let found = data.forEach((element) => {
            if (element.baseMint === ca) {
                found = element
            }
        })

        if (found) {
            //lpmint = lpToken
            // ammId = targetPool

            return {
                ammId: found.ammId,
                lpMint: found.lpMint
            }
        }
    } catch (error) {
        // Handle any errors that occurred during the fetch
        console.log('error', error)
    }
}

module.exports = getAmmIdLpMint
