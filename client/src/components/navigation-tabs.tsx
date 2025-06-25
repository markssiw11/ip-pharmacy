import { Plug, ShoppingCart, Package } from "lucide-react";

interface NavigationTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function NavigationTabs({ activeTab, onTabChange }: NavigationTabsProps) {
  const tabs = [
    { id: "connection", label: "Connection Settings", icon: Plug },
    { id: "orders", label: "Order Sync", icon: ShoppingCart },
    { id: "inventory", label: "Inventory Sync", icon: Package },
  ];

  return (
    <div className="mb-8">
      <nav className="flex space-x-8" aria-label="Tabs">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => onTabChange(id)}
            className={`tab-button ${activeTab === id ? 'active' : ''}`}
          >
            <Icon className="h-4 w-4 mr-2" />
            {label}
          </button>
        ))}
      </nav>
    </div>
  );
}
