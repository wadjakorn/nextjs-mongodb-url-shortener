import { Button, Badge } from '@nextui-org/react';

export function FromRef({ text, count, color }) {
    return (
        <Badge size="lg" color="error" content={count}>
            <Button flat color={color} size="sm">{ text }</Button>
        </Badge>
    )
}
