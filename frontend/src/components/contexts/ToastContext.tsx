import { createContext, useContext, useState, useRef, useEffect } from "react";
import type { ReactNode } from "react";
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

const ongletAlerteContext = createContext<OngletAlerteContextType>({
  showOngletAlerte: async () => {}
});

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
      bsOngletAlerteRef.current = new bootstrap.Toast(ongletAlerteRef.current);
    }
  }, []);

  useEffect(() => {
    if (!ongletAlerteRef.current) return;

    bsOngletAlerteRef.current?.dispose();
    bsOngletAlerteRef.current = new bootstrap.Toast(ongletAlerteRef.current);

    if (ongletAlerte.strTextBlocBottom !== "") {
      bsOngletAlerteRef.current.show();
    }
  }, [ongletAlerte]);

  const showOngletAlerte = async (
    type: string,
    textTopLeft: string,
    textTopRight: string,
    mainText: string
  ) => {
    switch (type) {
      case "success":
        setOngletAlerte({
          strClassBGBlocTop: "ongletAlerteBGTtopSuccess",
          strClassBGBlocBottom: "ongletAlerteBGTBottomSuccess",
          strTextTopLeft: textTopLeft,
          strTextTopRight: textTopRight,
          strTextBlocBottom: mainText
        });
        break;

      case "error":
        setOngletAlerte({
          strClassBGBlocTop: "ongletAlerteBGTtopDanger",
          strClassBGBlocBottom: "ongletAlerteBGTBottomDanger",
          strTextTopLeft: textTopLeft,
          strTextTopRight: textTopRight,
          strTextBlocBottom: mainText
        });
        break;

      case "caution":
        setOngletAlerte({
          strClassBGBlocTop: "ongletAlerteBGTtopCaution",
          strClassBGBlocBottom: "ongletAlerteBGTBottomCaution",
          strTextTopLeft: textTopLeft,
          strTextTopRight: textTopRight,
          strTextBlocBottom: mainText
        });
        break;

      default:
        setOngletAlerte({
          strClassBGBlocTop: "ongletAlerteBGTtopStandard",
          strClassBGBlocBottom: "ongletAlerteBGTBottomStandard",
          strTextTopLeft: textTopLeft,
          strTextTopRight: textTopRight,
          strTextBlocBottom: mainText
        });
    }
  };

  return (
    <ongletAlerteContext.Provider value={{ showOngletAlerte }}>
      {children}

      <div className="toast-container position-fixed bottom-0 end-0 p-3" id="toast-container">
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

export const useOngletAlerteContext = () => useContext(ongletAlerteContext);