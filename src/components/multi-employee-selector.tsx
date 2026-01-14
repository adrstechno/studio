'use client';

import * as React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Check, ChevronsUpDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';

type Employee = {
  id: string;
  name: string;
  avatarUrl?: string;
  role?: string;
};

type MultiEmployeeSelectorProps = {
  employees: Employee[];
  selectedIds: string[];
  onChange: (selectedIds: string[]) => void;
  placeholder?: string;
};

export function MultiEmployeeSelector({
  employees,
  selectedIds,
  onChange,
  placeholder = 'Select employees...',
}: MultiEmployeeSelectorProps) {
  const [open, setOpen] = React.useState(false);

  const selectedEmployees = employees.filter(emp => selectedIds.includes(emp.id));

  const toggleEmployee = (employeeId: string) => {
    if (selectedIds.includes(employeeId)) {
      onChange(selectedIds.filter(id => id !== employeeId));
    } else {
      onChange([...selectedIds, employeeId]);
    }
  };

  const removeEmployee = (employeeId: string) => {
    onChange(selectedIds.filter(id => id !== employeeId));
  };

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            <span className="truncate">
              {selectedIds.length === 0
                ? placeholder
                : `${selectedIds.length} employee${selectedIds.length > 1 ? 's' : ''} selected`}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput placeholder="Search employees..." />
            <CommandEmpty>No employee found.</CommandEmpty>
            <CommandGroup className="max-h-64 overflow-auto">
              {employees.map((employee) => (
                <CommandItem
                  key={employee.id}
                  value={employee.name}
                  onSelect={() => toggleEmployee(employee.id)}
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div
                      className={cn(
                        'h-4 w-4 rounded border-2 flex items-center justify-center',
                        selectedIds.includes(employee.id)
                          ? 'bg-primary border-primary'
                          : 'border-muted-foreground'
                      )}
                    >
                      {selectedIds.includes(employee.id) && (
                        <Check className="h-3 w-3 text-primary-foreground" />
                      )}
                    </div>
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={employee.avatarUrl} alt={employee.name} />
                      <AvatarFallback>{employee.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{employee.name}</span>
                      {employee.role && (
                        <span className="text-xs text-muted-foreground">{employee.role}</span>
                      )}
                    </div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Selected Employees Display */}
      {selectedEmployees.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedEmployees.map((employee) => (
            <Badge
              key={employee.id}
              variant="secondary"
              className="gap-2 pr-1 pl-2 py-1"
            >
              <Avatar className="h-5 w-5">
                <AvatarImage src={employee.avatarUrl} alt={employee.name} />
                <AvatarFallback className="text-xs">{employee.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <span className="text-xs">{employee.name}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={() => removeEmployee(employee.id)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
