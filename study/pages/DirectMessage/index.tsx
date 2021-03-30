import React, {useCallback, useEffect, useRef} from 'react'
import useSWR, {useSWRInfinite} from "swr";
import {useParams} from "react-router-dom";
import fetcher from "@utils/fetcher";
import {Container, Header} from "@pages/Channel/styles";
import gravatar from 'gravatar'
import {IDM, IUser} from "@typings/db";
import ChatBox from "@components/ChatBox";
import ChatList from '@components/ChatList';
import useInput from "@hooks/useInput";
import axios from "axios";
import makeSection from "@utils/makeSection";
import Scrollbars from "react-custom-scrollbars";
import useSocket from "@hooks/useSocket";

const DirectMessage = () => {
    const scrollbarRef = useRef<Scrollbars>(null)
    const {workspace, id} = useParams<{workspace: string; id: string}>()
    const [chat, onChangeChat, setChat] = useInput('');
    const [socket, disconnect] = useSocket(workspace)
    const {data: userData} = useSWR<IUser>(`/api/workspaces/${workspace}/users/${id}`, fetcher)
    const {data: myData} = useSWR<IUser>(`/api/users`, fetcher)

    const { data: chatData, mutate: mutateChat, revalidate, setSize } = useSWRInfinite<IDM[]>(
        (index)=>`/api/workspaces/${workspace}/dms/${id}/chats?perPage=20&page=${index + 1}`,
        fetcher,
    );
    //[[{id: 1}, {id:2}], [{id:3}]]

    const isEmpty = chatData?.[0]?.length === 0;
    const isReachingEnd = isEmpty || (chatData && chatData[chatData.length -1]?.length < 20) || false

    const onSubmitForm = useCallback((e)=>{
        e.preventDefault()
        if(chat?.trim() && chatData && myData && userData) {
            const savedChat = chat;
            mutateChat((prevChatData)=>{
                prevChatData?.[0].unshift({
                    id: (chatData[0][0]?.id || 0) + 1,
                    content: savedChat,
                    SenderId: myData.id,
                    Sender: myData,
                    ReceiverId: userData.id,
                    Receiver: userData,
                    createdAt: new Date(),
                })
                return prevChatData
            }, false)
                .then(()=>{
                    setChat("")
                    scrollbarRef.current?.scrollToBottom()
                })
            axios.post(`/api/workspaces/${workspace}/dms/${id}/chats`, {
                content : chat,
            }).then(()=>{
                revalidate()
            }).catch(console.error)
        }
    },[chat, chatData, userData])
    const onMessage = useCallback((data: IDM) => {
        // id는 상대방 아이디
        if (data.SenderId === Number(id) && myData && myData.id !== Number(id)) {
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
    }, [myData]);

    useEffect(()=>{
        socket?.on("dm", onMessage)
        return ()=>{
            socket?.off("dm", onMessage)
        }
    },[socket, onMessage])

    useEffect(()=>{
        //로딩시 스크롤바 제일 아래로
        if(chatData?.length === 1) {
            console.log("1!@312")
            scrollbarRef.current?.scrollToBottom()
        }
    },[chatData, myData])



    if(!userData || !myData) {
        // 로딩중 및 에러일 때
        return null;
    }

    const chatSections = makeSection(chatData ? chatData.flat().reverse() : [])

    return <Container>
        <Header>
            <img src={gravatar.url(userData.email, {s:'24px', d: 'retro'})} alt={userData.nickname}/>
            <span>{userData.nickname}</span>
        </Header>
        <ChatList chatSections={chatSections} ref={scrollbarRef} setSize={setSize} isEmpty={isEmpty} isReachingEnd={isReachingEnd}/>
        <ChatBox chat={chat} onChangeChat={onChangeChat} onSubmitForm={onSubmitForm}>asd</ChatBox>
    </Container>
}
export default DirectMessage