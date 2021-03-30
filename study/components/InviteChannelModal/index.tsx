import React, {useCallback, VFC} from 'react'
import Modal from "@components/Modal";
import {Button, Input, Label} from "@pages/SignUp/styles";
import useInput from "@hooks/useInput";
import axios from "axios";
import { useParams } from 'react-router-dom';
import {toast} from "react-toastify";
import {IChannel, IUser} from "@typings/db";
import fetcher from "@utils/fetcher";
import useSWR from "swr";

interface Props {
    show: boolean;
    onCloseModal: () => void;
    setShowInviteChannelModal: (flag: boolean) => void;
}

const InviteChannelModal: VFC<Props> = ({show, onCloseModal, setShowInviteChannelModal})=>{
    const {workspace, channel} = useParams<{workspace: string, channel: string}>()
    const [newMember, onChangeNewMember, setNewMember] = useInput('');

    const { data: userData, error, revalidate } = useSWR<IUser | false>('/api/users', fetcher);
    const {  revalidate: revalidateMembers } = useSWR<IUser[]>(
        userData && channel ? `/api/workspaces/${workspace}/channels/${channel}/members` : null,
        fetcher,
    );

    const onInviteMember = useCallback(
        (e) => {
            e.preventDefault();
            if(!newMember || !newMember.trim()) return
            axios
                .post(
                    `/api/workspaces/${workspace}/channels/${channel}/members`,
                    {
                        email: newMember,
                    }
                )
                .then((response) => {
                    revalidateMembers();
                    setShowInviteChannelModal(false);
                    setNewMember('');
                })
                .catch((error) => {
                    console.dir(error);
                    toast.error(error.response?.data, { position: 'bottom-center' });
                });
        },
        [workspace, newMember],
    );

    return <Modal show={show} onCloseModal={onCloseModal}>
        <form onSubmit={onInviteMember}>
            <Label id="member-label">
                <span>채널 멤버 초대</span>
                <Input id="member" value={newMember} onChange={onInviteMember} />
            </Label>
            <Button type="submit">초대하기</Button>
        </form>
    </Modal>
}

export default InviteChannelModal