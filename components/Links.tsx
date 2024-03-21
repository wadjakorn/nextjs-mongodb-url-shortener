import { useState, useEffect } from 'react'
import { Table, Row, Col, Text, Link, Button, Popover, Badge, Loading, Input, Checkbox, Container, useAsyncList, SortDescriptor } from '@nextui-org/react';
import { UrlInfo, RespDataList, CreateRespData, DeleteRespData, Column, StatsResp, RedisStats } from '../types';
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
import { ExlinkIcon } from './ExlinkIcon';
import TopboxStyle from '../styles/TopBox.module.css';

const columns: Column[] = [
    {
        key: "createdAt",
        label: "created at",
        allowsSorting: true,
    },
    // {
    //     key: "latestClick",
    //     label: "latest click",
    //     allowsSorting: true,
    // },
    // {
    //     key: "visits",
    //     label: "visits",
    //     allowsSorting: false,
    // },
    {
        key: "title",
        label: "title",
        allowsSorting: true,
    },
    {
        key: "shortUrl",
        label: "short URL",
        allowsSorting: true,
    },
    {
        key: "tags",
        label: "tags",
        allowsSorting: false,
    },
    {
        key: "actions",
        label: "actions",
        allowsSorting: false,
    },
];


export default function Links() {
    const router = useRouter()
    const [showCreateForm, setShowCreateForm] = useState(false)
    const [showItemDetails, setShowItemDetails] = useState<UrlInfo>(null)
    const [resp, setResp] = useState<RespDataList>(null)
    const [totalPages, setTotalPages] = useState(0)
    const [page, setPage] = useState(Number(router.query.page ?? 1))
    const [limit, setLimit] = useState(25)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState<string>(null)
    const [refresh, setRefresh] = useState(false)
    const [loading, setLoading] = useState(true)
    const [searchText, setSearchText] = useState((router.query.search as string) ?? '')
    const [searchRules, setSearchRules] = useState(router.query.searchRules ? (router.query.searchRules as string).split(',') : ['title', 'uid', 'tags'])
    const [createdResp, setCreatedResp] = useState<CreateRespData>(null)
    const [deletedResp, setDeletedResp] = useState<DeleteRespData>(null)
    const [errorMsg, setErrorMsg] = useState<string>(null)
    const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
        column: 'createdAt',
        direction: 'descending'
    })

    useEffect(() => {
        setLoading(true)
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
        let options = '';
        if (searchText) {
            options = `&search=${searchText}`
        }
        if (searchRules.length) {
            options += `&searchRules=${searchRules.join(',')}`
        }
        if (sortDescriptor) {
            options += `&sortBy=${sortDescriptor.column}`
            options += `&sortDir=${sortDescriptor.direction == 'ascending' ? 'asc' : 'desc'}`
        }

        fetch(`/api/links?limit=${limit}&page=${page}${options}`, { headers } )
            .then((res) => res.json())
            .then((resp: RespDataList) => {
                if (resp.code === 401 || resp.code === 403) {
                    router.push('/login')
                    return;
                }
                if (resp.code !== 200) {
                    setErrorMsg('unknown error')
                    return;
                }
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
    }, [page, createdResp, deletedResp, refresh, sortDescriptor])

    // useEffect(() => {
    //     if (refresh) {
    //         setLoading(true)
    //     } else {
    //         setLoading(false)
    //     }
    // }, [refresh])


    const paging = (gotoPage: number) => {
        if (gotoPage > totalPages || gotoPage < 1) {
            return
        }
        setLoading(true)
        setPage(gotoPage)
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
                    <IconButton onClick={() => openDetails(item)}>
                        <EyeIcon size={20} fill="#782ac8" />
                    </IconButton>
                    <IconButton css={{ ml:'20px' }} onClick={() => openDetailsFull(item)}>
                        <ExlinkIcon size={20} fill="#0072f5" />
                    </IconButton>
                    <IconButton css={{ ml:'20px' }} onClick={() => setShowDeleteConfirm(item.uid)}>
                        <DeleteIcon size={20} fill="#FF0080" />
                    </IconButton>
                </Col>
            </Row>
        </Table.Cell>
        )
    }

    function renderTags(item: UrlInfo) {
        return (
            <Table.Cell>
                {item.tags?.map((tag) => (
                    <Badge key={tag} className={styles['tag']}>{tag}</Badge>
                ))}
            </Table.Cell>
        )
    }

    function renderVisits(item: UrlInfo) {
        return (
            <Table.Cell>
                {item.visits?.reduce((total, v) => { if(v.from && v.from !== 'unknown') {total+=v.count;} return total; } ,0)}
            </Table.Cell>
        )
    }

    function renderCell(item: UrlInfo, columnKey: string) {
        switch (columnKey) {
            case 'shortUrl':
                return renderShortlink(item)
            case 'actions':
                return renderActions(item)
            case 'tags':
                return renderTags(item)
            // case 'visits':
            //     return renderVisits(item)
            // case 'latestClick':
            //     let dateStr = '';
            //     if (item[columnKey]) {
            //         dateStr = dayjs(item[columnKey]).format('YYYY-MM-DD HH:mm:ss')
            //     }
            //     return <Table.Cell><Text className={styles['col-width']}>{dateStr}</Text></Table.Cell>
            default:
                return <Table.Cell><Text className={styles['col-width']}>{item[columnKey]}</Text></Table.Cell>
        }
    }

    function doSearch() {
        setSearchText((document.getElementById('search-input') as HTMLInputElement).value);
        setRefresh(!refresh);
    }

    async function openDetails(item: UrlInfo) {
        setShowItemDetails(await fillStats(item))
    }

    async function fillStats(item: UrlInfo): Promise<UrlInfo> {
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
        return fetch(`/api/stats/${item.uid}`, { headers } )
            .then((res) => res.json())
            .then((resp: StatsResp) => {
                if (resp.code === 401 || resp.code === 403) {
                    router.push('/login')
                    return;
                }
                if (resp.code !== 200) {
                    setErrorMsg('unknown error')
                    return;
                }
                const stats = new RedisStats(resp.data.uid).toRedisStats(resp.data)
                item.latestClick = stats.last_click
                item.visits = stats.toVisits()
                return item
            })
    }

    function openDetailsFull(item: UrlInfo) {
        router.push({
            pathname: `/links/${item.uid}`,
        })
    }

    async function resetSort() {
        setSortDescriptor({
            column: 'createdAt',
            direction: 'descending',
        })
    }

    function renderTable() {
        if (errorMsg) {
            return (
                <div style={{ display: 'flex', justifyContent: 'center'}}>
                    <Text h1>{errorMsg}</Text>
                </div>
            )
        }
        if (!resp ?? loading) {
            return (
                <div style={{ display: 'flex', justifyContent: 'center'}}>
                    <Loading />
                </div>
            )
        }
        if (!resp?.data?.length) {
            return (
                <div style={{ display: 'flex', justifyContent: 'center'}}>
                    <p>No data</p>
                </div>
            )
        }
        return (<div>
            <Table 
                aria-label='table'
                aria-labelledby='table'
                css={{
                    height: "auto",
                    minWidth: "100%",
                }}
                sortDescriptor={sortDescriptor}
                onSortChange={(descriptor: SortDescriptor) => setSortDescriptor(descriptor)}
                lined={true}
            >
                <Table.Header columns={columns}>
                    {(column) => (
                        <Table.Column key={column.key} allowsSorting={column.allowsSorting}>{column.label}</Table.Column>
                    )}
                </Table.Header>
                <Table.Body items={resp.data}>
                    {(item: UrlInfo) => (
                    <Table.Row key={item.uid}>
                        {(columnKey: string) => renderCell(item,columnKey)}
                    </Table.Row>
                    )}
                </Table.Body>
            </Table>
            <Container css={{ dflex: 'center', p: 0 ,mt: '20px'}}>
                <Text size="$md">Showing: {limit} of Total links: {resp.totalLinks}</Text>
            </Container>
            <Container css={{ dflex: 'center', p: 0 ,mt: '20px'}}>
                {renderPagination()}
            </Container>
        </div>)
    }

    return (
        <div className={styles['t-container']}>
            <ViewLinkDetails item={showItemDetails} onClose={() => setShowItemDetails(null)} />
            <CreateLink open={showCreateForm} onClose={(resp: CreateRespData) => { if (!!resp) {setCreatedResp(resp)} setShowCreateForm(false) }} />
            <DeleteLink uid={showDeleteConfirm} onClose={(resp: DeleteRespData) => { if (!!resp) {setDeletedResp(resp)} setShowDeleteConfirm(null) }} />
            <div className={TopboxStyle.topbox}>
                <div className={TopboxStyle.search}>
                    <Input className={TopboxStyle.searchInput} size='sm' fullWidth id="search-input" aria-label='search' clearable placeholder={resp?.version} initialValue={searchText}/>
                    <Button className={TopboxStyle.searchBtn} size={'sm'} onPress={() => doSearch()}>
                        Find
                    </Button>
                    <Button className={TopboxStyle.searchBtn} size={'sm'} onPress={() => resetSort()}>
                        Reset Sort
                    </Button>
                    <div className={TopboxStyle.rules}>
                        <Checkbox.Group
                            size='sm'
                            aria-label='Search Rules'
                            orientation="horizontal"
                            color="secondary"
                            defaultValue={searchRules}
                            value={searchRules}
                            onChange={(value: string[]) => setSearchRules(value)}
                        >
                            <Checkbox value="title">Title</Checkbox>
                            <Checkbox value="uid">uid</Checkbox>
                            <Checkbox value="tags">Tags</Checkbox>
                        </Checkbox.Group>
                    </div>
                </div>
                <div className={TopboxStyle.action} >
                    <Button size={'sm'} color={"warning"} onPress={() => setRefresh(!refresh)}>
                        { loading ? <Loading /> : 'Refresh'}
                    </Button>
                    <Button size={'sm'} style={{ marginLeft: '10px' }} onPress={() => setShowCreateForm(true)}>
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