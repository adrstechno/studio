'use client';

import * as React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { PageHeader } from '@/components/page-header';
import { useToast } from '@/hooks/use-toast';
import {
  PlusCircle,
  Calendar as CalendarIcon,
  Users,
  ListTodo,
  FileText,
  LoaderCircle,
  CheckCircle2,
  AlertCircle,
  Clock,
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

type Project = {
  id: string;
  name: string;
  clientName?: string;
  status: 'OnTrack' | 'AtRisk' | 'Completed';
  progress: number;
  startDate?: string;
  endDate?: string;
  description?: string;
  team?: { id: string; name: string; email: string; avatarUrl?: string; role: string }[];
  tasks?: { id: string; title: string; status: string }[];
  createdAt: string;
};

const statusConfig = {
  OnTrack: { label: 'On Track', color: 'bg-green-500/10 text-green-600 border-green-200', icon: CheckCircle2 },
  AtRisk: { label: 'At Risk', color: 'bg-yellow-500/10 text-yellow-600 border-yellow-200', icon: AlertCircle },
  Completed: { label: 'Completed', color: 'bg-blue-500/10 text-blue-600 border-blue-200', icon: CheckCircle2 },
};

export default function ProjectsPage() {
  const [projects, setProjects] = React.useState<Project[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [createDialogOpen, setCreateDialogOpen] = React.useState(false);
  const [selectedProject, setSelectedProject] = React.useState<Project | null>(null);
  
  const [newProject, setNewProject] = React.useState({
    name: '',
    clientName: '',
    description: '',
    status: 'OnTrack' as Project['status'],
    startDate: undefined as Date | undefined,
    endDate: undefined as Date | undefined,
  });
  const [creating, setCreating] = React.useState(false);
  
  const { toast } = useToast();

  React.useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await fetch('/api/projects');
      const data = await res.json();
      setProjects(data);
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast({ title: 'Error', description: 'Failed to load projects', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async () => {
    if (!newProject.name) {
      toast({ title: 'Error', description: 'Project name is required', variant: 'destructive' });
      return;
    }
    
    setCreating(true);
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newProject,
          startDate: newProject.startDate?.toISOString(),
          endDate: newProject.endDate?.toISOString(),
        }),
      });
      
      if (!res.ok) throw new Error('Failed to create project');
      
      const createdProject = await res.json();
      setProjects([createdProject, ...projects]);
      setCreateDialogOpen(false);
      setNewProject({
        name: '',
        clientName: '',
        description: '',
        status: 'OnTrack',
        startDate: undefined,
        endDate: undefined,
      });
      toast({ title: 'Success', description: 'Project created successfully' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to create project', variant: 'destructive' });
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <PageHeader title="Projects" description="Manage and track all your projects.">
        <Button onClick={() => setCreateDialogOpen(true)}>
          <PlusCircle className="h-4 w-4 mr-2" />
          New Project
        </Button>
      </PageHeader>

      {/* Projects Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => {
          const StatusIcon = statusConfig[project.status].icon;
          return (
            <Card key={project.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setSelectedProject(project)}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{project.name}</CardTitle>
                    {project.clientName && (
                      <CardDescription className="mt-1">{project.clientName}</CardDescription>
                    )}
                  </div>
                  <Badge variant="outline" className={cn('text-xs', statusConfig[project.status].color)}>
                    <StatusIcon className="h-3 w-3 mr-1" />
                    {statusConfig[project.status].label}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium">{project.progress}%</span>
                  </div>
                  <Progress value={project.progress} className="h-2" />
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>{project.team?.length || 0} members</span>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <ListTodo className="h-4 w-4" />
                    <span>{project.tasks?.length || 0} tasks</span>
                  </div>
                </div>

                {(project.startDate || project.endDate) && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <CalendarIcon className="h-3 w-3" />
                    <span>
                      {project.startDate && format(new Date(project.startDate), 'MMM dd')}
                      {project.startDate && project.endDate && ' - '}
                      {project.endDate && format(new Date(project.endDate), 'MMM dd, yyyy')}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {projects.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-semibold text-lg mb-2">No projects yet</h3>
            <p className="text-muted-foreground text-sm mb-4">Create your first project to get started</p>
            <Button onClick={() => setCreateDialogOpen(true)}>
              <PlusCircle className="h-4 w-4 mr-2" />
              Create Project
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Create Project Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
            <DialogDescription>Add a new project to track progress and manage team members.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Project Name *</Label>
              <Input
                id="name"
                value={newProject.name}
                onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                placeholder="Project name"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="clientName">Client Name</Label>
              <Input
                id="clientName"
                value={newProject.clientName}
                onChange={(e) => setNewProject({ ...newProject, clientName: e.target.value })}
                placeholder="Client or company name"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={newProject.description}
                onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                placeholder="Project description"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn('justify-start text-left font-normal', !newProject.startDate && 'text-muted-foreground')}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {newProject.startDate ? format(newProject.startDate, 'PPP') : 'Pick a date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={newProject.startDate} onSelect={(date) => setNewProject({ ...newProject, startDate: date })} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="grid gap-2">
                <Label>End Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn('justify-start text-left font-normal', !newProject.endDate && 'text-muted-foreground')}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {newProject.endDate ? format(newProject.endDate, 'PPP') : 'Pick a date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={newProject.endDate} onSelect={(date) => setNewProject({ ...newProject, endDate: date })} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Project Status</Label>
              <Select value={newProject.status} onValueChange={(v) => setNewProject({ ...newProject, status: v as Project['status'] })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="OnTrack">On Track</SelectItem>
                  <SelectItem value="AtRisk">At Risk</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateProject} disabled={creating}>
              {creating ? <LoaderCircle className="h-4 w-4 animate-spin mr-2" /> : <PlusCircle className="h-4 w-4 mr-2" />}
              Create Project
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Project Details Sheet */}
      <Sheet open={!!selectedProject} onOpenChange={(open) => !open && setSelectedProject(null)}>
        <SheetContent className="w-full sm:max-w-3xl overflow-y-auto">
          {selectedProject && (
            <>
              <SheetHeader>
                <SheetTitle>{selectedProject.name}</SheetTitle>
                <SheetDescription>
                  {selectedProject.clientName && <span>Client: {selectedProject.clientName}</span>}
                </SheetDescription>
                <div className="mt-2">
                  <Badge variant="outline" className={cn('text-xs', statusConfig[selectedProject.status].color)}>
                    {statusConfig[selectedProject.status].label}
                  </Badge>
                </div>
              </SheetHeader>
              
              <Tabs defaultValue="overview" className="mt-6">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="members">Members</TabsTrigger>
                  <TabsTrigger value="tasks">Tasks</TabsTrigger>
                  <TabsTrigger value="files">Files</TabsTrigger>
                </TabsList>
                
                <TabsContent value="overview" className="space-y-4 mt-4">
                  <div>
                    <h4 className="font-semibold mb-2">Description</h4>
                    <p className="text-sm text-muted-foreground">
                      {selectedProject.description || 'No description provided'}
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Progress</h4>
                    <div className="space-y-2">
                      <Progress value={selectedProject.progress} className="h-3" />
                      <p className="text-sm text-muted-foreground">{selectedProject.progress}% complete</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold mb-2 text-sm">Start Date</h4>
                      <p className="text-sm text-muted-foreground">
                        {selectedProject.startDate ? format(new Date(selectedProject.startDate), 'PPP') : 'Not set'}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2 text-sm">End Date</h4>
                      <p className="text-sm text-muted-foreground">
                        {selectedProject.endDate ? format(new Date(selectedProject.endDate), 'PPP') : 'Not set'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                          <Users className="h-8 w-8 text-primary" />
                          <div>
                            <p className="text-2xl font-bold">{selectedProject.team?.length || 0}</p>
                            <p className="text-sm text-muted-foreground">Team Members</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                          <ListTodo className="h-8 w-8 text-primary" />
                          <div>
                            <p className="text-2xl font-bold">{selectedProject.tasks?.length || 0}</p>
                            <p className="text-sm text-muted-foreground">Total Tasks</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
                
                <TabsContent value="members" className="space-y-3 mt-4">
                  {selectedProject.team && selectedProject.team.length > 0 ? (
                    selectedProject.team.map((member) => (
                      <Card key={member.id}>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={member.avatarUrl} />
                              <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <p className="font-medium">{member.name}</p>
                              <p className="text-sm text-muted-foreground">{member.email}</p>
                            </div>
                            <Badge variant="outline">{member.role}</Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-8">No team members assigned</p>
                  )}
                </TabsContent>
                
                <TabsContent value="tasks" className="space-y-3 mt-4">
                  {selectedProject.tasks && selectedProject.tasks.length > 0 ? (
                    selectedProject.tasks.map((task) => (
                      <Card key={task.id}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <p className="font-medium">{task.title}</p>
                            <Badge variant="outline">{task.status}</Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-8">No tasks created yet</p>
                  )}
                </TabsContent>
                
                <TabsContent value="files" className="mt-4">
                  <p className="text-sm text-muted-foreground text-center py-8">File management coming soon</p>
                </TabsContent>
              </Tabs>
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
