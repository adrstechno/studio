'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PageHeader } from '@/components/page-header';
import { useToast } from '@/hooks/use-toast';
import { LoaderCircle, FileText, Clock, FolderKanban, Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';

type DailyLog = {
  id: string;
  summary: string;
  hoursWorked?: number | null;
  category: string;
  date: string;
  createdAt: string;
  employee: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string | null;
    role: string;
  };
  project: {
    id: string;
    name: string;
  };
};

type ProjectOption = {
  id: string;
  name: string;
};

const categoryColors: Record<string, string> = {
  General: 'bg-gray-500/10 text-gray-600 dark:text-gray-300',
  Environment: 'bg-green-500/10 text-green-600 dark:text-green-400',
  Deployment: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  BugFix: 'bg-red-500/10 text-red-600 dark:text-red-400',
  Feature: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
  Documentation: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400',
  Meeting: 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
  Review: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400',
};

export default function AdminDailyLogsPage() {
  const { toast } = useToast();
  const [loading, setLoading] = React.useState(true);
  const [logs, setLogs] = React.useState<DailyLog[]>([]);
  const [projects, setProjects] = React.useState<ProjectOption[]>([]);
  const [selectedProject, setSelectedProject] = React.useState<string>('all');
  const [selectedDate, setSelectedDate] = React.useState<string>(() =>
    format(new Date(), 'yyyy-MM-dd'),
  );
  const [searchQuery, setSearchQuery] = React.useState('');
  const [personType, setPersonType] = React.useState<'all' | 'employee' | 'intern'>('all');

  React.useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      try {
        const [projectsRes, logsRes] = await Promise.all([
          fetch('/api/projects'),
          fetch(`/api/daily-logs?date=${selectedDate}`),
        ]);

        if (!projectsRes.ok) {
          throw new Error('Failed to load projects');
        }
        if (!logsRes.ok) {
          throw new Error('Failed to load daily logs');
        }

        const projectsData = await projectsRes.json();
        const logsData = await logsRes.json();

        setProjects(Array.isArray(projectsData) ? projectsData : []);
        setLogs(Array.isArray(logsData) ? logsData : []);
      } catch (error) {
        console.error('Error loading admin daily logs:', error);
        toast({
          title: 'Error',
          description: 'Failed to load daily logs. Please try again.',
          variant: 'destructive',
        });
        setLogs([]);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, [selectedDate, toast]);

  const fetchLogs = async (options?: {
    project?: string;
    date?: string;
    type?: 'all' | 'employee' | 'intern';
  }) => {
    const project = options?.project ?? selectedProject;
    const date = options?.date ?? selectedDate;
    const type = options?.type ?? personType;

    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (date) params.set('date', date);
      if (project && project !== 'all') params.set('project', project);
      if (type && type !== 'all') params.set('type', type);

      const res = await fetch(`/api/daily-logs?${params.toString()}`);
      if (!res.ok) {
        throw new Error('Failed to load daily logs');
      }

      const data = await res.json();
      setLogs(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching daily logs:', error);
      toast({
        title: 'Error',
        description: 'Failed to load daily logs. Please try again.',
        variant: 'destructive',
      });
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleProjectChange = (value: string) => {
    setSelectedProject(value);
    fetchLogs({ project: value });
  };

  const handleDateChange = (value: string) => {
    setSelectedDate(value);
    fetchLogs({ date: value });
  };

  const handleToday = () => {
    const today = format(new Date(), 'yyyy-MM-dd');
    setSelectedDate(today);
    fetchLogs({ date: today });
  };

  const handlePersonTypeChange = (value: 'all' | 'employee' | 'intern') => {
    setPersonType(value);
    fetchLogs({ type: value });
  };

  const handleClearFilters = () => {
    setSelectedProject('all');
    setSelectedDate('');
    setSearchQuery('');
    setPersonType('all');
    fetchLogs({ project: 'all', date: '', type: 'all' });
  };

  const filteredLogs = React.useMemo(() => {
    if (!searchQuery) return logs;

    const query = searchQuery.toLowerCase();
    return logs.filter((log) => {
      const projectName = log.project?.name || '';
      const employeeName = log.employee?.name || '';
      const employeeEmail = log.employee?.email || '';
      return (
        log.summary.toLowerCase().includes(query) ||
        projectName.toLowerCase().includes(query) ||
        employeeName.toLowerCase().includes(query) ||
        employeeEmail.toLowerCase().includes(query)
      );
    });
  }, [logs, searchQuery]);

  const totalHours = filteredLogs.reduce(
    (sum, log) => sum + (log.hoursWorked || 0),
    0,
  );
  const uniquePeople = new Set(filteredLogs.map((log) => log.employee?.id)).size;
  const uniqueProjects = new Set(
    filteredLogs.map((log) => log.project?.id),
  ).size;

  if (loading && logs.length === 0) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title="Daily Logs"
        description="Review daily work updates from all employees and interns."
      />

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6 space-y-4">
          <div className="grid gap-4 md:grid-cols-4">
            <div className="flex flex-col gap-2">
              <span className="text-xs font-medium text-muted-foreground">
                Project
              </span>
              <Select value={selectedProject} onValueChange={handleProjectChange}>
                <SelectTrigger>
                  <SelectValue placeholder="All projects" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Projects</SelectItem>
                  {projects
                    .filter((p) => p && p.name && p.name !== 'Unassigned')
                    .map((project) => (
                      <SelectItem key={project.id} value={project.name}>
                        {project.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-xs font-medium text-muted-foreground">
                Date
              </span>
              <div className="flex gap-2">
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => handleDateChange(e.target.value)}
                  className="w-full"
                />
                <Button variant="outline" size="sm" onClick={handleToday}>
                  Today
                </Button>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-xs font-medium text-muted-foreground">
                Person Type
              </span>
              <Select
                value={personType}
                onValueChange={(v) => handlePersonTypeChange(v as 'all' | 'employee' | 'intern')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All people" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="employee">Employees</SelectItem>
                  <SelectItem value="intern">Interns</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-xs font-medium text-muted-foreground">
                Search
              </span>
              <Input
                placeholder="Search by person, project, or summary..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {(selectedProject !== 'all' || selectedDate || searchQuery) && (
            <div className="flex justify-end">
              <Button variant="ghost" size="sm" onClick={handleClearFilters}>
                Clear filters
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-primary/10 text-primary">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-bold">{filteredLogs.length}</p>
                <p className="text-sm text-muted-foreground">Total Logs</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-green-500/10 text-green-500">
                <Clock className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalHours}</p>
                <p className="text-sm text-muted-foreground">Total Hours</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-blue-500/10 text-blue-500">
                <FolderKanban className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {uniquePeople} / {uniqueProjects}
                </p>
                <p className="text-sm text-muted-foreground">
                  People / Projects
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Logs List */}
      <Card>
        <CardHeader>
          <CardTitle>Daily Logs</CardTitle>
          <CardDescription>
            All daily work entries from employees and interns, with the latest
            entries first.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredLogs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="font-semibold text-lg mb-2">No logs found</h3>
              <p className="text-sm text-muted-foreground max-w-md">
                Try adjusting the project, date, or search filters to see more
                daily logs.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-start justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={log.employee?.avatarUrl || undefined} />
                      <AvatarFallback>
                        {log.employee?.name?.charAt(0) || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="font-medium">
                          {log.employee?.name || 'Unknown'}
                        </span>
                        {log.employee?.email && (
                          <span className="text-xs text-muted-foreground">
                            ({log.employee.email})
                          </span>
                        )}
                        <Badge
                          variant="outline"
                          className={`text-xs ${categoryColors[log.category] || categoryColors.General}`}
                        >
                          {log.category || 'General'}
                        </Badge>
                        {log.project?.name && (
                          <Badge variant="secondary" className="text-xs">
                            {log.project.name}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm">{log.summary || 'No summary'}</p>
                      <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <CalendarIcon className="h-3 w-3" />
                          {log.date
                            ? format(new Date(log.date), 'MMM dd, yyyy')
                            : 'N/A'}
                        </span>
                        {typeof log.hoursWorked === 'number' && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {log.hoursWorked} hrs
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}

