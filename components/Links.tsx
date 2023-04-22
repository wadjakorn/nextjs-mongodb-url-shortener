import { useState, useEffect } from 'react'
import { Table, Row, Col, Text, Link, Button, Popover, Badge, Loading, Input, Checkbox } from '@nextui-org/react';
import { UrlInfo, RespData, CreateRespData, DeleteRespData, Column } from '../types';
import { IconButton } from './IconButton';
import { EyeIcon } from './EyeIcon';
import { CopyIcon } from './CopyIcon';
import { useRouter } from 'next/router'
import styles from '../styles/Table.module.css'
import { ViewLinkDetails } from './ViewLinkDetails';
import { copy } from '../utils';
import { CreateLink } from './CreateLink';
import { DeleteIcon } from './DeleteIcon';
import { DeleteLink } from './DeleteLink';

export default function Links() {
    const router = useRouter()
    // console.log({ query: router.query })
    const [showCreateForm, setShowCreateForm] = useState(false)
    const [showItemDetails, setShowItemDetails] = useState<UrlInfo>(null)
    const [resp, setResp] = useState<RespData>(null)
    const [totalPages, setTotalPages] = useState(0)
    const [page, setPage] = useState(Number(router.query.page ?? 1))
    const [limit, setLimit] = useState(10)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState<string>(null)
    const [refresh, setRefresh] = useState(false)
    const [loading, setLoading] = useState(true)
    const [searchText, setSearchText] = useState((router.query.search as string) ?? '')
    const [searchRules, setSearchRules] = useState(router.query.searchRules ? (router.query.searchRules as string).split(',') : ['title', 'hash', 'tags'])
    const [createdResp, setCreatedResp] = useState<CreateRespData>(null)
    const [deletedResp, setDeletedResp] = useState<DeleteRespData>(null)

    useEffect(() => {
        let options = '';
        if (searchText) {
            options = `&search=${searchText}`
        }
        if (searchRules.length) {
            options += `&searchRules=${searchRules.join(',')}`
        }
        fetch(`/api/links?limit=${limit}&page=${page}${options}`)
            .then((res) => res.json())
            .then((resp: RespData) => {
                console.log({ resp })
                setResp(resp)
                setTotalPages(Math.ceil(resp.totalLinks / limit))
                setLoading(false)
                router.push({
                    pathname: '/',
                    query: {
                        search: searchText,
                        page: page,
                        searchRules: searchRules.join(','),
                    },
                })
            })
    }, [page, createdResp, deletedResp, refresh])

    useEffect(() => {
        if (refresh) {
            setLoading(true)
        } else {
            setLoading(false)
        }
    }, [refresh])

    const columns: Column[] = [
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
        // return router.push({
        //     pathname: '/',
        //     query: { page: gotoPage },
        // })
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

    function renderActions(item: UrlInfo) {
        return (
        <Table.Cell>
            <Row justify="center" align="center">
                <Col css={{ d: "flex" }}>
                    <IconButton onClick={() => setShowItemDetails(item)}>
                        <EyeIcon size={20} fill="#979797" />
                    </IconButton>
                    <IconButton css={{ ml:'20px' }} onClick={() => setShowDeleteConfirm(item.uid)}>
                        <DeleteIcon size={20} fill="#FF0080" />
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
        } else if (columnKey === 'tags') {
            return (
                <Table.Cell>
                    {item.tags?.map((tag) => (
                        <Badge key={tag} className={styles['tag']}>{tag}</Badge>
                    ))}
                </Table.Cell>
            )
        }
        return <Table.Cell><Text className={styles['col-width']}>{item[columnKey]}</Text></Table.Cell>
    }

    function doSearch() {
        setSearchText((document.getElementById('search-input') as HTMLInputElement).value);
        setRefresh(!refresh);
    }

    function renderTable() {
        if (loading) {
            return <Loading />
        }
        if (!resp?.data?.length) {
            return <p>No data</p>
        }
        return (<div>
            <Table 
                lined
                aria-label='table'
                aria-labelledby='table'
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
        </div>)
    }

    return (
        <div className={styles['t-container']}>
            <ViewLinkDetails item={showItemDetails} onClose={() => setShowItemDetails(null)} />
            <CreateLink open={showCreateForm} onClose={(resp: CreateRespData) => { if (!!resp) {setCreatedResp(resp)} setShowCreateForm(false) }} />
            <DeleteLink uid={showDeleteConfirm} onClose={(resp: DeleteRespData) => { if (!!resp) {setDeletedResp(resp)} setShowDeleteConfirm(null) }} />
            <div style={{ display: 'flex', justifyContent: 'space-between'}}>
                <div style={{ display: 'flex', justifyContent: 'start'}}>
                    <Input id="search-input" aria-label='search' clearable placeholder='Search...' initialValue={searchText}/>
                    <Button style={{ marginLeft: '10px' }} onPress={() => doSearch()}>
                        Find
                    </Button>
                    <div style={{ marginLeft: '20px' }}>
                        <Checkbox.Group
                            aria-label='Search Rules'
                            orientation="horizontal"
                            color="secondary"
                            defaultValue={searchRules}
                            value={searchRules}
                            onChange={(value: string[]) => setSearchRules(value)}
                        >
                            <Checkbox value="title">Title</Checkbox>
                            <Checkbox value="hash">hash</Checkbox>
                            <Checkbox value="tags">Tags</Checkbox>
                        </Checkbox.Group>
                    </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'end'}}>
                    <Button color={"warning"} onPress={() => setRefresh(!refresh)}>
                        { loading ? <Loading /> : 'Refresh'}
                    </Button>
                    <Button style={{ marginLeft: '10px' }} onPress={() => setShowCreateForm(true)}>
                        + Create Short Link
                    </Button>
                </div>
            </div>
            { renderTable() }
            
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