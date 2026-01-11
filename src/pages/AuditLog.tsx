import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FileText, Search, User, Shield, Activity, Calendar as CalendarIcon,
    ExternalLink, CreditCard, LogIn, LogOut, Package,
    Filter, ArrowDownUp, Clock, Landmark, Printer, Download,
    ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useHistory, LogEntry, LogType } from '@/context/HistoryContext';
import { format, parseISO, formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const getLevelStyle = (level: string) => {
    switch (level) {
        case 'Critical': return 'bg-danger/10 text-danger border-danger/20';
        case 'Warning': return 'bg-warning/10 text-warning border-warning/20';
        case 'Info': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
        case 'Success': return 'bg-success/10 text-success border-success/20';
        default: return 'bg-muted text-muted-foreground border-border';
    }
};

const getTypeIcon = (type: LogType) => {
    switch (type) {
        case 'Transaction': return <CreditCard size={18} />;
        case 'Auth': return <LogIn size={18} />;
        case 'Inventory': return <Package size={18} />;
        case 'Security': return <Shield size={18} />;
        default: return <Activity size={18} />;
    }
};

const AuditLog = () => {
    const navigate = useNavigate();
    const { getFilteredLogs } = useHistory();
    const [timeRange, setTimeRange] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState<LogType | 'All'>('All');
    const [customRange, setCustomRange] = useState<{ start: Date | undefined; end: Date | undefined }>({
        start: undefined,
        end: undefined
    });

    const filteredLogs = useMemo(() => {
        let logs = getFilteredLogs(timeRange, customRange.start, customRange.end);

        if (filterType !== 'All') {
            logs = logs.filter(l => l.type === filterType);
        }

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            logs = logs.filter(l =>
                l.action.toLowerCase().includes(query) ||
                l.target.toLowerCase().includes(query) ||
                l.user.toLowerCase().includes(query)
            );
        }

        return logs;
    }, [getFilteredLogs, timeRange, filterType, searchQuery, customRange]);

    const handleRowClick = (log: LogEntry) => {
        if (log.path) {
            navigate(log.path);
        } else {
            toast.info(`Details for ${log.action}: ${log.target}`);
        }
    };

    const handleExport = (specificLog?: LogEntry) => {
        const logsToExport = specificLog ? [specificLog] : filteredLogs;
        if (logsToExport.length === 0) {
            toast.error("No logs to export");
            return;
        }

        const headers = ["ID", "Time", "Type", "Action", "Target", "User", "Role", "Level", "Amount"];
        const csvContent = [
            headers.join(","),
            ...logsToExport.map(l => [
                l.id,
                l.time,
                l.type,
                `"${l.action}"`,
                `"${l.target}"`,
                `"${l.user}"`,
                l.role,
                l.level,
                l.amount || 0
            ].join(","))
        ].join("\n");

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `system_audit_log_${format(new Date(), 'yyyyMMdd_HHmm')}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success(`Exported ${logsToExport.length} records`);
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <MainLayout>
            {/* Print-only Branded Header */}
            <div className="hidden print:block mb-8 border-b-2 border-primary pb-6">
                <div className="flex justify-between items-end">
                    <div>
                        <h1 className="text-4xl font-black tracking-tighter uppercase text-primary">Dreams Hub</h1>
                        <p className="text-sm font-bold tracking-widest uppercase opacity-70">Logistics & Inventory Hub • Audit Report</p>
                    </div>
                    <div className="text-right text-xs">
                        <p className="font-bold">Generated: {format(new Date(), 'PPP p')}</p>
                        <p className="opacity-60 text-[10px]">Document ID: MS-{Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
                    </div>
                </div>
                <div className="mt-4 flex gap-4 text-xs font-medium italic opacity-80">
                    <span>Range: {timeRange === 'all' ? 'Entire History' : `Last ${timeRange}`}</span>
                    {timeRange === 'custom' && customRange.start && (
                        <span>({format(customRange.start, 'MMM dd, yyyy')} - {customRange.end ? format(customRange.end, 'MMM dd, yyyy') : 'Now'})</span>
                    )}
                    <span>Filter: {filterType}</span>
                </div>
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 no-print">
                <div>
                    <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
                        <Clock className="text-primary" />
                        System History
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Comprehensive ledger of transactions, activities, and security events.
                    </p>
                </div>
                <div className="flex bg-muted/30 p-1 rounded-xl border border-border/50 items-center overflow-x-auto no-scrollbar max-w-full">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 px-4 gap-2 mr-2">
                                <Clock size={14} />
                                <span className="capitalize">{timeRange === 'all' ? 'Time Range' : `Last ${timeRange}`}</span>
                                <ChevronDown size={14} />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-48">
                            <DropdownMenuItem onClick={() => setTimeRange('second')}>Last Second</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setTimeRange('minute')}>Last Minute</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setTimeRange('hour')}>Last Hour</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setTimeRange('day')}>Last Day</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setTimeRange('week')}>Last Week</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setTimeRange('month')}>Last Month</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setTimeRange('year')}>Last Year</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setTimeRange('all')}>All Time</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <div className="h-4 w-[1px] bg-border/50 mr-2" />

                    <div className="flex gap-1">
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant={timeRange === 'custom' ? 'default' : 'ghost'}
                                    size="sm"
                                    className="h-8 px-4 gap-2"
                                    onClick={() => setTimeRange('custom')}
                                >
                                    <CalendarIcon size={14} />
                                    {customRange.start ? format(customRange.start, 'MMM dd') : 'Start'}
                                    <span>-</span>
                                    {customRange.end ? format(customRange.end, 'MMM dd') : 'End'}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="end">
                                <div className="p-4 bg-background border-b border-border">
                                    <h4 className="font-bold text-sm">Select Date Range</h4>
                                </div>
                                <Calendar
                                    initialFocus
                                    mode="range"
                                    selected={{
                                        from: customRange.start,
                                        to: customRange.end
                                    }}
                                    onSelect={(range: any) => setCustomRange({ start: range?.from, end: range?.to })}
                                    numberOfMonths={2}
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 no-print">
                <div className="md:col-span-2 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                    <Input
                        className="pl-10 h-12 bg-glass-card border-none shadow-sm"
                        placeholder="Search users, actions, or targets..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex gap-2">
                    {(['All', 'Transaction', 'Auth', 'Inventory'] as const).map((type) => (
                        <Button
                            key={type}
                            variant={filterType === type ? "secondary" : "outline"}
                            className="flex-1 h-12 border-none bg-muted/20"
                            onClick={() => setFilterType(type as any)}
                        >
                            {type}
                        </Button>
                    ))}
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        className="flex-1 h-12 gap-2 border-primary/20 hover:bg-primary/5 text-primary"
                        onClick={handlePrint}
                    >
                        <Printer size={18} />
                        Print All
                    </Button>
                    <Button
                        variant="outline"
                        className="flex-1 h-12 gap-2 border-primary/20 hover:bg-primary/5 text-primary"
                        onClick={() => handleExport()}
                    >
                        <Download size={18} />
                        Export CSV
                    </Button>
                </div>
            </div>

            <div className="space-y-4">
                <AnimatePresence mode="popLayout">
                    {filteredLogs.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="p-20 text-center glass-card border-2 border-dashed"
                        >
                            <Package className="mx-auto text-muted-foreground/30 mb-4" size={48} />
                            <h3 className="text-lg font-bold">No history records found</h3>
                            <p className="text-muted-foreground">Adjust your filters or search terms</p>
                        </motion.div>
                    ) : (
                        filteredLogs.map((log, index) => (
                            <motion.div
                                key={log.id}
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.2, delay: index * 0.03 }}
                                className="glass-card hover:bg-muted/5 transition-all cursor-pointer group border-l-4 border-l-transparent hover:border-l-primary print:shadow-none print:bg-white print:border-l-border"
                            >
                                <div
                                    className="p-4 flex flex-col md:flex-row md:items-center gap-6"
                                    onClick={() => handleRowClick(log)}
                                >
                                    <div className="flex items-center gap-4 flex-1">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border shadow-sm ${getLevelStyle(log.level)}`}>
                                            {getTypeIcon(log.type)}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-black text-sm uppercase tracking-tight">{log.action}</span>
                                                <Badge className={`text-[9px] uppercase font-bold py-0 h-4 border-none ${getLevelStyle(log.level)}`}>
                                                    {log.level}
                                                </Badge>
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-0.5">
                                                Target: <span className="text-foreground/80 font-bold">{log.target}</span>
                                                {log.amount && <span className="ml-2 text-primary font-black">₦{log.amount.toLocaleString()}</span>}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-8 text-xs">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <User size={12} className="text-muted-foreground" />
                                                <span className="font-bold">{log.user}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-muted-foreground/60">
                                                <Shield size={12} />
                                                <span className="uppercase tracking-tighter text-[10px]">{log.role}</span>
                                            </div>
                                        </div>

                                        <div className="text-right space-y-1">
                                            <div className="flex items-center justify-end gap-2 text-foreground font-medium">
                                                <CalendarIcon size={12} />
                                                <span>{format(parseISO(log.time), 'MMM dd, HH:mm')}</span>
                                            </div>
                                            <div className="text-muted-foreground opacity-60">
                                                {formatDistanceToNow(parseISO(log.time), { addSuffix: true })}
                                            </div>
                                        </div>

                                        <div className="hidden md:flex items-center pl-4 border-l border-border/50 gap-2 no-print">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="group-hover:text-primary transition-colors"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleExport(log);
                                                }}
                                                title="Export this record"
                                            >
                                                <Download size={16} />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="group-hover:text-primary transition-colors"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleRowClick(log);
                                                }}
                                            >
                                                <ExternalLink size={16} />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    )}
                </AnimatePresence>
            </div>

            <div className="mt-8 p-6 glass-card border-none bg-primary/5 flex items-center justify-between no-print">
                <div className="flex gap-4 items-center">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <Activity size={20} />
                    </div>
                    <div>
                        <p className="text-sm font-bold">Automatic Synchronization</p>
                        <p className="text-xs text-muted-foreground">All events are cryptographically signed and stored in Supabase</p>
                    </div>
                </div>
                <Badge variant="outline" className="text-primary border-primary/20">Active Session</Badge>
            </div>
        </MainLayout>
    );
};

export default AuditLog;
