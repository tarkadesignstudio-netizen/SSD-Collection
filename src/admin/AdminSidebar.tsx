import React from 'react';
import { LayoutDashboard, PlusCircle, Trash2, Settings } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

interface AdminSidebarProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
  isOpen?: boolean;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ activeTab, onTabChange, isOpen = false }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'add-category', label: 'Add Category', icon: PlusCircle },
    { id: 'add-product', label: 'Add Product', icon: PlusCircle },
    { id: 'remove-product', label: 'Remove/Hide Product', icon: Trash2 },
    { id: 'manage-products', label: 'Manage Products', icon: Settings },
  ];

  return (
    <aside className={cn(
      "fixed inset-y-0 left-0 z-40 transform bg-[#FDE2E8] md:bg-[#FDE2E8] transition-transform duration-300 ease-in-out flex-shrink-0 pt-8 px-4 h-full shadow-2xl md:shadow-none w-64 md:relative md:translate-x-0 h-[100dvh] md:min-h-[calc(100vh-80px)] md:h-auto",
      isOpen ? "translate-x-0" : "-translate-x-full"
    )}>
      <nav className="flex flex-col space-y-2 mt-4 md:mt-0">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.id === activeTab;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                "flex items-center px-4 py-3 rounded-xl transition-all duration-200 group w-full",
                isActive 
                  ? "bg-[#F48CA8] text-white shadow-sm" 
                  : "text-[#2B2B2B] hover:bg-white/40"
              )}
            >
              <Icon className={cn("h-5 w-5 flex-shrink-0", isActive ? "text-white" : "text-[#7A7A7A] group-hover:text-[#2B2B2B]")} />
              <span className={cn(
                "ml-4 font-medium text-sm md:text-base whitespace-nowrap",
                isActive ? "text-white" : "text-[#2B2B2B]"
              )}>
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
};

export default AdminSidebar;
