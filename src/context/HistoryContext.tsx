import React, { createContext, useContext, useState, useEffect } from 'react';

export type LogLevel = 'Info' | 'Warning' | 'Critical' | 'Success';
export type LogType = 'Transaction' | 'Activity' | 'Auth' | 'Inventory' | 'Security';

export interface LogEntry {
    id: string;
    type: LogType;
    action: string;
    target: string;
    user: string;
    role: string;
    time: string;
    level: LogLevel;
    amount?: number;
    path?: string;
    metadata?: any;
}

interface HistoryContextType {
    logs: LogEntry[];
    addLog: (entry: Omit<LogEntry, 'id' | 'time'>) => void;
    getFilteredLogs: (range: string, customStart?: Date, customEnd?: Date) => LogEntry[];
}

const HistoryContext = createContext<HistoryContextType | undefined>(undefined);

export const HistoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [logs, setLogs] = useState<LogEntry[]>([]);

    // Initialize with some mock data if empty
    useEffect(() => {
        try {
            const savedLogs = localStorage.getItem('system_history');
            if (savedLogs) {
                const parsed = JSON.parse(savedLogs);
                setLogs(Array.isArray(parsed) ? parsed.slice(0, 50) : []);
            } else {
                const initialLogs: LogEntry[] = [
                    { id: '1', type: 'Auth', action: 'System Login', target: 'Dashboard', user: 'Super Admin', role: 'SuperAdmin', time: new Date(Date.now() - 1000 * 60 * 10).toISOString(), level: 'Success', path: '/dashboard' },
                    { id: '2', type: 'Inventory', action: 'Stock Adjustment', target: 'iPhone 15 Pro', user: 'Sarah Wilson', role: 'Dept Manager', time: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), level: 'Info', path: '/inventory' },
                    { id: '3', type: 'Transaction', action: 'New Sale', target: 'Store POS', user: 'Mike Johnson', role: 'Cashier', time: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), level: 'Success', amount: 125000, path: '/sales' },
                ];
                setLogs(initialLogs);
                try {
                    localStorage.setItem('system_history', JSON.stringify(initialLogs));
                } catch { }
            }
        } catch (e) {
            console.warn("Failed to load history from localStorage:", e);
            setLogs([]);
        }
    }, []);

    const addLog = (entry: Omit<LogEntry, 'id' | 'time'>) => {
        // Exclude metadata to save space
        const { metadata, ...entryWithoutMeta } = entry as any;
        const newLog: LogEntry = {
            ...entryWithoutMeta,
            id: Math.random().toString(36).substr(2, 9),
            time: new Date().toISOString()
        };
        setLogs(prev => {
            const update = [newLog, ...prev].slice(0, 50); // Limit to 50 to prevent quota issues
            try {
                // Store minimal version without metadata
                const toStore = update.map(({ metadata, ...rest }) => rest);
                localStorage.setItem('system_history', JSON.stringify(toStore));
            } catch (e) {
                console.warn("Failed to persist history:", e);
                // If storage is full, clear old data
                try {
                    localStorage.removeItem('system_history');
                } catch { }
            }
            return update;
        });
    };

    const getFilteredLogs = (range: string, customStart?: Date, customEnd?: Date) => {
        const now = new Date();
        return logs.filter(log => {
            const logDate = new Date(log.time);

            if (range === 'custom' && customStart && customEnd) {
                return logDate >= customStart && logDate <= customEnd;
            }

            const diff = now.getTime() - logDate.getTime();
            switch (range) {
                case 'second': return diff < 1000;
                case 'minute': return diff < 1000 * 60;
                case 'hour': return diff < 1000 * 60 * 60;
                case 'day': return diff < 1000 * 60 * 60 * 24;
                case 'week': return diff < 1000 * 60 * 60 * 24 * 7;
                case 'month': return diff < 1000 * 60 * 60 * 24 * 30;
                case 'year': return diff < 1000 * 60 * 60 * 24 * 365;
                case 'all': return true;
                default: return true;
            }
        });
    };

    return (
        <HistoryContext.Provider value={{ logs, addLog, getFilteredLogs }}>
            {children}
        </HistoryContext.Provider>
    );
};

export const useHistory = () => {
    const context = useContext(HistoryContext);
    if (!context) throw new Error('useHistory must be used within a HistoryProvider');
    return context;
};
