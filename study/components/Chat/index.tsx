import React, {useMemo, VFC} from 'react'
import {ChatWrapper} from "@components/Chat/styles";
import {IChat, IDM} from "@typings/db";
import gravatar from 'gravatar'
import dayjs from "dayjs";
import regexifyString from "regexify-string";
import {Link, useParams} from 'react-router-dom';

interface Props {
    data: IDM | IChat
}

const Chat:VFC<Props> = ({data}) => {
    const { workspace } = useParams<{ workspace: string; channel: string }>();
    const user = "Sender" in data ? data.Sender : data.User
    // @[닉네임](7)
    // \d 숫자   + 는 1개이상 ? 는 0개 이상 g는 모두찾기
    // [닉네임]123](7)
    // +?
    const result = useMemo(()=>regexifyString({
        input: data.content,
        pattern: /@\[(.+?)]\((\d+?)\)|\n/g,
        decorator(match, index) {
            const arr: string[] | null = match.match(/@\[(.+?)]\((\d+?)\)/)!;
            if(arr) {
                return (
                    <Link key={match + index} to={`/workspace/${workspace}/dm/${arr[2]}`}>
                        @{arr[1]}
                    </Link>
                )
            }
            return <br key={index}/>
        }
    }),[data.content])
    return <ChatWrapper>
        <div className="chat-img">
            <img src={gravatar.url(user.email, {s:'36px', d: 'retro'})} alt={user.nickname}/>
        </div>
        <div className="chat-text">
            <div className="chat-user">
                <b>{user.nickname}</b>
                <span>{dayjs(data.createdAt).format("h:mm A")}</span>
            </div>
            <p>{result}</p>
        </div>
    </ChatWrapper>
}
export default React.memo(Chat)