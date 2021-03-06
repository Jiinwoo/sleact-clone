
import React, {FormEvent, useCallback, useState, VFC} from 'react';
import { Success, Form, Error, Label, Input, LinkContainer, Button, Header } from './styles';
import { Link, Redirect } from 'react-router-dom';
import axios from 'axios'
import useInput from "@hooks/useInput";
import useSWR from "swr";
import fetcher from "@utils/fetcher";

const SignUp = () => {
    const {data, error, revalidate} = useSWR("/api/users", fetcher)


    const [email, onChangeEmail] = useInput("")
    const [nickname, onChangeNickname] = useInput("")
    const [password, setPassword] = useState("")
    const [passwordCheck, setPasswordCheck] = useState("")
    const [mismatchError, setMismatchError] = useState(false);
    const [signUpError, setSignUpError] = useState('');
    const [signUpSuccess, setSignUpSuccess] = useState(false);


    const onSubmit = useCallback((e: FormEvent<HTMLFormElement>)=>{
        e.preventDefault()
        if(mismatchError || !nickname) return;
        console.log(email, nickname, password, passwordCheck)
        setSignUpError('');
        setSignUpSuccess(false);
        axios
            .post('/api/users', {
                email,
                nickname,
                password,
            })
            .then((response) => {
                console.log(response);
                setSignUpSuccess(true);
            })
            .catch((error) => {
                console.log(error.response);
                setSignUpError(error.response.data);
            })
            .finally(() => {});

    },[email, nickname, password, passwordCheck, mismatchError])

    const onChangePassword = useCallback(
        (e) => {
            setPassword(e.target.value);
            setMismatchError(e.target.value !== passwordCheck);
        },
        [passwordCheck],
    );

    const onChangePasswordCheck = useCallback(
        (e) => {
            setPasswordCheck(e.target.value);
            setMismatchError(e.target.value !== password);
        },
        [password],
    );

    if (data === undefined) {
        return <div>?????????...</div>;
    }

    if(data) {
        return <Redirect to={"/workspace/channel"}/>
    }

    return (
        <div id="container">
            <Header>Sleact</Header>
            <Form onSubmit={onSubmit}>
                <Label id="email-label">
                    <span>????????? ??????</span>
                    <div>
                        <Input type="email" id="email" name="email" value={email} onChange={onChangeEmail} />
                    </div>
                </Label>
                <Label id="nickname-label">
                    <span>?????????</span>
                    <div>
                        <Input type="text" id="nickname" name="nickname" value={nickname} onChange={onChangeNickname} />
                    </div>
                </Label>
                <Label id="password-label">
                    <span>????????????</span>
                    <div>
                        <Input type="password" id="password" name="password" value={password} onChange={onChangePassword} />
                    </div>
                </Label>
                <Label id="password-check-label">
                    <span>???????????? ??????</span>
                    <div>
                        <Input
                            type="password"
                            id="password-check"
                            name="password-check"
                            value={passwordCheck}
                            onChange={onChangePasswordCheck}
                        />
                    </div>
                    {mismatchError && <Error>??????????????? ???????????? ????????????.</Error>}
                    {!nickname && <Error>???????????? ??????????????????.</Error>}
                    {signUpError && <Error>{signUpError}</Error>}
                    {signUpSuccess && <Success>???????????????????????????! ?????????????????????.</Success>}
                </Label>
                <Button type="submit">????????????</Button>
            </Form>
            <LinkContainer>
                ?????? ???????????????????&nbsp;
                <Link to="/login">????????? ????????????</Link>
            </LinkContainer>
        </div>
    );
};

export default SignUp;
