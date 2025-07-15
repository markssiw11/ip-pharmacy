import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
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

interface DistributorSelectorProps {
  value?: number;
  onValueChange: (value: number) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function DistributorSelector({
  value,
  onValueChange,
  placeholder = "Chọn nhà phân phối",
  disabled = false,
}: DistributorSelectorProps) {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const { data: distributorsData, isLoading } = useDistributors({
    search: searchValue || undefined,
    status: "active",
    limit: 50,
  });

  const distributors = distributorsData?.distributors || [];
  const selectedDistributor = distributors.find(
    (distributor) => distributor.id === value
  );

  const handleSelect = (distributorId: number) => {
    onValueChange(distributorId);
    setOpen(false);
  };

  const handleSearchChange = (search: string) => {
    setSearchValue(search);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between h-12"
          disabled={disabled}
        >
          {selectedDistributor ? (
            <div className="flex flex-col items-start">
              <span className="font-medium">{selectedDistributor.name}</span>
              <span className="text-xs text-gray-500 truncate">
                {selectedDistributor.contact_person ||
                  selectedDistributor.email}
              </span>
            </div>
          ) : (
            <span className="text-gray-500">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Tìm kiếm nhà phân phối..."
            value={searchValue}
            onValueChange={handleSearchChange}
          />
          <CommandList>
            {isLoading ? (
              <CommandEmpty>Đang tải...</CommandEmpty>
            ) : distributors.length === 0 ? (
              <CommandEmpty>Không tìm thấy nhà phân phối nào.</CommandEmpty>
            ) : (
              <CommandGroup>
                {distributors.map((distributor) => (
                  <CommandItem
                    key={distributor.id}
                    value={distributor.id.toString()}
                    onSelect={() => handleSelect(distributor.id)}
                    className="flex items-center justify-between"
                  >
                    <div className="flex flex-col">
                      <span className="font-medium">{distributor.name}</span>
                      <div className="flex gap-2 text-xs text-gray-500">
                        {distributor.contact_person && (
                          <span>LH: {distributor.contact_person}</span>
                        )}
                        {distributor.phone && (
                          <span>SĐT: {distributor.phone}</span>
                        )}
                      </div>
                      {distributor.address && (
                        <span className="text-xs text-gray-400 truncate max-w-[250px]">
                          {distributor.address}
                        </span>
                      )}
                    </div>
                    <Check
                      className={cn(
                        "ml-2 h-4 w-4",
                        value === distributor.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
