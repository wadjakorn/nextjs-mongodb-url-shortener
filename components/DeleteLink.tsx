import React, { FormEvent, useEffect } from "react";
import { Modal, Text, Input, Button } from "@nextui-org/react";
import { CreateLinkInputs, DeleteRespData } from "../types";

export function DeleteLink(props: { uid: string, onClose: (resp: DeleteRespData) => void }) {
    const [open, setOpen] = React.useState(false);

    useEffect(() => {
        setOpen(!!props.uid);
    }, [props.uid])

    const closeHandler = (resp: DeleteRespData = null) => {
        props.onClose(resp)
    };

    const confirmDelete = () => {
        const req: RequestInit = {
            headers: {
                'Content-Type': 'application/json',
                'api-key': 'hiiamhacker'
            },
            method: 'DELETE',
        }
        console.log({ req })
        fetch(`/api/link/${props.uid}`, req)
            .then((res) => {
                console.log( {res })
                return res.json()
            })
            .then((resp: DeleteRespData) => {
                console.log({ resp })
                if (resp.code === 200) {
                    closeHandler(resp)
                }
            })
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
                    Delete This Link UID: {props.uid}
                </Text>
            </Modal.Header>
            <Modal.Body>
            </Modal.Body>
            <Modal.Footer>
                <Button auto onPress={() => closeHandler()}>Cancel</Button>
                <Button auto onPress={() => confirmDelete()}>Confirm</Button>
            </Modal.Footer>
        </Modal>
    );
}