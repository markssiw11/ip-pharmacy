import { useState } from "react";
import { Header } from "@/components/header";
import { NavigationTabs } from "@/components/navigation-tabs";
import { ConnectionSettings } from "@/components/connection-settings";
import { OrderSync } from "@/components/order-sync";
import { InventorySync } from "@/components/inventory-sync";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("connection");

  const renderTabContent = () => {
    switch (activeTab) {
      case "connection":
        return <ConnectionSettings />;
      case "orders":
        return <OrderSync />;
      case "inventory":
        return <InventorySync />;
      default:
        return <ConnectionSettings />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <NavigationTabs activeTab={activeTab} onTabChange={setActiveTab} />
        {renderTabContent()}
      </main>
    </div>
  );
}
