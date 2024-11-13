export async function TryFetchIpfsFile(url: string) {
    try {
        const response = await fetch(url)
        if (response.ok) {
            return await response.json()
        }
    }
    catch (e) {
        console.error('Unable to fetch from Cloudflare')
    }
    return null
}