import React, { createContext, useState, useContext } from "react";
import type { ReactNode } from "react";

interface KeyforgeContextType {
    poolCartesGlobal: any;
    setPoolCartesGlobal: React.Dispatch<React.SetStateAction<any>>;

    cartesValidees: any[];
    setCartesValidees: React.Dispatch<React.SetStateAction<any[]>>;

    draftEnCoursParJoueurAouB: number | null;
    setDraftEnCoursParJoueurAouB: React.Dispatch<
        React.SetStateAction<number | null>
    >;

    draftEnCoursSurFactionAouBouC: string | null;
    setDraftEnCoursSurFactionAouBouC: React.Dispatch<
        React.SetStateAction<string | null>
    >;
}

interface KeyforgeContextProviderProps {
    children: ReactNode;
}

const KeyforgeContext = createContext<KeyforgeContextType | undefined>(
    undefined
);

export const useKeyforgeContext = () => {
    const context = useContext(KeyforgeContext);

    if (context === undefined) {
        throw new Error(
            "useKeyforgeContext doit être utilisé dans un KeyforgeContextProvider"
        );
    }

    return context;
};

export const KeyforgeContextProvider = ({
    children
}: KeyforgeContextProviderProps) => {

    const [poolCartesGlobal, setPoolCartesGlobal] = useState<any>(null);

    const [cartesValidees, setCartesValidees] = useState<any[]>([]);

    const [
        draftEnCoursParJoueurAouB,
        setDraftEnCoursParJoueurAouB
    ] = useState<number | null>(null);

    const [
        draftEnCoursSurFactionAouBouC,
        setDraftEnCoursSurFactionAouBouC
    ] = useState<string | null>(null);

    return (
        <KeyforgeContext.Provider
            value={{
                poolCartesGlobal,
                setPoolCartesGlobal,
                cartesValidees,
                setCartesValidees,
                draftEnCoursParJoueurAouB,
                setDraftEnCoursParJoueurAouB,
                draftEnCoursSurFactionAouBouC,
                setDraftEnCoursSurFactionAouBouC
            }}
        >
            {children}
        </KeyforgeContext.Provider>
    );
};