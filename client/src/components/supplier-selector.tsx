import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useDistributors } from "@/services/distributors";
import { Check, ChevronsUpDown } from "lucide-react";
import { useState } from "react";

interface SupplierSelectorProps {
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
}

export function SupplierSelector({
  value,
  onValueChange,
  placeholder = "Chọn nhà cung cấp",
}: SupplierSelectorProps) {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const { data: suppliers = [], isLoading } = useDistributors({
    limit: 99,
  });

  const selectedSupplier = suppliers.find((supplier) => supplier.id === value);

  const filteredSuppliers = suppliers.filter((supplier) =>
    supplier.name.toLowerCase().includes(searchValue.toLowerCase())
  );

  const handleSelect = (supplierId: string) => {
    onValueChange(supplierId);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between h-12 px-3 py-2"
        >
          {selectedSupplier ? (
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                <span className="text-blue-600 font-medium text-sm">
                  {selectedSupplier.name.charAt(0)}
                </span>
              </div>
              <div className="text-left ">
                <p className="font-medium text-gray-900">
                  {selectedSupplier.name}
                </p>
                <p className="text-sm text-gray-500 truncate w-[400px]">
                  {selectedSupplier.description}
                </p>
              </div>
            </div>
          ) : (
            <span className="text-gray-500">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0">
        <Command>
          <CommandInput
            placeholder="Tìm kiếm nhà cung cấp..."
            value={searchValue}
            onValueChange={setSearchValue}
          />
          <CommandList>
            <CommandEmpty>
              {isLoading ? "Đang tải..." : "Không tìm thấy nhà cung cấp."}
            </CommandEmpty>
            <CommandGroup>
              {filteredSuppliers.map((supplier) => (
                <CommandItem
                  key={supplier.id}
                  value={supplier.id.toString()}
                  onSelect={() => handleSelect(supplier.id)}
                  className="flex items-center p-3 cursor-pointer"
                >
                  <div className="flex items-center flex-1">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-blue-600 font-medium text-sm">
                        {supplier.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {supplier.name}
                      </p>
                      <p className="text-sm text-gray-500 flex-wrap truncate">
                        {supplier.description}
                      </p>
                    </div>
                  </div>
                  <Check
                    className={cn(
                      "ml-auto h-4 w-4",
                      value === supplier.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
