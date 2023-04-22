import React, { useEffect } from "react";
import { Badge, Modal, Text, Grid, Popover, Link } from "@nextui-org/react";
import { UrlInfo } from "../types";
import { IconButton } from './IconButton';
import { CopyIcon } from './CopyIcon';
import { copy } from '../utils';
import { VisitTable } from "./VisitTable";
import { SocialShareBtn } from "./SocialShareBtn";

export function ViewLinkDetails(props: { item: UrlInfo, onClose: () => void }) {
    const [urlInfo, setUrlInfo] = React.useState<UrlInfo>(null);

    useEffect(() => {
        if (!!props.item) {
            setUrlInfo(props.item);
        } else {
            setUrlInfo(null);
        }
    }, [props])

    const closeHandler = () => {
        props.onClose();
    };

    return (
        <Modal
            closeButton
            blur
            width="800px"
            aria-labelledby="modal-title"
            open={!!urlInfo}
            onClose={closeHandler}
        >
            <Modal.Header>
                <Text id="modal-title" size={18}>
                    UID: 
                    <Text style={{ marginLeft: '10px'}} b size={18}>
                    { urlInfo?.uid }
                    </Text>
                </Text>
            </Modal.Header>
            <Modal.Body>
                <div>
                    <Text size={14}>Tags</Text>
                    {urlInfo?.tags?.map((tag: string) => (
                        <Badge key={tag}>{tag}</Badge>
                    ))}
                </div>
                <Text size={14}>Shorten Link</Text>
                <div style={{ display: 'flex', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden',  }}>
                    <Popover placement='left'>
                        <Popover.Trigger>
                            <IconButton onClick={() => copy(urlInfo?.shortUrl)}>
                                <CopyIcon size={20} fill="#979797" style={{ marginRight: '10px' }} />
                            </IconButton>
                        </Popover.Trigger>
                        <Popover.Content>
                            <Text css={{ p: "$5" }}>Copied!</Text>
                        </Popover.Content>
                    </Popover>
                    <Link target='_blank' href={urlInfo?.shortUrl}>{urlInfo?.shortUrl}</Link>
                </div>
                <Text size={14}>Original Link</Text>
                <div style={{ display: 'flex', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden',  }}>
                    <Popover placement='left'>
                        <Popover.Trigger>
                            <IconButton onClick={() => copy(urlInfo?.link)}>
                                <CopyIcon size={20} fill="#979797" style={{ marginRight: '10px' }} />
                            </IconButton>
                        </Popover.Trigger>
                        <Popover.Content>
                            <Text css={{ p: "$5" }}>Copied!</Text>
                        </Popover.Content>
                    </Popover>
                    <Link target='_blank' href={urlInfo?.link}>{urlInfo?.link}</Link>
                </div>
                <div>
                    <Text size={14}>Shares</Text>
                    <Grid.Container gap={1}>
                        <Grid md={3}>
                            <div style={{ display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
                                <SocialShareBtn text="Facebook" color="primary" url={`${urlInfo?.shortUrl}?from=fb`} />
                            </div>
                        </Grid>
                        <Grid md={3}>
                            <div style={{ display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
                                <SocialShareBtn text="Instagram" color="secondary" url={`${urlInfo?.shortUrl}?from=ig`} />
                            </div>
                        </Grid>
                        <Grid md={3}>
                            <div style={{ display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
                                <SocialShareBtn text="Tiktok" color="warning" url={`${urlInfo?.shortUrl}?from=tt`} />
                            </div>
                        </Grid>
                        <Grid md={3}>
                            <div style={{ display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
                                <SocialShareBtn text="Youtube" color="error" url={`${urlInfo?.shortUrl}?from=yt`} />
                            </div>
                        </Grid>
                    </Grid.Container>
                </div>
                <div>
                    <Text size={14}>Visits</Text>
                    <VisitTable visits={urlInfo?.visits ?? []} />
                </div>
            </Modal.Body>
            <Modal.Footer>
            </Modal.Footer>
        </Modal>
    );
}