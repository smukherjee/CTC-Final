import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import {
    LayoutDashboard,
    Truck,
    FileText,
    CheckSquare,
    Banknote,
    Settings,
    Menu,
    ChevronLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function AppLayout() {
    const [collapsed, setCollapsed] = useState(false);

    const navItems = [
        { label: 'Dispatch Register', icon: Truck, path: '/operations/dispatch' },
        { label: 'Create LR', icon: FileText, path: '/operations/create-lr' },
        { label: 'Parties (Masters)', icon: LayoutDashboard, path: '/masters/parties' },
        { label: 'Vendors (Masters)', icon: LayoutDashboard, path: '/masters/vendors' },
        { label: 'POD Verification', icon: CheckSquare, path: '/finance/pod-verify' },
        { label: 'Invoices', icon: Banknote, path: '/finance/invoices' },
        { label: 'Settings', icon: Settings, path: '/admin/settings' },
    ];

    return (
        <div className="flex h-screen bg-slate-50">
            {/* Sidebar */}
            <aside
                className={cn(
                    "bg-white border-r border-slate-200 transition-all duration-300 flex flex-col",
                    collapsed ? "w-16" : "w-64"
                )}
            >
                <div className="h-16 flex items-center justify-between px-4 border-b border-slate-100">
                    {!collapsed && <span className="font-bold text-xl text-slate-800">CTC Logistics</span>}
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setCollapsed(!collapsed)}
                        className="ml-auto"
                    >
                        {collapsed ? <Menu className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
                    </Button>
                </div>

                <nav className="flex-1 p-2 space-y-1">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) => cn(
                                "flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-sm font-medium",
                                isActive
                                    ? "bg-slate-900 text-white"
                                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                                collapsed && "justify-center"
                            )}
                        >
                            <item.icon className="h-5 w-5" />
                            {!collapsed && <span>{item.label}</span>}
                        </NavLink>
                    ))}
                </nav>

                <div className="p-4 border-t border-slate-100">
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600">
                            AD
                        </div>
                        {!collapsed && (
                            <div className="flex flex-col">
                                <span className="text-sm font-medium text-slate-900">Admin User</span>
                                <span className="text-xs text-slate-500">HQ - Chennai</span>
                            </div>
                        )}
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto flex flex-col">
                <header className="h-16 bg-white border-b border-slate-200 flex items-center px-6 sticky top-0 z-10">
                    <h1 className="text-lg font-semibold text-slate-800">
                        {/* Dynamic Header could go here */}
                        Operations Output
                    </h1>
                </header>
                <div className="flex-1 p-6">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
