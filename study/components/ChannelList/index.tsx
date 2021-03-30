import React, {useCallback, useState} from 'react'
import useSWR from "swr";
import {IChannel, IUser} from "@typings/db";
import fetcher from "@utils/fetcher";
import {NavLink, useParams} from "react-router-dom";
import { CollapseButton } from '@components/DMList/style';

const ChannelList = () => {

    const [channelCollapse, setChannelCollapse] = useState(false);

    const toggleChannelCollapse = useCallback(() => {
        setChannelCollapse((prev) => !prev);
    }, []);

    const {workspace} = useParams<{workspace: string}>()
    const {data: userData, error, revalidate, mutate} = useSWR<IUser | false>("/api/users", fetcher,{
        dedupingInterval: 2000, // 2초
    })
    const { data: channelData } = useSWR<IChannel[]>(userData ? `/api/workspaces/${workspace}/channels` : null, fetcher);

    return <>
        <h2>
            <CollapseButton collapse={channelCollapse} onClick={toggleChannelCollapse}>
                <i
                    className="c-icon p-channel_sidebar__section_heading_expand p-channel_sidebar__section_heading_expand--show_more_feature c-icon--caret-right c-icon--inherit c-icon--inline"
                    data-qa="channel-section-collapse"
                    aria-hidden="true"
                />
            </CollapseButton>
            <span>Channels</span>
        </h2>
        <div>
            {!channelCollapse &&
            channelData?.map((channel) => {
                return (
                    <NavLink
                        key={channel.name}
                        activeClassName="selected"
                        to={`/workspace/${workspace}/channel/${channel.name}`}
                    >
                        <span># {channel.name}</span>
                    </NavLink>
                );
            })}
        </div>
    </>
}
export default ChannelList