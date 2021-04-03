import React, {useCallback, useEffect, useRef, useState} from 'react';
import {Container, Header} from "@pages/Channel/styles";
import useInput from "@hooks/useInput";
import ChatList from "@components/ChatList";
import ChatBox from "@components/ChatBox";
import Scrollbars from "react-custom-scrollbars";
import {useParams} from "react-router-dom";
import useSocket from "@hooks/useSocket";
import useSWR, {useSWRInfinite} from "swr";
import {IChannel, IChat, IUser} from "@typings/db";
import fetcher from "@utils/fetcher";
import axios from "axios";
import makeSection from "@utils/makeSection";
import gravatar from "gravatar";
import InviteChannelModal from "@components/InviteChannelModal";


const Channel = () => {
    const scrollbarRef = useRef<Scrollbars>(null)
    const {workspace, channel} = useParams<{workspace: string; channel: string}>()
    const [chat, onChangeChat, setChat] = useInput('');
    const [socket, disconnect] = useSocket(workspace)
    const [showInviteChannelModal, setShowInviteChannelModal] = useState(false);

    const {data: myData} = useSWR<IUser>(`/api/users`, fetcher)
    const {data: channelMembersData} = useSWR<IUser[]>(
        myData ?`/api/workspaces/${workspace}/channels/${channel}members` : null, fetcher)

    const {data : channelData} = useSWR<IChannel>(myData ? `/api/workspaces/${workspace}/channels/${channel}` : null, fetcher)
    const { data: chatData, mutate: mutateChat, revalidate, setSize } = useSWRInfinite<IChat[]>(
        (index)=>`/api/workspaces/${workspace}/channels/${channel}/chats?perPage=20&page=${index + 1}`,
        fetcher,
    );
    //[[{id: 1}, {id:2}], [{id:3}]]

    const isEmpty = chatData?.[0]?.length === 0;
    const isReachingEnd = isEmpty || (chatData && chatData[chatData.length -1]?.length < 20) || false

    const onSubmitForm = useCallback((e)=>{
        e.preventDefault()
        if(chat?.trim() && chatData && myData && channelData) {
            const savedChat = chat;
            mutateChat((prevChatData)=>{
                prevChatData?.[0].unshift({
                    id: (chatData[0][0]?.id || 0) + 1,
                    content: savedChat,
                    UserId: myData.id,
                    User: myData,
                    ChannelId: channelData.id,
                    Channel: channelData,
                    createdAt: new Date(),
                })
                return prevChatData
            }, false)
                .then(()=>{
                    setChat("")
                    scrollbarRef.current?.scrollToBottom()
                })
            axios.post(`/api/workspaces/${workspace}/channels/${channel}/chats`, {
                content : chat,
            }).then(()=>{
                revalidate()
            }).catch(console.error)
        }
    },[chat, chatData, channelData, workspace])
    const onMessage = useCallback((data: IChat) => {
        // id는 상대방 아이디
        if (data.Channel.name === channel && data.UserId !== myData?.id) {
            mutateChat((chatData) => {
                chatData?.[0].unshift(data);
                return chatData;
            }, false).then(() => {
                if (scrollbarRef.current) {
                    if (
                        scrollbarRef.current.getScrollHeight() <
                        scrollbarRef.current.getClientHeight() + scrollbarRef.current.getScrollTop() + 150
                    ) {
                        console.log('scrollToBottom!', scrollbarRef.current?.getValues());
                        setTimeout(() => {
                            scrollbarRef.current?.scrollToBottom();
                        }, 50);
                    }
                }
            });
        }
    }, [myData, channel]);

    const onClickInviteChannel = useCallback(()=>{
        setShowInviteChannelModal(true);
    },[])
    const onCloseModal = useCallback(() => {
        setShowInviteChannelModal(false);
    }, []);

    useEffect(()=>{
        socket?.on("message", onMessage)
        return ()=>{
            socket?.off("message", onMessage)
        }
    },[socket, onMessage])

    useEffect(()=>{
        //로딩시 스크롤바 제일 아래로
        if(chatData?.length === 1) {
            console.log("1!@312")
            scrollbarRef.current?.scrollToBottom()
        }
    },[chatData, myData])



    if(!myData) {
        // 로딩중 및 에러일 때
        return null;
    }

    const chatSections = makeSection(chatData ? chatData.flat().reverse() : [])

    return <Container>
        <Header>
            <span>#{channel}</span>
            <div className="header-right">
                <span>{channelMembersData?.length}</span>
                <button
                    onClick={onClickInviteChannel}
                    className="c-button-unstyled p-ia__view_header__button"
                    aria-label="Add people to #react-native"
                    data-sk="tooltip_parent"
                    type="button"
                >
                    <i className="c-icon p-ia__view_header__button_icon c-icon--add-user" aria-hidden="true" />
                </button>
            </div>
        </Header>
        <ChatList chatSections={chatSections} ref={scrollbarRef} setSize={setSize} isEmpty={isEmpty} isReachingEnd={isReachingEnd}/>
        <ChatBox chat={chat} onChangeChat={onChangeChat} onSubmitForm={onSubmitForm}>asd</ChatBox>
        <InviteChannelModal
            show={showInviteChannelModal}
            onCloseModal={onCloseModal}
            setShowInviteChannelModal={setShowInviteChannelModal}
        />
    </Container>
}
export default Channel