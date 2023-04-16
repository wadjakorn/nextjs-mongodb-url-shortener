import { useState, useEffect } from 'react'
import { Table, Row, Col, Tooltip, Text, Button, Collapse } from '@nextui-org/react';
import { UrlInfo, RespData } from '../types';
import { IconButton } from './IconButton';
import { EyeIcon } from './EyeIcon';
import { EditIcon } from './EditIcon';
import { DeleteIcon } from './DeleteIcon';
import { useRouter } from 'next/router'
import styles from '../styles/Table.module.css'

export default function Links() {
    const router = useRouter()
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

    if (!resp?.data?.length) return <p>No data</p>

    const columns = [
    {
        key: "title",
        label: "title",
    },
    // {
    //     key: "link",
    //     label: "original URL",
    // },
    {
        key: "shortUrl",
        label: "short URL",
    },
    {
        key: "copy",
        label: "copy",
    },
    {
        key: "tags",
        label: "tags",
    },
    {
        key: ".visit.yt",
        label: "yt",
    },
    {
        key: ".visit.fb",
        label: "fb",
    },
    {
        key: ".visit.tt",
        label: "tt",
    },
    {
        key: ".visit.ig",
        label: "tg",
    },
    // {
    //     key: "actions",
    //     label: "actions",
    // },
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
   
    return (
        <div className={styles['t-container']}>
            <Table 
                lined
                aria-label="Example table with static content"
                css={{
                    height: "auto",
                    minWidth: "100%",
                }}
                selectionMode="single"
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

function renderCell(item: UrlInfo, columnKey: string) {
        if (columnKey[0] === ".") {
            return <Table.Cell>{getNested(item, columnKey)}</Table.Cell>
        } else if (columnKey === "copy") {
            return (<Table.Cell>
                <IconButton onClick={() => navigator.clipboard.writeText(item.shortUrl)}>
                    <Tooltip
                        content={"copied!"}
                        trigger="click"
                        color="primary"
                    >
                        ©️
                    </Tooltip>
                </IconButton>
            </Table.Cell>)
        } else if (columnKey === 'shortUrl') {
            return (
                <Table.Cell>
                    <Collapse divider={false} title={item[columnKey]} className={styles['url-width']}>
                        <IconButton onClick={() => navigator.clipboard.writeText(item.link)}>
                            <Tooltip
                                content={"copied!"}
                                trigger="click"
                                color="primary"
                                placement='bottom'
                            >
                                <Text>
                                    {item.link}
                                </Text>
                            </Tooltip>
                        </IconButton>
                    </Collapse>
                </Table.Cell>
            )
        } else if (columnKey === "actions") {
            return (
                <Table.Cell><Row justify="center" align="center">
                    <Col css={{ d: "flex" }}>
                    <Tooltip content="Details">
                        <IconButton onClick={() => console.log("View user", 1)}>
                        <EyeIcon size={20} fill="#979797" />
                        </IconButton>
                    </Tooltip>
                    </Col>
                    <Col css={{ d: "flex" }}>
                    <Tooltip content="Edit user">
                        <IconButton onClick={() => console.log("Edit user", 1)}>
                        <EditIcon size={20} fill="#979797" />
                        </IconButton>
                    </Tooltip>
                    </Col>
                    <Col css={{ d: "flex" }}>
                    <Tooltip
                        content="Delete user"
                        color="error"
                        onClick={() => console.log("Delete user", 1)}
                    >
                        <IconButton>
                        <DeleteIcon size={20} fill="#FF0080" />
                        </IconButton>
                    </Tooltip>
                    </Col>
                </Row></Table.Cell>
                );
        }
        return <Table.Cell>{item[columnKey]}</Table.Cell>
    }