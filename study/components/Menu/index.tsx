import React, {CSSProperties, FC, useCallback} from 'react';
import {CloseModalButton, CreateMenu} from './styles';

interface Props {
    show: boolean
    onCloseModal: (e: any) => void
    style: CSSProperties
    closeButton?: boolean;
}

const Menu: FC<Props> = ({children, show, onCloseModal, closeButton = true, style}) => {

    const stopPropagation = useCallback((e) => {
        e.stopPropagation()
    }, [])

    if(!show) return null

    return <CreateMenu onClick={onCloseModal}>
        <div style={style} onClick={stopPropagation}>
            {closeButton && <CloseModalButton onClick={onCloseModal}>&times;</CloseModalButton>}
            {children}
        </div>
    </CreateMenu>
}

export default Menu