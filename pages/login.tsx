import { FormEvent, useState } from "react"
import { RespLogin } from "../types"
import router from "next/router"
import { Button, Card, Input, Loading, Row, Text } from "@nextui-org/react";
import dynamic from 'next/dynamic'

const Container = dynamic(import('@nextui-org/react').then(mod => mod.Container), { ssr: false })

export default function LoginPage() {
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState<boolean>(false)

    function submit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)
        setError(null)
        const form = e.currentTarget
        const username = form.username.value
        const password = form.password.value
        
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
        const body = JSON.stringify({ username, password })
        fetch(`/api/login`, { headers, method: "POST", body } )
            .then((res) => res.json())
            .then((resp: RespLogin) => {
                setLoading(false)
                if (resp.code === 401) {
                    setError('Invalid credential')
                    return;
                }
                if (resp.code === 400) {
                    setError('Bad request')
                    return;
                }
                if (resp.code !== 200) {
                    setError('Unknown error')
                    return;
                }
                if (resp.message !== 'alreadyloggedin') {
                    localStorage.setItem('token', resp.token)
                }
                router.push('/')
            })
    }

    function renderText() {
        if (loading) {
            return <Loading></Loading>
        }
        return error && <Text color="red">{error}</Text>
    }


    return (
        <Container css={{ dflex: 'center', mt: '100px', mh: 'auto'}}>
            <Card css={{ mw: '600px'}}>
                <Card.Header>
                    <Row wrap="wrap" justify="center" align="center">
                        <Text h1>Login</Text>
                    </Row>
                </Card.Header>
                <Card.Body>
                    <form onSubmit={submit} >
                        <Container css={{ dflex: 'center', fd: 'column', gap: '20px'}}>
                            <Input clearable fullWidth label="username" type="text" name="username" id="username" />
                            <Input clearable fullWidth label="password" type="password" name="password" id="password" />
                            <Row wrap="wrap" justify="center" align="center" css={{ mt: '20px'}}>
                                {renderText()}
                            </Row>
                            <Container css={{ p: '0', mt: '20px', dflex: 'center'}}>
                                <Button size={"lg"} type="submit">
                                    <Text size={"$lg"} color="white" weight={"bold"}>Go</Text>
                                </Button>
                            </Container>
                        </Container>
                    </form>
                </Card.Body>
            </Card>
        </Container>
    )
}