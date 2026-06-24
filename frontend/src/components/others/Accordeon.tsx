import { useState } from 'react';
import styles from './Accordeon.module.css';

type AccordeonMode = 'Solo' | 'Top' | 'Mid' | 'Bot';

type AccordeonProps = {
  textTitre: string;
  textMain: string;
  blocSoloOrTopOrMidOrBot: AccordeonMode;
};

const Accordeon = ({
  textTitre,
  textMain,
  blocSoloOrTopOrMidOrBot,
}: AccordeonProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div
        className={`
          ${styles.accordeonHeader}
          ${
            blocSoloOrTopOrMidOrBot === 'Top'
              ? styles.accordeonHeaderTop
              : blocSoloOrTopOrMidOrBot === 'Mid'
              ? styles.accordeonHeaderMid
              : blocSoloOrTopOrMidOrBot === 'Bot'
              ? styles.accordeonHeaderBot
              : styles.accordeonHeaderSolo
          }
          ${isOpen ? styles.open : ''}
        `}
        onClick={() => setIsOpen(!isOpen)}
      >
        {textTitre}
        <i
          className={`bx bx-chevron-${
            isOpen ? 'up' : 'down'
          } ms-auto bxNormalOrange`}
        ></i>
      </div>

      <div
        className={`
          ${styles.accordeonMain}
          ${
            blocSoloOrTopOrMidOrBot === 'Top'
              ? styles.accordeonMainTop
              : blocSoloOrTopOrMidOrBot === 'Mid'
              ? styles.accordeonMainMid
              : blocSoloOrTopOrMidOrBot === 'Bot'
              ? styles.accordeonMainBot
              : styles.accordeonMainSolo
          }
          ${isOpen ? styles.open : ''}
        `}
      >
        <span
          className={`${styles.textMain} ${
            !isOpen ? styles.hidden : ''
          }`}
        >
          {isOpen && (
            <div dangerouslySetInnerHTML={{ __html: textMain }} />
          )}
        </span>
      </div>
    </>
  );
};

export default Accordeon;