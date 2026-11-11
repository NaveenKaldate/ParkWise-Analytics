import { Outlet, Link, useLocation } from 'react-router-dom';
import { 
    LayoutDashboard, Car, ParkingSquare, LogIn, 
    CreditCard, History, Database, BrainCircuit, FileText,
    Bell, Search, Menu, User
} from 'lucide-react';
import { useState } from 'react';

export default function Layout() {
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const navItems = [
        { path: '/', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/vehicles', label: 'Vehicles', icon: Car },
        { path: '/slots', label: 'Parking Slots', icon: ParkingSquare },
        { path: '/entry', label: 'Entry & Exit', icon: LogIn },
        { path: '/payments', label: 'Payments', icon: CreditCard },
        { path: '/history', label: 'Parking History', icon: History },
        { path: '/analytics', label: 'Data Warehouse', icon: Database },
        { path: '/data-mining', label: 'Data Mining', icon: BrainCircuit },
        { path: '/reports', label: 'Reports', icon: FileText },
        { path: '/settings', label: 'Settings', icon: User },
    ];

    return (
        <div className="flex h-screen bg-main-bg text-text-primary overflow-hidden font-sans">
            {/* Sidebar */}
            <div className={`bg-sidebar-bg border-r border-border flex flex-col transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-20'}`}>
                <div className="h-16 flex items-center justify-center border-b border-border">
                    {sidebarOpen ? (
                        <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">ParkWise Analytics</span>
                    ) : (
                        <span className="text-xl font-bold text-primary">PW</span>
                    )}
                </div>
                <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 custom-scrollbar">
                    {navItems.map(item => {
                        const Icon = item.icon;
                        const active = location.pathname === item.path;
                        return (
                            <Link 
                                key={item.path} 
                                to={item.path}
                                title={sidebarOpen ? '' : item.label}
                                className={`flex items-center px-3 py-3 rounded-lg transition-colors ${active ? 'bg-primary text-white' : 'text-text-secondary hover:bg-card-bg hover:text-white'}`}
                            >
                                <Icon className={`w-5 h-5 ${sidebarOpen ? 'mr-3' : 'mx-auto'}`} />
                                {sidebarOpen && <span className="font-medium text-sm">{item.label}</span>}
                            </Link>
                        )
                    })}
                </nav>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <header className="h-16 bg-main-bg border-b border-border flex items-center justify-between px-6 z-10 sticky top-0">
                    <div className="flex items-center space-x-4">
                        <button 
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="p-2 rounded-md text-text-secondary hover:bg-card-bg hover:text-white transition-colors"
                        >
                            <Menu className="w-5 h-5" />
                        </button>
                        
                        <div className="hidden md:flex items-center space-x-2 text-sm">
                            <span className="text-text-secondary">Main</span>
                            <span className="text-text-secondary text-xs">{'>'}</span>
                            <span className="text-white font-medium">{navItems.find(i => i.path === location.pathname)?.label || 'Dashboard'}</span>
                        </div>
                        
                        <div className="hidden lg:flex items-center space-x-3 ml-6 border-l border-border pl-6">
                            <select className="bg-sidebar-bg border border-border text-sm rounded-md px-3 py-1.5 focus:outline-none focus:border-primary text-text-primary">
                                <option>All Locations</option>
                                <option>North Campus</option>
                                <option>South Campus</option>
                            </select>
                            
                            <input type="date" className="bg-sidebar-bg border border-border text-sm rounded-md px-3 py-1.5 focus:outline-none focus:border-primary text-text-primary" />
                            
                            <select className="bg-sidebar-bg border border-border text-sm rounded-md px-3 py-1.5 focus:outline-none focus:border-primary text-text-primary">
                                <option>Last 24h</option>
                                <option>Last 7 days</option>
                                <option>Last 30 days</option>
                            </select>

                            <button className="bg-sidebar-bg border border-border text-text-secondary hover:text-white text-sm rounded-md px-3 py-1.5 transition-colors">
                                Customize Grid
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center space-x-4">
                        <div className="hidden sm:flex items-center space-x-2 px-3 py-1 rounded-full bg-success/10 border border-success/20">
                            <span className="w-2 h-2 rounded-full bg-success animate-pulse"></span>
                            <span className="text-xs font-medium text-success">Live System</span>
                        </div>
                        <div className="relative hidden md:block">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary" />
                            <input 
                                type="text" 
                                placeholder="Search..." 
                                className="bg-sidebar-bg border border-border text-sm rounded-full pl-9 pr-4 py-1.5 focus:outline-none focus:border-primary text-text-primary placeholder-text-secondary w-48 transition-all"
                            />
                        </div>
                        <button className="p-2 rounded-full text-text-secondary hover:bg-card-bg hover:text-white transition-colors relative">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-1 right-1 w-2 h-2 bg-error rounded-full"></span>
                        </button>
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-secondary flex items-center justify-center font-bold text-sm cursor-pointer hover:opacity-80 transition-opacity shadow-lg">
                            AD
                        </div>
                    </div>
                </header>
                
                {/* Scrollable Content */}
                <main className="flex-1 overflow-y-auto p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
