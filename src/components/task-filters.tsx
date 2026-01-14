'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Filter, X, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

export type TaskFilters = {
  status: string[];
  priority: string[];
  taskType: string[];
  assignee: string[];
  project: string | null;
  search: string;
};

type TaskFiltersProps = {
  filters: TaskFilters;
  onFiltersChange: (filters: TaskFilters) => void;
  employees: Array<{ id: string; name: string }>;
  projects: Array<{ id: string; name: string }>;
};

export function TaskFiltersComponent({ filters, onFiltersChange, employees, projects }: TaskFiltersProps) {
  const [open, setOpen] = React.useState(false);

  const statusOptions = ['ToDo', 'InProgress', 'Done'];
  const priorityOptions = ['Low', 'Medium', 'High', 'Urgent'];
  const taskTypeOptions = ['Daily', 'ProjectBased'];

  const toggleFilter = (category: keyof TaskFilters, value: string) => {
    const currentValues = filters[category] as string[];
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value];
    
    onFiltersChange({ ...filters, [category]: newValues });
  };

  const clearFilters = () => {
    onFiltersChange({
      status: [],
      priority: [],
      taskType: [],
      assignee: [],
      project: null,
      search: '',
    });
  };

  const activeFilterCount = 
    filters.status.length +
    filters.priority.length +
    filters.taskType.length +
    filters.assignee.length +
    (filters.project ? 1 : 0) +
    (filters.search ? 1 : 0);

  return (
    <div className="flex items-center gap-3 flex-wrap">
      {/* Search */}
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search tasks..."
          value={filters.search}
          onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
          className="pl-9"
        />
      </div>

      {/* Filter Popover */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="relative">
            <Filter className="h-4 w-4 mr-2" />
            Filters
            {activeFilterCount > 0 && (
              <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 flex items-center justify-center">
                {activeFilterCount}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80" align="end">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-sm">Filters</h4>
              {activeFilterCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
                >
                  Clear all
                </Button>
              )}
            </div>

            {/* Status Filter */}
            <div className="space-y-2">
              <Label className="text-xs font-medium">Status</Label>
              <div className="flex flex-wrap gap-2">
                {statusOptions.map(status => (
                  <Badge
                    key={status}
                    variant={filters.status.includes(status) ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => toggleFilter('status', status)}
                  >
                    {status === 'ToDo' ? 'To Do' : status === 'InProgress' ? 'In Progress' : status}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Priority Filter */}
            <div className="space-y-2">
              <Label className="text-xs font-medium">Priority</Label>
              <div className="flex flex-wrap gap-2">
                {priorityOptions.map(priority => (
                  <Badge
                    key={priority}
                    variant={filters.priority.includes(priority) ? 'default' : 'outline'}
                    className={cn(
                      'cursor-pointer',
                      filters.priority.includes(priority) && priority === 'Urgent' && 'bg-red-600',
                      filters.priority.includes(priority) && priority === 'High' && 'bg-orange-600',
                      filters.priority.includes(priority) && priority === 'Medium' && 'bg-yellow-600',
                      filters.priority.includes(priority) && priority === 'Low' && 'bg-green-600'
                    )}
                    onClick={() => toggleFilter('priority', priority)}
                  >
                    {priority}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Task Type Filter */}
            <div className="space-y-2">
              <Label className="text-xs font-medium">Task Type</Label>
              <div className="flex flex-wrap gap-2">
                {taskTypeOptions.map(type => (
                  <Badge
                    key={type}
                    variant={filters.taskType.includes(type) ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => toggleFilter('taskType', type)}
                  >
                    {type === 'ProjectBased' ? 'Project-based' : type}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Project Filter */}
            <div className="space-y-2">
              <Label className="text-xs font-medium">Project</Label>
              <Select
                value={filters.project || 'all'}
                onValueChange={(value) => 
                  onFiltersChange({ ...filters, project: value === 'all' ? null : value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Projects" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Projects</SelectItem>
                  {projects.map(project => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Assignee Filter */}
            <div className="space-y-2">
              <Label className="text-xs font-medium">Assignee</Label>
              <div className="max-h-32 overflow-y-auto space-y-1">
                {employees.map(employee => (
                  <div
                    key={employee.id}
                    className={cn(
                      'flex items-center gap-2 p-2 rounded-md cursor-pointer hover:bg-accent',
                      filters.assignee.includes(employee.id) && 'bg-accent'
                    )}
                    onClick={() => toggleFilter('assignee', employee.id)}
                  >
                    <div className={cn(
                      'h-4 w-4 rounded border-2',
                      filters.assignee.includes(employee.id) 
                        ? 'bg-primary border-primary' 
                        : 'border-muted-foreground'
                    )} />
                    <span className="text-sm">{employee.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Active Filters Display */}
      {activeFilterCount > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          {filters.status.map(status => (
            <Badge key={status} variant="secondary" className="gap-1">
              {status === 'ToDo' ? 'To Do' : status === 'InProgress' ? 'In Progress' : status}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => toggleFilter('status', status)}
              />
            </Badge>
          ))}
          {filters.priority.map(priority => (
            <Badge key={priority} variant="secondary" className="gap-1">
              {priority}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => toggleFilter('priority', priority)}
              />
            </Badge>
          ))}
          {filters.taskType.map(type => (
            <Badge key={type} variant="secondary" className="gap-1">
              {type === 'ProjectBased' ? 'Project-based' : type}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => toggleFilter('taskType', type)}
              />
            </Badge>
          ))}
          {filters.project && (
            <Badge variant="secondary" className="gap-1">
              {projects.find(p => p.id === filters.project)?.name}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => onFiltersChange({ ...filters, project: null })}
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
