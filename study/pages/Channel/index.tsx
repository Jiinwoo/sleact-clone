import React, {useCallback} from 'react';
import {Container, Header} from "@pages/Channel/styles";
import useInput from "@hooks/useInput";
import ChatList from "@components/ChatList";
import ChatBox from "@components/ChatBox";


const Channel = () => {
    const [chat, onChangeChat] = useInput('')
    const onSubmitForm = useCallback((e)=>{
        e.preventDefault()
        console.log('submit')
    },[])
    return <Container>
        <Header>일반채널 test</Header>
        {/*<ChatList/>*/}
        <ChatBox chat={chat} onSubmitForm={onSubmitForm} onChangeChat={onChangeChat}/>
    </Container>
}
export default Channel