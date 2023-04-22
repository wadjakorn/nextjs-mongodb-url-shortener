import { Table } from "@nextui-org/react";
import { Visit, Column } from "../types";

export function VisitTable(props: { visits : Visit[] }) {
    const { visits } = props
    const columns: Column[] = [
        {
            key: "from",
            label: "from",
        },
        {
            key: "count",
            label: "count",
        },
    ]

    function renderRow(visit: Visit) {
        return (
            <Table.Row >
                <Table.Cell>{ visit.from }</Table.Cell>
                <Table.Cell>{ visit.count }</Table.Cell>
            </Table.Row>
        )
    }

    function renderColumn(column: Column) {
        return (
            <Table.Column key={column.key} >{column.label}</Table.Column>
        )
    }

    return (
        <Table
            lined
            headerLined
            shadow={false}
        >
            <Table.Header>
                {columns.map((column) => renderColumn(column))}
            </Table.Header>
            <Table.Body>
                {visits.map((v) => renderRow(v))}
            </Table.Body>
        </Table>
    )
}