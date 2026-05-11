import type { ChangeEvent, KeyboardEvent, Ref } from 'react';
import styles from './FloatingInput.module.css';

type FloatingInputProps = {
    strLibelleLabel: string;
    strID?: string;
    inputRef?: Ref<HTMLInputElement>;
    strTypeInput: string;
    value: string;
    cbOnChange?: (event: ChangeEvent<HTMLInputElement>) => void;
    cbOnKeyDown?: (event: KeyboardEvent<HTMLInputElement>) => void;
};

function FloatingInput ({strLibelleLabel, strID, inputRef, strTypeInput, value, cbOnChange, cbOnKeyDown}: FloatingInputProps) {

    return (
            <div className={`form-floating ${styles.floatingInput} mb-3`}>
                <input type={strTypeInput} className={`form-control ${styles.floatingInputDarkmode}`} id={strID} ref={inputRef} value={value} onChange={cbOnChange ? ((e) => cbOnChange(e)) : undefined} onKeyDown={cbOnKeyDown ? (e) => cbOnKeyDown(e) : undefined} placeholder="name@example.com"/>
                <label className={styles.floatingLabelDarkMode} htmlFor={strID}>{strLibelleLabel}</label>
            </div>
    )
};

export default FloatingInput;
