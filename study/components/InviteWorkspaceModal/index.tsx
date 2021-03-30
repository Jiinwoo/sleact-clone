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
    setShowInviteWorkspaceModal: (flag: boolean) => void;
}

const InviteWorkspaceModal: VFC<Props> = ({show, onCloseModal, setShowInviteWorkspaceModal})=>{
    const {workspace, channel} = useParams<{workspace: string, channel: string}>()
    const [newMember, onChangeNewMember, setNewMember] = useInput('');

    const { data: userData,} = useSWR<IUser | false>('/api/users', fetcher);
    const {  revalidate: revalidateMembers } = useSWR<IChannel[]>(
        userData ? `/api/workspaces/${workspace}/members` : null,
        fetcher,
    );

    const onInviteMember = useCallback(
        (e) => {
            e.preventDefault();
            if(!newMember || !newMember.trim()) return
            axios
                .post(
                    `/api/workspaces/${workspace}/members`,
                    {
                        email: newMember,
                    }
                )
                .then((response) => {
                    revalidateMembers();
                    setShowInviteWorkspaceModal(false);
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
                <span>이메일</span>
                <Input id="member" value={newMember} onChange={onChangeNewMember} />
            </Label>
            <Button type="submit">초대하기</Button>
        </form>
    </Modal>
}

export default InviteWorkspaceModal