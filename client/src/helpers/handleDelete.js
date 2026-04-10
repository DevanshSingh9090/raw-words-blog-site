
export const deleteData = async (endpoint) => {
    try {
        const response = await fetch(endpoint, {
            method: 'delete',
            credentials: 'include',
        })
        const data = await response.json()
        if (!response.ok) {
            throw new Error(data.message || response.statusText)
        }
        return true
    } catch (error) {
        console.error('deleteData error:', error)
        return false
    }
}