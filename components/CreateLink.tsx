import React, { FormEvent, useEffect } from "react";
import { Modal, Text, Input, Button } from "@nextui-org/react";
import { CreateLinkInputs, CreateRespData } from "../types";

export function CreateLink(props: { open: boolean, onClose: (resp: CreateRespData) => void }) {
    const [open, setOpen] = React.useState(false);
    const [inputs, setInputs] = React.useState(new CreateLinkInputs());

    useEffect(() => {
        setOpen(props.open);
    }, [props.open])

    const closeHandler = (resp: CreateRespData = null) => {
        props.onClose(resp)
    };

    const makeLink = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        console.log({ inputs });
        const req: RequestInit = {
            headers: {
                'Content-Type': 'application/json',
                'api-key': 'hiiamhacker'
            },
            method: 'POST',
            body: JSON.stringify(inputs),
        }
        console.log({ req })
        fetch(`/api/link`, req)
            .then((res) => {
                console.log( {res })
                return res.json()
            })
            .then((resp: CreateRespData) => {
                console.log({ resp })
                if (resp.code === 201) {
                    closeHandler(resp)
                }
            })
    }

    const renderForm = () => {
        return (
            <form onSubmit={makeLink}>
                <div style={{ display: 'grid', gap: '20px' }}>
                    <div style={{ gridColumnStart: 1, gridColumnEnd: 3 }}>
                        <Input label="Title" name="title" clearable fullWidth placeholder="title" onChange={(v) => setInputs({ ...inputs, title: v.target.value })} />
                    </div>
                    <div style={{ gridColumnStart: 3, gridColumnEnd: 5 }}>
                        <Input label="Tags" clearable fullWidth placeholder="tags" onChange={(v) => setInputs({ ...inputs, tags: v.target.value?.split(",") })} />
                    </div>
                    <div style={{ gridColumnStart: 1, gridRowStart: 2 }}>
                        <Input label="Custom uid (optional)" name="customHash" clearable fullWidth placeholder="custom uid (customHash)" onChange={(v) => setInputs({ ...inputs, customHash: v.target.value })} />
                    </div>
                    <div style={{ gridColumnStart: 2, gridColumnEnd: 4, gridRowStart: 2 }}>
                        <Input label="Original Link" name="originalLink" clearable fullWidth placeholder="original link" onChange={(v) => setInputs({ ...inputs, link: v.target.value })} />
                    </div>
                    <div style={{ gridColumnStart: 4, gridColumnEnd: 5, gridRowStart: 2, display: 'flex', alignItems: 'end' }}>
                        <Button style={{ width: '100%'}} type="submit">Create</Button>
                    </div>
                </div>
            </form>
        )
    }

    return (
        <Modal
            closeButton
            blur
            width="800px"
            aria-label="modal-title"
            open={open}
            onClose={() => closeHandler()}
        >
            <Modal.Header>
                <Text size={18}>
                    Shorten a long link
                </Text>
            </Modal.Header>
            <Modal.Body>
                {renderForm()}
            </Modal.Body>
            <Modal.Footer>
            </Modal.Footer>
        </Modal>
    );
}