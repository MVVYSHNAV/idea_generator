'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const AlertContext = createContext(null);

export const useAlert = () => {
    const context = useContext(AlertContext);
    if (!context) {
        throw new Error('useAlert must be used within an AlertProvider');
    }
    return context;
};

export const AlertProvider = ({ children }) => {
    const [alerts, setAlerts] = useState([]);

    const showAlert = useCallback(({ title, message, type = 'info', duration = 4000, action }) => {
        const id = Date.now();
        setAlerts((prev) => [...prev, { id, title, message, type, action }]);

        if (duration !== Infinity) {
            setTimeout(() => {
                removeAlert(id);
            }, duration);
        }
        return id;
    }, []);

    const removeAlert = useCallback((id) => {
        setAlerts((prev) => prev.filter((alert) => alert.id !== id));
    }, []);

    const showSuccess = (title, message, options) => showAlert({ title, message, type: 'success', ...options });
    const showError = (title, message, options) => showAlert({ title, message, type: 'error', ...options });
    const showWarning = (title, message, options) => showAlert({ title, message, type: 'warning', ...options });
    const showInfo = (title, message, options) => showAlert({ title, message, type: 'info', ...options });

    // Confirmation dialog state (minimal for now to replace confirm())
    const [confirmState, setConfirmState] = useState(null);

    const confirm = useCallback((options) => {
        return new Promise((resolve) => {
            setConfirmState({ ...options, resolve });
        });
    }, []);

    const handleConfirm = (value) => {
        confirmState?.resolve(value);
        setConfirmState(null);
    };

    return (
        <AlertContext.Provider value={{ showSuccess, showError, showWarning, showInfo, confirm }}>
            {children}

            {/* Toast Container */}
            <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none w-full max-w-sm">
                <AnimatePresence>
                    {alerts.map((alert) => (
                        <Toast key={alert.id} {...alert} onClose={() => removeAlert(alert.id)} />
                    ))}
                </AnimatePresence>
            </div>

            {/* Global Confirmation Modal */}
            <AnimatePresence>
                {confirmState && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl p-6"
                        >
                            <h3 className="text-xl font-bold font-display mb-2">{confirmState.title || 'Are you sure?'}</h3>
                            <p className="text-muted-foreground mb-6">{confirmState.message}</p>
                            <div className="flex gap-3 justify-end">
                                <button
                                    onClick={() => handleConfirm(false)}
                                    className="px-4 py-2 rounded-xl border border-border hover:bg-muted transition-colors text-sm font-medium"
                                >
                                    {confirmState.cancelText || 'Cancel'}
                                </button>
                                <button
                                    onClick={() => handleConfirm(true)}
                                    className={cn(
                                        "px-4 py-2 rounded-xl text-sm font-medium transition-opacity hover:opacity-90",
                                        confirmState.variant === 'destructive' ? "bg-red-500 text-white" : "gradient-bg text-white"
                                    )}
                                >
                                    {confirmState.confirmText || 'Confirm'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </AlertContext.Provider>
    );
};

const Toast = ({ title, message, type, onClose, action }) => {
    const icons = {
        success: <CheckCircle2 className="w-5 h-5 text-green-500" />,
        error: <AlertCircle className="w-5 h-5 text-red-500" />,
        warning: <AlertTriangle className="w-5 h-5 text-yellow-500" />,
        info: <Info className="w-5 h-5 text-blue-500" />,
    };

    const variantStyles = {
        success: "border-green-500/20 bg-green-500/5",
        error: "border-red-500/20 bg-red-500/5",
        warning: "border-yellow-500/20 bg-yellow-500/5",
        info: "border-blue-500/20 bg-blue-500/5",
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, x: 20, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.95 }}
            className={cn(
                "pointer-events-auto flex gap-4 p-4 rounded-2xl border backdrop-blur-md shadow-lg",
                variantStyles[type] || "border-border bg-card/80"
            )}
        >
            <div className="shrink-0 pt-0.5">{icons[type]}</div>
            <div className="flex-1 min-w-0">
                {title && <h4 className="text-sm font-bold truncate">{title}</h4>}
                <p className="text-xs text-muted-foreground leading-relaxed">{message}</p>
                {action && (
                    <button
                        onClick={() => {
                            action.onClick();
                            onClose();
                        }}
                        className="mt-2 text-xs font-bold text-primary hover:underline"
                    >
                        {action.label}
                    </button>
                )}
            </div>
            <button
                onClick={onClose}
                className="shrink-0 h-6 w-6 flex items-center justify-center rounded-lg hover:bg-muted text-muted-foreground transition-colors"
            >
                <X className="w-3 h-3" />
            </button>
        </motion.div>
    );
};
