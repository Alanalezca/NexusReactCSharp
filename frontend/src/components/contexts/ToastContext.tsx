import { createContext, useContext, useState, useRef, useEffect } from "react";
import type { ReactNode } from "react";
import { flushSync } from "react-dom";
import * as bootstrap from "bootstrap";

type OngletAlerteType = {
  strClassBGBlocTop: string;
  strClassBGBlocBottom: string;
  strTextTopLeft: string;
  strTextTopRight: string;
  strTextBlocBottom: string;
};

type OngletAlerteContextType = {
  showOngletAlerte: (
    type: string,
    textTopLeft: string,
    textTopRight: string,
    mainText: string
  ) => Promise<void>;
};

const ongletAlerteContext = createContext<OngletAlerteContextType | null>(null);

const toastStyles = {
  success: {
    top: "ongletAlerteBGTtopSuccess",
    bottom: "ongletAlerteBGTBottomSuccess"
  },
  error: {
    top: "ongletAlerteBGTtopDanger",
    bottom: "ongletAlerteBGTBottomDanger"
  },
  caution: {
    top: "ongletAlerteBGTtopCaution",
    bottom: "ongletAlerteBGTBottomCaution"
  },
  standard: {
    top: "ongletAlerteBGTtopStandard",
    bottom: "ongletAlerteBGTBottomStandard"
  }
};

export const OngletAlerteProvider = ({ children }: { children: ReactNode }) => {
  const [ongletAlerte, setOngletAlerte] = useState<OngletAlerteType>({
    strClassBGBlocTop: "bgcolorA",
    strClassBGBlocBottom: "bgcolorA",
    strTextTopLeft: "",
    strTextTopRight: "",
    strTextBlocBottom: ""
  });

  const ongletAlerteRef = useRef<HTMLDivElement | null>(null);
  const bsOngletAlerteRef = useRef<bootstrap.Toast | null>(null);

  useEffect(() => {
    if (ongletAlerteRef.current) {
      bsOngletAlerteRef.current = bootstrap.Toast.getOrCreateInstance(ongletAlerteRef.current);
    }
  }, []);

  const showOngletAlerte = async (
    type: string,
    textTopLeft: string,
    textTopRight: string,
    mainText: string
  ) => {
    const style =
      toastStyles[type as keyof typeof toastStyles] ||
      toastStyles.standard;

    flushSync(() => {
      setOngletAlerte({
        strClassBGBlocTop: style.top,
        strClassBGBlocBottom: style.bottom,
        strTextTopLeft: textTopLeft,
        strTextTopRight: textTopRight,
        strTextBlocBottom: mainText
      });
    });

    if (!ongletAlerteRef.current) return;

    bsOngletAlerteRef.current = bootstrap.Toast.getOrCreateInstance(ongletAlerteRef.current);
    bsOngletAlerteRef.current.show();
  };

  return (
    <ongletAlerteContext.Provider value={{ showOngletAlerte }}>
      {children}

      <div className="toast-container position-fixed bottom-0 end-0 p-3" id="toast-container" style={{ zIndex: 2000 }}>
        <div
          className={`toast ${ongletAlerte.strClassBGBlocBottom}`}
          ref={ongletAlerteRef}
          role="alert"
          aria-live="assertive"
          aria-atomic="true"
        >
          <div className={`toast-header ${ongletAlerte.strClassBGBlocTop}`}>
            <strong className="me-auto">{ongletAlerte.strTextTopLeft}</strong>
            <small>{ongletAlerte.strTextTopRight}</small>
            <button type="button" className="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
          </div>

          <div className="toast-body">
            {ongletAlerte.strTextBlocBottom}
          </div>
        </div>
      </div>
    </ongletAlerteContext.Provider>
  );
};

export const useOngletAlerteContext = () => {
  const context = useContext(ongletAlerteContext);

  if (!context) {
    throw new Error("useOngletAlerteContext doit être utilisé dans OngletAlerteProvider");
  }

  return context;
};
