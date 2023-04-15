import { useState, useEffect } from 'react'

export default function Links() {
    const [data, setData] = useState(null)
    const [isLoading, setLoading] = useState(false)
    useEffect(() => {
        setLoading(true)
        fetch('/api/links?limit=100&page=1')
            .then((res) => res.json())
            .then((resp) => {
                console.log({ resp })
                setData(resp.data)
                setLoading(false)
            })
    }, [])

    if (isLoading) return <p>Loading...</p>
    if (!data) return <p>No links data</p>

    return (
        <table>
            <thead>
                <tr>
                    <th>uid</th>
                    <th>link</th>
                    <th>shortUrl</th>
                    <th>createdAt</th>
                    <th>from_yt</th>
                    <th>from_fb</th>
                    <th>from_tt</th>
                    <th>from_ig</th>
                </tr>
            </thead>
            <tbody>
                {data.map((link) => (
                    <tr key={link._id}>
                        <td>{link.uid}</td>
                        <td>{link.link}</td>
                        <td>{link.shortUrl}</td>
                        <td>{link.createdAt}</td>
                        <td>{link.from_yt}</td>
                        <td>{link.from_fb}</td>
                        <td>{link.from_tt}</td>
                        <td>{link.from_ig}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    )
}