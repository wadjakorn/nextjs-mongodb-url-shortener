import { useEffect, useState } from "react"
import { RespData } from "../../types"
import { useRouter } from "next/router"
import { ViewLinkDetails } from "../../components/ViewLinkDetails"

export default function LinkDetails() {
  const router = useRouter()
  const [resp, setResp] = useState<RespData>(null)
  useEffect(() => {
    const uid = router.query.hash
    console.log({ uid })
    if (!uid) return;
    fetch(`/api/links/${uid}`)
        .then((res) => res.json())
        .then((resp: RespData) => {
            console.log({ resp })
            setResp(resp)
        })
  }, [router])

  return (
    <div>
      {/* <h1>Link Details</h1> */}
      {/* <pre>{JSON.stringify(resp, null, 2)}</pre> */}
      <ViewLinkDetails item={resp?.data} onClose={null} />
    </div>
  )
}
