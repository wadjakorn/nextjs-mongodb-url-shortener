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
                    <th>title</th>
                    <th>link</th>
                    <th>shortUrl</th>
                    <th>createdAt</th>
                    <th>youtube</th>
                    <th>facebook</th>
                    <th>tiktok</th>
                    <th>instagram</th>
                </tr>
            </thead>
            <tbody>
                {data.map((link) => (
                    <tr key={link._id}>
                        <td>{link.uid}</td>
                        <td>{link.title}</td>
                        <td>{link.link}</td>
                        <td>{link.shortUrl}</td>
                        <td>{link.createdAt}</td>
                        <td>{link.visit?.yt ?? 0}</td>
                        <td>{link.visit?.fb ?? 0}</td>
                        <td>{link.visit?.tt ?? 0}</td>
                        <td>{link.visit?.ig ?? 0}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    )
}