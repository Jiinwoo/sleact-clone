import React, {MutableRefObject, useCallback, useRef, VFC} from 'react'
import {ChatZone, Section, StickyHeader} from "@components/ChatList/styles";
import {IChat, IDM} from "@typings/db";
import Chat from '@components/Chat';
import {Scrollbars} from 'react-custom-scrollbars'

interface Props {
    chatSections: { [key: string]: IDM[] }
    setSize: (size: (number | ((size: number) => number))) => Promise<IDM[][] | undefined>
    isEmpty: boolean
    isReachingEnd: boolean
}

const ChatList = React.forwardRef<Scrollbars, Props>(({chatSections, setSize, isEmpty, isReachingEnd}, ref) => {
    const onScroll = useCallback((values) => {
        if (values.scrollTop === 0 && !isReachingEnd) {
            console.log('가장 위')
            setSize((prevSize)=>prevSize+1)
                .then(()=>{
                    //스크롤 위치 유지
                    const current = (ref as MutableRefObject<Scrollbars>)?.current;
                    if (current) {
                        current.scrollTop(current.getScrollHeight() - values.scrollHeight);
                    }
                })
        }
    }, [setSize, ref])

    return <ChatZone>
        <Scrollbars autoHide={true} ref={ref} onScrollFrame={onScroll}>
            {Object.entries(chatSections).map(([date, chats]) => {
                return <Section className={`section-$${date}`} key={date}>
                    <StickyHeader>
                        <button>{date}</button>
                    </StickyHeader>
                    {chats.map((chat) => (
                        <Chat key={chat.id} data={chat}/>
                    ))}
                </Section>
            })}
        </Scrollbars>
    </ChatZone>
})

export default ChatList