import { useEffect, useState } from "react"
import { RespData } from "../../types"
import { useRouter } from "next/router"
import { ViewLinkDetails } from "../../components/ViewLinkDetails"

export default function LinkDetails() {
  const router = useRouter()
  const [resp, setResp] = useState<RespData>(null)
  useEffect(() => {
    const uid = router.query.uid
    if (!uid) return;

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }

    fetch(`/api/links/${uid}`, { headers })
        .then((res) => res.json())
        .then((resp: RespData) => {
            setResp(resp)
        })
    }, [router])

  return (
    <div>
      <ViewLinkDetails item={resp?.data} onClose={null} />
    </div>
  )
}
