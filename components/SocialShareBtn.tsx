import { Button, Popover, Text } from '@nextui-org/react';
import { IconButton } from './IconButton';
import { CopyIcon } from './CopyIcon';
import { copy } from '../utils';

export function SocialShareBtn({ text, color, url }) {
    return (
        <Popover placement='top'>
            <Popover.Trigger>
                <Button 
                    flat 
                    color={color} 
                    size="sm" 
                    icon={
                        <IconButton>
                            <CopyIcon size={20} fill="#979797" />
                        </IconButton>
                    }
                    onClick={() => copy(url)}>
                    { text }
                </Button>
            </Popover.Trigger>
            <Popover.Content>
                <Text css={{ p: "$5" }}>Copied!</Text>
            </Popover.Content>
        </Popover>
    )
}
