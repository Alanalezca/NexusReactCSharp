import { forwardRef } from "react";
import styles from "./InputStandard.module.css";

type InputStandardProps = {
  strID?: string;
  strPlaceholder?: string;
  strValeurByDef?: string;
  strType?: string;
  intMaxLength?: number;
  strTxtAlign?: "left" | "right" | "center" | string;
  strColor?: string;
  strMt?: string;
  strMb?: string;
  disabled?: boolean;
};

const InputStandard = forwardRef<HTMLInputElement, InputStandardProps>(
  (
    {
      strID,
      strPlaceholder,
      strValeurByDef,
      strType = "text",
      intMaxLength,
      strTxtAlign,
      strColor,
      strMt,
      strMb,
      disabled
    },
    ref
  ) => {
    return (
      <input
        className={`mt-${strMt || "0"} mb-${strMb || "0"} ${styles.input} ${
          strTxtAlign === "left"
            ? styles.txtLeft
            : strTxtAlign === "right"
              ? styles.txtRight
              : styles.txtCenter
        }`}
        type={strType}
        maxLength={intMaxLength}
        placeholder={strPlaceholder}
        defaultValue={strValeurByDef}
        id={strID}
        ref={ref}
        disabled={disabled}
        style={{ color: strColor || "white" }}
      />
    );
  }
);

export default InputStandard;