import { useState, useCallback, useEffect } from "react";
import { AlertContext } from "./useAlert";
import type { AlertItem, AlertTheme } from "./useAlert";
import "./Alert.scss";

let alertIdCounter = 0;

export function AlertProvider({ children }: { children: React.ReactNode }) {
    const [activeAlerts, setActiveAlerts] = useState<AlertItem[]>([]);

    const showAlert = useCallback((theme: AlertTheme, label: string, duration = 5000) => {
        const id = alertIdCounter++;
        setActiveAlerts((current) => [...current, {
            id,
            theme,
            label,
            duration,
            exiting: false 
        }]);
    }, []);

    const dismissAlert = useCallback((targetId: number) => {
        setActiveAlerts((current) =>
            current.map((alert) => (
                alert.id === targetId ? {
                    ...alert,
                    exiting: true
                } : alert
            )
        ));
        setTimeout(() => {
            setActiveAlerts((current) => current.filter((alert) => alert.id !== targetId));
        }, 600);
    }, []);

    return (
        <AlertContext.Provider value={{ showAlert }}>
            { children }
            <div className="alert-container">
                {activeAlerts.map((alert) => (
                    <AlertToast key={ alert.id } alert={ alert } onDismiss={ dismissAlert } />
                ))}
            </div>
        </AlertContext.Provider>
    );
}

function AlertToast({ alert, onDismiss }: { alert: AlertItem; onDismiss: (id: number) => void }) {
    useEffect(() => {
        const autoCloseTimer = setTimeout(() => onDismiss(alert.id), alert.duration);
        return () => clearTimeout(autoCloseTimer);
    }, [alert.id, alert.duration, onDismiss]);

    const iconName = alert.theme === "success" ? "check_circle" : "error";

    return (
        <div className={`alert alert-${ alert.theme } ${ alert.exiting ? "alert-exiting" : "alert-entering" }`}>
            <span className="material-symbols-outlined alert-icon">{iconName}</span>
            <span className="alert-label">{alert.label}</span>
            <button className="alert-close" onClick={() => onDismiss(alert.id)} aria-label="Fechar">
                <span className="material-symbols-outlined">close</span>
            </button>
        </div>
    );
}
