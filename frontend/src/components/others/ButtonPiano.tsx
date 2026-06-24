import styles from './ButtonPiano.module.css';

type ButtonPianoProps = {
  arrayLibelleOccurences: string[];
  currentOccurenceInFocus: number;
  setterCurrentOccurenceInFocus?: React.Dispatch<React.SetStateAction<number>>;
};

const ButtonPiano = ({
  arrayLibelleOccurences,
  currentOccurenceInFocus,
  setterCurrentOccurenceInFocus,
}: ButtonPianoProps) => {
  return (
    <div
      className={`btn-group ${styles.piano}`}
      role="group"
      aria-label="Basic outlined example"
    >
      {arrayLibelleOccurences.map((currentOccurence, index) => (
        <button
          key={`btn-${index}`}
          type="button"
          className={`btn btn-outline-primary ${
            currentOccurenceInFocus === index ? styles.selected : ''
          }`}
          onClick={() =>
            setterCurrentOccurenceInFocus?.(index)
          }
        >
          {currentOccurence}
        </button>
      ))}
    </div>
  );
};

export default ButtonPiano;