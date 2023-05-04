import React, { FormEvent, useEffect, useState } from "react";
import { Badge, Modal, Text, Grid, Popover, Link, Loading, Container, Button, Input } from "@nextui-org/react";
import { RespData, UpdateRespData, UrlInfo } from "../types";
import { IconButton } from './IconButton';
import { CopyIcon } from './CopyIcon';
import { copy } from '../utils';
import { VisitTable } from "./VisitTable";
import { SocialShareBtn } from "./SocialShareBtn";

export function ViewLinkDetails(props: { item: UrlInfo, onClose: () => void }) {
    const [item, setItem] = useState<UrlInfo>(props.item);
    const [enableEdit, setEnableEdit] = React.useState(false);
    const [message, setMessage] = useState<any>(null);
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        if (props.item) {
            setItem(props.item)
        }
    }, [props.item])

    if (!props.onClose && (!item || loading)) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100vh'}}>
                <Loading size="lg" />
            </div>
        )
    }

    const closeHandler = () => {
        if (props.onClose) {
            props.onClose();
        }
    };

    type colors = 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error';

    const renderTags = (tags: string[]) => {
        if (!tags || tags.length === 0) {
            return <Badge>No tags</Badge>;
        }
        // TODO: use tag color from backend
        return tags.map((tag: string) => {
            const color = ['default', 'primary', 'secondary', 'success', 'warning', 'error'][Math.floor(Math.random() * 6)];
            return <Badge key={tag} color={color as colors}>{tag}</Badge>

        })
    }

    function refresh(uid: string) {
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
      
          fetch(`/api/links/${uid}`, { headers })
              .then((res) => res.json())
              .then((resp: RespData) => {
                // TODO: handle error
                setItem(resp.data)
                setEnableEdit(false)
              })
    }

    function submitUpdate(e: FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)
        setMessage(null)
        const form = e.currentTarget
        const link = form.link.value
        const uid = form.uid.value
        const title = (form.title as any).value
        const tags = form.tags.value.split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag.length > 0)
        console.log(
            { link, uid, title, tags }
        )
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
        const body = JSON.stringify({ link, title, tags })
        fetch(`/api/link/${uid}`, { headers, method: "PATCH", body } )
            .then((res) => res.json())
            .then((resp: UpdateRespData) => {
                setLoading(false)
                if (resp.code >= 300) {
                    setMessage(`error: ${resp?.message ?? 'unknown'}`)
                    return;
                }
                setMessage(`updated`)
                refresh(uid)
            })
    }

    function renderForm() {
        return (item &&
            <Modal.Body>
                <Container css={{ p:0 }}>
                    <Text h4>_id: {item._id.toString()}</Text>
                    <form onSubmit={submitUpdate}>
                        <Container css={{ p:0, dflex: 'center'}} >
                            <Input clearable fullWidth label="original link" type="text" name="link" id="link" initialValue={item.link} />
                            <Input clearable fullWidth label="uid" type="text" name="uid" id="uid" initialValue={item.uid} />
                            <Input clearable fullWidth label="title" type="text" name="title" id="title" initialValue={item.title} />
                            <Input clearable fullWidth label="tags" type="text" name="tags" id="tags" initialValue={item.tags.join(',')} />
                            <Container css={{ p: '0', mt: '20px', dflex: 'center'}}>
                                <Button size={"lg"} type="submit">
                                    <Text size={"$lg"} color="white" weight={"bold"}>Update</Text>
                                </Button>
                            </Container>
                        </Container>
                    </form>
                </Container>
            </Modal.Body>
        )
    }

    function renderBody() {
        return (item &&
            <Modal.Body>
                <div>
                    <Text h2>{item.title}</Text>
                    <Text size={14}>Tags</Text>
                    {renderTags(item.tags)}
                </div>
                <Text size={14}>Shorten Link</Text>
                <div style={{ display: 'flex', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden',  }}>
                    <Popover placement='left'>
                        <Popover.Trigger>
                            <IconButton onClick={() => copy(item.shortUrl)}>
                                <CopyIcon size={20} fill="#979797" style={{ marginRight: '10px' }} />
                            </IconButton>
                        </Popover.Trigger>
                        <Popover.Content>
                            <Text css={{ p: "$5" }}>Copied!</Text>
                        </Popover.Content>
                    </Popover>
                    <Link target='_blank' href={item.shortUrl}>{item.shortUrl}</Link>
                </div>
                <Text size={14}>Original Link</Text>
                <div style={{ display: 'flex', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden',  }}>
                    <Popover placement='left'>
                        <Popover.Trigger>
                            <IconButton onClick={() => copy(item.link)}>
                                <CopyIcon size={20} fill="#979797" style={{ marginRight: '10px' }} />
                            </IconButton>
                        </Popover.Trigger>
                        <Popover.Content>
                            <Text css={{ p: "$5" }}>Copied!</Text>
                        </Popover.Content>
                    </Popover>
                    <Link target='_blank' href={item.link}>{item.link}</Link>
                </div>
                <div>
                    <Text size={14}>Shares</Text>
                    <Grid.Container gap={1}>
                        <Grid md={3}>
                            <div style={{ display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
                                <SocialShareBtn text="Facebook" color="primary" url={`${item.shortUrl}?from=fb`} />
                            </div>
                        </Grid>
                        <Grid md={3}>
                            <div style={{ display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
                                <SocialShareBtn text="Instagram" color="secondary" url={`${item.shortUrl}?from=ig`} />
                            </div>
                        </Grid>
                        <Grid md={3}>
                            <div style={{ display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
                                <SocialShareBtn text="Tiktok" color="warning" url={`${item.shortUrl}?from=tt`} />
                            </div>
                        </Grid>
                        <Grid md={3}>
                            <div style={{ display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
                                <SocialShareBtn text="Youtube" color="error" url={`${item.shortUrl}?from=yt`} />
                            </div>
                        </Grid>
                    </Grid.Container>
                </div>
                <div>
                    <Text size={14}>Visits</Text>
                    <VisitTable visits={item.visits ?? []} />
                </div>
            </Modal.Body>
        )
    }

    return (
        <Modal
            closeButton={!!props.onClose}
            preventClose={true}
            blur
            width="800px"
            aria-labelledby="modal-title"
            open={!!props.item}
            onClose={closeHandler}
        >
            <Modal.Header>
                <Container css={{ p: 0, dflex: 'space-between' }}>
                    <Text id="modal-title" size={18}>
                        {enableEdit ? 'Edit Link' : 'Link Details'}
                    </Text>
                    <Button css={{ mr: '20px'}} size={"sm"} color={"secondary"} onPress={() => setEnableEdit(!enableEdit)}>{ enableEdit ? 'cancel': 'edit'}</Button>
                </Container>
            </Modal.Header>
            { enableEdit ? renderForm() : renderBody() }
            <Modal.Footer>
                <Container css={{ p: 0, dflex: 'flex-end' }}>
                    { message && <Text >{ message }</Text> }
                </Container>
            </Modal.Footer>
        </Modal>
    );
}