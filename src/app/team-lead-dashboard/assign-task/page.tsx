'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { PageHeader } from '@/components/page-header';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/firebase';
import { useUser } from '@/firebase/auth/use-user';
import { LoaderCircle, Calendar as CalendarIcon, PlusCircle, Users } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

type Project = {
  id: string;
  name: string;
};

type TeamMember = {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarUrl?: string;
};

export default function AssignTaskPage() {
  const auth = useAuth();
  const { user } = useUser(auth);
  const { toast } = useToast();
  const [loading, setLoading] = React.useState(true);
  const [creating, setCreating] = React.useState(false);
  const [myProjects, setMyProjects] = React.useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = React.useState('');
  const [teamMembers, setTeamMembers] = React.useState<TeamMember[]>([]);
  const [filteredMembers, setFilteredMembers] = React.useState<TeamMember[]>([]);

  const [taskData, setTaskData] = React.useState({
    title: '',
    description: '',
    priority: 'Medium' as 'Low' | 'Medium' | 'High' | 'Urgent',
    dueDate: undefined as Date | undefined,
    assigneeId: '',
  });

  React.useEffect(() => {
    const fetchData = async () => {
      if (!user?.email) return;
      
      try {
        // Get current team lead info
        const empRes = await fetch(`/api/employees/me?email=${encodeURIComponent(user.email)}`);
        if (!empRes.ok) {
          setLoading(false);
          return;
        }
        
        const currentEmployee = await empRes.json();
        
        // Parse team lead's projects
        let projectNames: string[] = [];
        if (currentEmployee.projects) {
          try {
            projectNames = JSON.parse(currentEmployee.projects);
          } catch {
            projectNames = [currentEmployee.project];
          }
        } else if (currentEmployee.project && currentEmployee.project !== 'Unassigned') {
          projectNames = [currentEmployee.project];
        }

        // Fetch all projects to get IDs
        const projRes = await fetch('/api/projects');
        const allProjects = await projRes.json();
        const myProjectsList = Array.isArray(allProjects) 
          ? allProjects.filter((p: any) => projectNames.includes(p.name))
          : [];
        
        setMyProjects(myProjectsList);

        // Fetch all active employees
        const allEmpRes = await fetch('/api/employees');
        const allEmployees = await allEmpRes.json();
        const activeEmployees = Array.isArray(allEmployees) 
          ? allEmployees.filter((emp: any) => emp.isActive !== false && emp.id !== currentEmployee.id)
          : [];
        
        setTeamMembers(activeEmployees);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({ title: 'Error', description: 'Failed to load data', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [user?.email, toast]);

  // Filter team members when project is selected
  React.useEffect(() => {
    if (!selectedProjectId) {
      setFilteredMembers([]);
      return;
    }

    const selectedProject = myProjects.find(p => p.id === selectedProjectId);
    if (!selectedProject) {
      setFilteredMembers([]);
      return;
    }

    // Filter members who are in the selected project
    const membersInProject = teamMembers.filter((member: any) => {
      let memberProjects: string[] = [];
      if (member.projects) {
        try {
          memberProjects = JSON.parse(member.projects);
        } catch {
          memberProjects = [member.project];
        }
      } else if (member.project && member.project !== 'Unassigned') {
        memberProjects = [member.project];
      }
      
      return memberProjects.includes(selectedProject.name);
    });

    setFilteredMembers(membersInProject);
  }, [selectedProjectId, myProjects, teamMembers]);

  const handleCreateTask = async () => {
    if (!taskData.title || !selectedProjectId || !taskData.assigneeId) {
      toast({ 
        title: 'Error', 
        description: 'Please fill in all required fields', 
        variant: 'destructive' 
      });
      return;
    }

    setCreating(true);
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: taskData.title,
          description: taskData.description,
          priority: taskData.priority,
          dueDate: taskData.dueDate?.toISOString(),
          assigneeId: taskData.assigneeId,
          projectId: selectedProjectId,
          status: 'ToDo',
          approvalStatus: 'Approved',
        }),
      });

      if (!res.ok) throw new Error('Failed to create task');

      toast({ title: 'Success', description: 'Task assigned successfully' });
      
      // Reset form
      setTaskData({
        title: '',
        description: '',
        priority: 'Medium',
        dueDate: undefined,
        assigneeId: '',
      });
      setSelectedProjectId('');
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to create task', variant: 'destructive' });
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
      <PageHeader
        title="Assign Task"
        description="Create and assign tasks to your team members"
      />

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>New Task</CardTitle>
          <CardDescription>
            Select a project first, then choose a team member from that project
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Step 1: Select Project */}
          <div className="space-y-2">
            <Label>Project *</Label>
            <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a project" />
              </SelectTrigger>
              <SelectContent>
                {myProjects.length > 0 ? (
                  myProjects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-projects" disabled>
                    No projects available
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
            {myProjects.length === 0 && (
              <p className="text-xs text-muted-foreground">
                You need to be assigned to a project first
              </p>
            )}
          </div>

          {/* Step 2: Select Team Member */}
          <div className="space-y-2">
            <Label>Assign To *</Label>
            <Select 
              value={taskData.assigneeId} 
              onValueChange={(v) => setTaskData({ ...taskData, assigneeId: v })}
              disabled={!selectedProjectId}
            >
              <SelectTrigger>
                <SelectValue placeholder={selectedProjectId ? "Select team member" : "Select project first"} />
              </SelectTrigger>
              <SelectContent>
                {filteredMembers.length > 0 ? (
                  filteredMembers.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        {member.name} - {member.role}
                      </div>
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-members" disabled>
                    {selectedProjectId ? 'No team members in this project' : 'Select a project first'}
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
            {selectedProjectId && filteredMembers.length === 0 && (
              <p className="text-xs text-muted-foreground">
                No team members found in this project
              </p>
            )}
          </div>

          {/* Task Details */}
          <div className="space-y-2">
            <Label>Task Title *</Label>
            <Input
              placeholder="Enter task title"
              value={taskData.title}
              onChange={(e) => setTaskData({ ...taskData, title: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              placeholder="Enter task description"
              value={taskData.description}
              onChange={(e) => setTaskData({ ...taskData, description: e.target.value })}
              rows={4}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select 
                value={taskData.priority} 
                onValueChange={(v: any) => setTaskData({ ...taskData, priority: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Due Date</Label>
              <Popover modal={true}>
                <PopoverTrigger asChild>
                  <Button 
                    variant="outline" 
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !taskData.dueDate && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {taskData.dueDate ? format(taskData.dueDate, 'PPP') : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={taskData.dueDate}
                    onSelect={(date) => setTaskData({ ...taskData, dueDate: date })}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <Button 
            onClick={handleCreateTask} 
            disabled={creating || !taskData.title || !selectedProjectId || !taskData.assigneeId}
            className="w-full"
          >
            {creating ? (
              <LoaderCircle className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <PlusCircle className="h-4 w-4 mr-2" />
            )}
            Assign Task
          </Button>
        </CardContent>
      </Card>
    </>
  );
}
