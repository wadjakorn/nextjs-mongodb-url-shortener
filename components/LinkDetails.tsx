import React, { useEffect } from "react";
import { Badge, Modal, Text, Grid, Popover, Link } from "@nextui-org/react";
import { UrlInfo } from "../types";
import { FromRef } from './FromRef';
import { IconButton } from './IconButton';
import { CopyIcon } from './CopyIcon';
import { copy } from '../utils';

export function LinkDetails(props: { item: UrlInfo }) {
    const [urlInfo, setUrlInfo] = React.useState(null);

    useEffect(() => {
        if (!!props.item) {
            setUrlInfo(props.item);
        } else {
            setUrlInfo(null);
        }
    }, [props])

    const closeHandler = () => {
        setUrlInfo(null);
    };

    return (
        <div>
        {/* <Text>{ urlInfo?.uid }</Text> */}
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
                    <Text size={14}>Visits</Text>
                    <Grid.Container gap={2}>
                        <Grid>
                            <FromRef color="primary" text="Facebook" count={urlInfo?.visit?.fb} />
                        </Grid>
                        <Grid>
                            <FromRef color="error" text="Youtube" count={urlInfo?.visit?.yt} />
                        </Grid>
                        <Grid>
                            <FromRef color="secondary" text="Instagram" count={urlInfo?.visit?.ig} />
                        </Grid>
                        <Grid>
                            <FromRef color="warning" text="Tiktok" count={urlInfo?.visit?.tt} />
                        </Grid>
                    </Grid.Container>
                </div>
                {/* <Input 
                    clearable
                    label="Original Link"
                    initialValue={urlInfo?.link} 
                /> */}
                
            </Modal.Body>
            <Modal.Footer>
            {/* <Button auto flat color="error" onPress={closeHandler}>
                Close
            </Button> */}
            </Modal.Footer>
        </Modal>
        </div>
    );
}