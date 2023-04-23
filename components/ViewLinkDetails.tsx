import React, { useEffect } from "react";
import { Badge, Modal, Text, Grid, Popover, Link, Loading } from "@nextui-org/react";
import { UrlInfo } from "../types";
import { IconButton } from './IconButton';
import { CopyIcon } from './CopyIcon';
import { copy } from '../utils';
import { VisitTable } from "./VisitTable";
import { SocialShareBtn } from "./SocialShareBtn";

export function ViewLinkDetails(props: { item: UrlInfo, onClose: () => void }) {

    if (!props.onClose && !props.item) {
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
        return tags.map((tag: string) => {
            const color = ['default', 'primary', 'secondary', 'success', 'warning', 'error'][Math.floor(Math.random() * 6)];
            return <Badge key={tag} color={color as colors}>{tag}</Badge>

        })
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
                <Text id="modal-title" size={18}>
                    UID: 
                    <Text style={{ marginLeft: '10px'}} b size={18}>
                    { props.item?.uid }
                    </Text>
                </Text>
            </Modal.Header>
            <Modal.Body>
                <div>
                    <Text size={14}>Tags</Text>
                    {renderTags(props.item?.tags)}
                </div>
                <Text size={14}>Shorten Link</Text>
                <div style={{ display: 'flex', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden',  }}>
                    <Popover placement='left'>
                        <Popover.Trigger>
                            <IconButton onClick={() => copy(props.item?.shortUrl)}>
                                <CopyIcon size={20} fill="#979797" style={{ marginRight: '10px' }} />
                            </IconButton>
                        </Popover.Trigger>
                        <Popover.Content>
                            <Text css={{ p: "$5" }}>Copied!</Text>
                        </Popover.Content>
                    </Popover>
                    <Link target='_blank' href={props.item?.shortUrl}>{props.item?.shortUrl}</Link>
                </div>
                <Text size={14}>Original Link</Text>
                <div style={{ display: 'flex', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden',  }}>
                    <Popover placement='left'>
                        <Popover.Trigger>
                            <IconButton onClick={() => copy(props.item?.link)}>
                                <CopyIcon size={20} fill="#979797" style={{ marginRight: '10px' }} />
                            </IconButton>
                        </Popover.Trigger>
                        <Popover.Content>
                            <Text css={{ p: "$5" }}>Copied!</Text>
                        </Popover.Content>
                    </Popover>
                    <Link target='_blank' href={props.item?.link}>{props.item?.link}</Link>
                </div>
                <div>
                    <Text size={14}>Shares</Text>
                    <Grid.Container gap={1}>
                        <Grid md={3}>
                            <div style={{ display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
                                <SocialShareBtn text="Facebook" color="primary" url={`${props.item?.shortUrl}?from=fb`} />
                            </div>
                        </Grid>
                        <Grid md={3}>
                            <div style={{ display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
                                <SocialShareBtn text="Instagram" color="secondary" url={`${props.item?.shortUrl}?from=ig`} />
                            </div>
                        </Grid>
                        <Grid md={3}>
                            <div style={{ display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
                                <SocialShareBtn text="Tiktok" color="warning" url={`${props.item?.shortUrl}?from=tt`} />
                            </div>
                        </Grid>
                        <Grid md={3}>
                            <div style={{ display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
                                <SocialShareBtn text="Youtube" color="error" url={`${props.item?.shortUrl}?from=yt`} />
                            </div>
                        </Grid>
                    </Grid.Container>
                </div>
                <div>
                    <Text size={14}>Visits</Text>
                    <VisitTable visits={props.item?.visits ?? []} />
                </div>
            </Modal.Body>
            <Modal.Footer>
            </Modal.Footer>
        </Modal>
    );
}