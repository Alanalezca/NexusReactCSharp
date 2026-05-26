import React from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch, ApiError } from "./client";
import { useOngletAlerteContext } from "../components/contexts/ToastContext";
import { useSessionUserContext } from "../components/contexts/sessionUserContext";

export default function useApiFetch() {
  const navigate = useNavigate();
  const { showOngletAlerte } = useOngletAlerteContext();
  const { logout } = useSessionUserContext();

  const handleError = (error: unknown, titreMessageError: string) => {
    console.error(titreMessageError, error);

    if (error instanceof ApiError) {
      if (error.status === 401) {
        showOngletAlerte(
          "error",
          "(Session expirée)",
          "Vous avez été déconnecté.",
          error.message
        );

        logout();
        navigate("/");
        return;
      }

      showOngletAlerte(
        "error",
        titreMessageError,
        "",
        error.message
      );

      return;
    }

    showOngletAlerte(
      "error",
      titreMessageError,
      "",
      "Erreur réseau ou erreur inconnue."
    );
  };

  const callApiFetch = async <T>(
    endpoint: string,
    titreMessageError: string,
    setterLoading?: React.Dispatch<React.SetStateAction<boolean>>,
    options: RequestInit = {}
  ): Promise<T | null> => {
    setterLoading?.(true);

    try {
      return await apiFetch<T>(endpoint, options);
    } catch (error) {
      handleError(error, titreMessageError);
      return null;
    } finally {
      setterLoading?.(false);
    }
  };

  return {
    callApiFetch
  };
}