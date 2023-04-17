import { useState, useEffect } from 'react'
import { Table, Row, Col, Text, Link, Button, Popover } from '@nextui-org/react';
import { UrlInfo, RespData } from '../types';
import { IconButton } from './IconButton';
import { EyeIcon } from './EyeIcon';
import { CopyIcon } from './CopyIcon';
import { useRouter } from 'next/router'
import styles from '../styles/Table.module.css'
import { LinkDetails } from './LinkDetails';
import { copy } from '../utils';

export default function Links() {
    const router = useRouter()
    const [selectedItem, setSelected] = useState<UrlInfo>(null)
    const [resp, setResp] = useState<RespData>(null)
    const [totalPages, setTotalPages] = useState(0)
    const [page, setPage] = useState(Number(router.query.page ?? 1))
    const [limit, setLimit] = useState(10)
    useEffect(() => {
        fetch(`/api/links?limit=${limit}&page=${page}`)
            .then((res) => res.json())
            .then((resp: RespData) => {
                console.log({ resp })
                setResp(resp)
                setTotalPages(Math.ceil(resp.totalLinks / limit))
            })
    }, [page, limit])

    if (!resp) return <p>Loading...</p>
    if (resp && !resp?.data?.length) return <p>No data</p>

    const columns = [
    {
        key: "title",
        label: "title",
    },
    {
        key: "shortUrl",
        label: "short URL",
    },
    {
        key: "tags",
        label: "tags",
    },
    {
        key: "actions",
        label: "actions",
    },
    ];

    const paging = (gotoPage: number) => {
        console.log({ gotoPage })
        if (gotoPage > totalPages || gotoPage < 1) {
            return
        }
        setPage(gotoPage)
        return router.push({
            pathname: '/',
            query: { page: gotoPage },
        })
    }

    const renderPagination = () => {
        const maxShow = 2
        const start = Math.max(1, page - maxShow)
        const end = Math.min(totalPages, page + maxShow)
        const pages = []
        for (let i = start; i <= end; i++) {
            pages.push(i)
        }
        return (<Button.Group>
            <Button 
                onPress={() => paging(page-1)}
                disabled={page <= 1}
            >prev</Button>
            {
                pages.map((p) => (
                    <Button
                        key={p}
                        onPress={() => paging(p)}
                        disabled={p === page}
                    >
                        {p}
                    </Button>
                ))
            }
            <Button 
                onPress={() => paging(page+1)}
                disabled={page >= totalPages}
            >next</Button>
        </Button.Group>)
    }


    function renderShortlink(urlInfo: UrlInfo) {
        return (
            <Table.Cell>
                <div style={{ display: 'flex' }}>
                    <Popover placement='left'>
                        <Popover.Trigger>
                            <IconButton onClick={() => copy(urlInfo.shortUrl)}>
                                <CopyIcon size={20} fill="#979797" style={{ marginRight: '10px' }} />
                            </IconButton>
                        </Popover.Trigger>
                        <Popover.Content>
                            <Text css={{ p: "$5" }}>Copied!</Text>
                        </Popover.Content>
                    </Popover>
                    <Link target='_blank' href={urlInfo.shortUrl}>{urlInfo.shortUrl}</Link>
                </div>
            </Table.Cell>
        )
    }

    function openLinkDetails(item: UrlInfo) {
        setSelected(item)
    }

    function renderActions(item: UrlInfo) {
        return (
        <Table.Cell>
            <Row justify="center" align="center">
                <Col css={{ d: "flex" }}>
                    <IconButton onClick={() => openLinkDetails(item)}>
                        <EyeIcon size={20} fill="#979797" />
                    </IconButton>
                </Col>
            </Row>
        </Table.Cell>
        )
    }

    function renderCell(item: UrlInfo, columnKey: string) {
        if (columnKey[0] === ".") {
            return <Table.Cell>{getNested(item, columnKey)}</Table.Cell>
        } else if (columnKey === 'shortUrl') {
            return (renderShortlink(item)
            )
        } else if (columnKey === "actions") {
            return renderActions(item);
        }
        return <Table.Cell><Text className={styles['col-width']}>{item[columnKey]}</Text></Table.Cell>
    }
   
    return (
        <div className={styles['t-container']}>
            <LinkDetails item={selectedItem}></LinkDetails>
            <Table 
                lined
                aria-label="Example table with static content"
                selectionMode="single"
                css={{
                    height: "auto",
                    minWidth: "100%",
                }}
            >
                <Table.Header columns={columns}>
                    {(column) => (
                        <Table.Column key={column.key}>{column.label}</Table.Column>
                    )}
                </Table.Header>
                <Table.Body items={resp.data}>
                    {(item: UrlInfo) => (
                    <Table.Row key={item.uid}>
                        {(columnKey: string) => renderCell(item, columnKey)}
                    </Table.Row>
                    )}
                </Table.Body>
            </Table>
            <div className={styles['f-center']}>
                <Text size="$md">Total links: {resp.totalLinks}</Text>
            </div>
            <div className={styles['f-center']}>
                {renderPagination()}
            </div>
        </div>
    )
}



function getNested(urlInfo: UrlInfo, key: string) {
    const keys = key.slice(1).split('.')
    return getNestedVal(urlInfo, keys)
}

function getNestedVal(data: any, keys: string[]) {
    if (keys.length)
        return getNestedVal(data[keys[0]], keys.slice(1))
    return data
}