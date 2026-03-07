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
    ChevronLeft,
    ChevronDown,
    ChevronRight,
    MapPin
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function AppLayout() {
    const [collapsed, setCollapsed] = useState(false);
    const [mastersOpen, setMastersOpen] = useState(false);

    const navItems = [
        { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
        { label: 'Dispatch Register', icon: Truck, path: '/operations/dispatch' },
        { label: 'Create LR', icon: FileText, path: '/operations/create-lr' },
        { label: 'Hire Memo Register', icon: FileText, path: '/operations/hire-memo-register' },
        { label: 'Vehicle Tracking', icon: MapPin, path: '/operations/tracking' },
        { label: 'Tracking Log', icon: MapPin, path: '/operations/tracking-log' },
        { label: 'POD Management', icon: CheckSquare, path: '/pod' },
        {
            label: 'Masters',
            icon: LayoutDashboard,
            path: '#', // Placeholder for parent
            children: [
                { label: 'Clients', path: '/masters/clients' },
                { label: 'Vendors', path: '/masters/vendors' },
                { label: 'Vehicles', path: '/masters/vehicles' },
                { label: 'Contracts', path: '/masters/contracts' },
                { label: 'Users', path: '/masters/users' },
                { label: 'Cities', path: '/masters/cities' },
            ]
        },
        { label: 'Bill Notebook', icon: Banknote, path: '/finance/invoices' },
        { label: 'Payment Receipts', icon: Banknote, path: '/finance/payment-receipts' },
        { label: 'Ledger Book', icon: Banknote, path: '/finance/vouchers' },
        { label: 'Reports', icon: LayoutDashboard, path: '/reports' },
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

                <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
                    {navItems.map((item) => {
                        if (item.children) {
                            // Render Parent with Dropdown logic
                            return (
                                <div key={item.label}>
                                    <button
                                        onClick={() => !collapsed && setMastersOpen(!mastersOpen)}
                                        className={cn(
                                            "flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-sm font-medium w-full text-left",
                                            mastersOpen ? "text-slate-900 bg-slate-50" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                                            collapsed && "justify-center"
                                        )}
                                        title={collapsed ? item.label : undefined}
                                    >
                                        <item.icon className="h-5 w-5 shrink-0" />
                                        {!collapsed && (
                                            <>
                                                <span className="flex-1">{item.label}</span>
                                                {mastersOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                                            </>
                                        )}
                                    </button>

                                    {/* Submenu */}
                                    {!collapsed && mastersOpen && (
                                        <div className="ml-9 border-l border-slate-200 pl-2 space-y-1 mt-1">
                                            {item.children.map((child) => (
                                                <NavLink
                                                    key={child.path}
                                                    to={child.path}
                                                    className={({ isActive }) => cn(
                                                        "block px-3 py-2 rounded-md transition-colors text-sm font-medium",
                                                        isActive
                                                            ? "bg-slate-100 text-slate-900"
                                                            : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                                                    )}
                                                >
                                                    {child.label}
                                                </NavLink>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        }

                        // Render regular item
                        return (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                end
                                className={({ isActive }) => cn(
                                    "flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-sm font-medium",
                                    isActive
                                        ? "bg-slate-900 text-white"
                                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                                    collapsed && "justify-center"
                                )}
                            >
                                <item.icon className="h-5 w-5 shrink-0" />
                                {!collapsed && <span>{item.label}</span>}
                            </NavLink>
                        );
                    })}
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
                <div className="flex-1 p-6">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
