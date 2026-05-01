import { createContext, useContext } from "react";

export type AlertTheme = "success" | "danger";

export interface AlertItem {
    id: number;
    theme: AlertTheme;
    label: string;
    duration: number;
    exiting: boolean;
}

export interface AlertContextValue {
    showAlert: (theme: AlertTheme, label: string, duration?: number) => void;
}

export const AlertContext = createContext<AlertContextValue | null>(null);

export function useAlert() {
    const context = useContext(AlertContext);
    if (!context) throw new Error("useAlert must be used within AlertProvider");
    return context;
}
