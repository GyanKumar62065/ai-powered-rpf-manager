import { Link, useLocation } from 'react-router-dom';
import { FileText, Users, Mail, LayoutDashboard } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'RFPs', href: '/rfps', icon: FileText },
    { name: 'Vendors', href: '/vendors', icon: Users },
    { name: 'Proposals', href: '/proposals', icon: Mail },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex h-screen">
        {/* Sidebar */}
        <div className="w-64 bg-white border-r border-gray-200">
          <div className="flex flex-col h-full">
            <div className="p-6 border-b border-gray-200">
              <h1 className="text-2xl font-bold text-primary">RFP Manager</h1>
              <p className="text-sm text-muted-foreground mt-1">Local AI-Powered</p>
            </div>
            <nav className="flex-1 p-4 space-y-1">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={cn(
                      'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-gray-700 hover:bg-gray-100'
                    )}
                  >
                    <item.icon className="w-5 h-5" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
            <div className="p-4 border-t border-gray-200">
              <div className="text-xs text-muted-foreground">
                <p>Ollama AI • Mailpit SMTP</p>
                <p className="mt-1">Open Source Stack</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 overflow-auto">
          <main className="p-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
