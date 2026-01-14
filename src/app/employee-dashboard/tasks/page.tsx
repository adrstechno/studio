'use client';

import * as React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { PageHeader } from '@/components/page-header';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, Clock, PlayCircle, Camera, Upload, Users, LoaderCircle, Calendar as CalendarIcon, Eye, Search, Filter, PlusCircle } from 'lucide-react';
import { useAuth } from '@/firebase';
import { useUser } from '@/firebase/auth/use-user';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

type Task = {
    id: string;
    title: string;
    description?: string;
    status: 'ToDo' | 'InProgress' | 'Done';
    priority: 'Low' | 'Medium' | 'High' | 'Urgent';
    dueDate?: string;
    approvalStatus: 'Pending' | 'Approved' | 'Rejected';
    projectId: string;
    project?: { name: string };
    submissions?: { id: string; selfieUrl?: string; notes?: string; submittedAt: string }[];
};

type TeamMember = {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string;
    role: string;
};

const statusConfig = {
    ToDo: { label: 'To Do', color: 'bg-red-500/20 text-red-600 dark:text-red-400', icon: Clock },
    InProgress: { label: 'In Progress', color: 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400', icon: PlayCircle },
    Done: { label: 'Done', color: 'bg-green-500/20 text-green-600 dark:text-green-400', icon: CheckCircle },
};

const priorityConfig = {
    Low: { label: 'Low', color: 'bg-blue-500/10 text-blue-600 border-blue-200' },
    Medium: { label: 'Medium', color: 'bg-yellow-500/10 text-yellow-600 border-yellow-200' },
    High: { label: 'High', color: 'bg-orange-500/10 text-orange-600 border-orange-200' },
    Urgent: { label: 'Urgent', color: 'bg-red-500/10 text-red-600 border-red-200' },
};

export default function EmployeeTasksPage() {
    const [tasks, setTasks] = React.useState<Task[]>([]);
    const [team, setTeam] = React.useState<TeamMember[]>([]);
    const [projects, setProjects] = React.useState<{ id: string; name: string }[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [submitDialogOpen, setSubmitDialogOpen] = React.useState(false);
    const [teamDialogOpen, setTeamDialogOpen] = React.useState(false);
    const [taskDetailsOpen, setTaskDetailsOpen] = React.useState(false);
    const [requestTaskOpen, setRequestTaskOpen] = React.useState(false);
    const [selectedTask, setSelectedTask] = React.useState<Task | null>(null);
    const [selfieUrl, setSelfieUrl] = React.useState('');
    const [notes, setNotes] = React.useState('');
    const [submitting, setSubmitting] = React.useState(false);
    
    // Filters
    const [searchQuery, setSearchQuery] = React.useState('');
    const [priorityFilter, setPriorityFilter] = React.useState<string>('all');
    
    // Request task form
    const [newTaskRequest, setNewTaskRequest] = React.useState({
        title: '',
        description: '',
        priority: 'Medium' as Task['priority'],
        dueDate: undefined as Date | undefined,
        projectId: '',
    });
    const [requesting, setRequesting] = React.useState(false);
    
    const { toast } = useToast();
    const auth = useAuth();
    const { user } = useUser(auth);
    const [employeeId, setEmployeeId] = React.useState<string | null>(null);
    const [projectName, setProjectName] = React.useState<string>('');

    // Fetch employee data and tasks
    React.useEffect(() => {
        const fetchData = async () => {
            if (!user?.email) return;
            try {
                // Get employee by email
                const empRes = await fetch('/api/employees');
                const employees = await empRes.json();
                const currentEmployee = employees.find((e: { email: string }) => e.email === user.email);

                if (currentEmployee) {
                    setEmployeeId(currentEmployee.id);
                    setProjectName(currentEmployee.project);

                    // Fetch tasks for this employee
                    const tasksRes = await fetch(`/api/tasks?assigneeId=${currentEmployee.id}`);
                    const tasksData = await tasksRes.json();
                    setTasks(tasksData);

                    // Fetch team members
                    const teamRes = await fetch(`/api/projects/${encodeURIComponent(currentEmployee.project)}/team`);
                    const teamData = await teamRes.json();
                    setTeam(teamData);

                    // Fetch all projects
                    const projectsRes = await fetch('/api/projects');
                    const projectsData = await projectsRes.json();
                    setProjects(projectsData);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user?.email]);

    const handleSubmitTask = async () => {
        if (!selectedTask || !employeeId) return;
        setSubmitting(true);
        try {
            const res = await fetch(`/api/tasks/${selectedTask.id}/submit`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ employeeId, selfieUrl, notes }),
            });
            if (!res.ok) throw new Error('Failed to submit');

            // Update local state
            setTasks((prev) => prev.map((t) =>
                t.id === selectedTask.id ? { ...t, status: 'Done' as const } : t
            ));

            toast({ title: 'Task Submitted!', description: 'Your work has been recorded.' });
            setSubmitDialogOpen(false);
            setSelfieUrl('');
            setNotes('');
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to submit task', variant: 'destructive' });
        } finally {
            setSubmitting(false);
        }
    };

    const handleRequestTask = async () => {
        if (!newTaskRequest.title || !employeeId || !newTaskRequest.projectId) {
            toast({ title: 'Error', description: 'Please fill all required fields', variant: 'destructive' });
            return;
        }
        
        setRequesting(true);
        try {
            const res = await fetch('/api/tasks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...newTaskRequest,
                    dueDate: newTaskRequest.dueDate?.toISOString(),
                    assigneeId: employeeId,
                    projectId: newTaskRequest.projectId,
                    status: 'ToDo',
                    approvalStatus: 'Pending',
                    requestedBy: employeeId,
                }),
            });
            
            if (!res.ok) throw new Error('Failed to request task');
            
            const createdTask = await res.json();
            setTasks([createdTask, ...tasks]);
            setRequestTaskOpen(false);
            setNewTaskRequest({
                title: '',
                description: '',
                priority: 'Medium',
                dueDate: undefined,
                projectId: '',
            });
            toast({ 
                title: 'Task Requested!', 
                description: 'Your task request has been sent to admin for approval.' 
            });
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to request task', variant: 'destructive' });
        } finally {
            setRequesting(false);
        }
    };

    const tasksByStatus = {
        ToDo: tasks.filter((t) => t.status === 'ToDo'),
        InProgress: tasks.filter((t) => t.status === 'InProgress'),
        Done: tasks.filter((t) => t.status === 'Done'),
    };

    // Filter tasks
    const filteredTasks = tasks.filter((task) => {
        if (searchQuery && !task.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        if (priorityFilter !== 'all' && task.priority !== priorityFilter) return false;
        return true;
    });

    const filteredTasksByStatus = {
        ToDo: filteredTasks.filter((t) => t.status === 'ToDo'),
        InProgress: filteredTasks.filter((t) => t.status === 'InProgress'),
        Done: filteredTasks.filter((t) => t.status === 'Done'),
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
            <PageHeader title="My Tasks" description={`Tasks assigned to you in ${projectName}`}>
                <div className="flex gap-2">
                    <Button onClick={() => setRequestTaskOpen(true)}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Request Task
                    </Button>
                    <Button variant="outline" onClick={() => setTeamDialogOpen(true)}>
                        <Users className="mr-2 h-4 w-4" />
                        View Team ({team.length})
                    </Button>
                </div>
            </PageHeader>

            {/* Filters */}
            <div className="flex flex-wrap gap-3 mb-6">
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search tasks..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                    />
                </div>
                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                    <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="Priority" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Priority</SelectItem>
                        <SelectItem value="Low">Low</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="High">High</SelectItem>
                        <SelectItem value="Urgent">Urgent</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Task Stats */}
            <div className="grid gap-4 md:grid-cols-3 mb-6">
                {Object.entries(statusConfig).map(([status, config]) => {
                    const Icon = config.icon;
                    const count = tasksByStatus[status as keyof typeof tasksByStatus].length;
                    return (
                        <Card key={status}>
                            <CardContent className="pt-6">
                                <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-lg ${config.color}`}>
                                        <Icon className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold">{count}</p>
                                        <p className="text-sm text-muted-foreground">{config.label}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Tasks Grid */}
            <div className="grid gap-6 md:grid-cols-3">
                {Object.entries(filteredTasksByStatus).map(([status, statusTasks]) => {
                    const config = statusConfig[status as keyof typeof statusConfig];
                    return (
                        <div key={status}>
                            <h3 className="font-semibold mb-4 flex items-center gap-2">
                                <span className={`w-3 h-3 rounded-full ${config.color.split(' ')[0]}`} />
                                {config.label} ({statusTasks.length})
                            </h3>
                            <div className="space-y-3">
                                {statusTasks.map((task) => (
                                    <Card key={task.id} className="hover:shadow-md transition-shadow">
                                        <CardContent className="p-4">
                                            <div className="flex items-start justify-between mb-2">
                                                <h4 className="font-medium flex-1">{task.title}</h4>
                                                <div className="flex gap-1 ml-2">
                                                    <Badge variant="outline" className={cn('text-xs', priorityConfig[task.priority].color)}>
                                                        {task.priority}
                                                    </Badge>
                                                    {task.approvalStatus === 'Pending' && (
                                                        <Badge variant="outline" className="text-xs bg-yellow-500/10 text-yellow-600 border-yellow-200">
                                                            Pending
                                                        </Badge>
                                                    )}
                                                    {task.approvalStatus === 'Rejected' && (
                                                        <Badge variant="outline" className="text-xs bg-red-500/10 text-red-600 border-red-200">
                                                            Rejected
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                            {task.description && (
                                                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{task.description}</p>
                                            )}
                                            {task.dueDate && (
                                                <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
                                                    <CalendarIcon className="h-3 w-3" />
                                                    <span>Due: {format(new Date(task.dueDate), 'MMM dd, yyyy')}</span>
                                                </div>
                                            )}
                                            <div className="flex items-center justify-between gap-2">
                                                <Badge variant="outline" className="text-xs">{task.project?.name || projectName}</Badge>
                                                <div className="flex gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => { setSelectedTask(task); setTaskDetailsOpen(true); }}
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                    {status !== 'Done' && (
                                                        <Button
                                                            size="sm"
                                                            onClick={() => { setSelectedTask(task); setSubmitDialogOpen(true); }}
                                                        >
                                                            <Camera className="h-4 w-4 mr-1" />
                                                            Submit
                                                        </Button>
                                                    )}
                                                    {status === 'Done' && task.submissions?.[0]?.selfieUrl && (
                                                        <Avatar className="h-8 w-8">
                                                            <AvatarImage src={task.submissions[0].selfieUrl} />
                                                            <AvatarFallback>✓</AvatarFallback>
                                                        </Avatar>
                                                    )}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                                {statusTasks.length === 0 && (
                                    <p className="text-sm text-muted-foreground text-center py-8">No tasks</p>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Submit Task Dialog */}
            <Dialog open={submitDialogOpen} onOpenChange={setSubmitDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Submit Task</DialogTitle>
                        <DialogDescription>Complete "{selectedTask?.title}" with a selfie and notes.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label>Selfie / Proof Image URL</Label>
                            <div className="flex gap-2">
                                <Input
                                    placeholder="https://example.com/selfie.jpg"
                                    value={selfieUrl}
                                    onChange={(e) => setSelfieUrl(e.target.value)}
                                />
                                {selfieUrl && (
                                    <Avatar className="h-10 w-10">
                                        <AvatarImage src={selfieUrl} />
                                        <AvatarFallback><Camera className="h-4 w-4" /></AvatarFallback>
                                    </Avatar>
                                )}
                            </div>
                            <p className="text-xs text-muted-foreground">Upload your image to a service like Imgur and paste the URL</p>
                        </div>
                        <div className="grid gap-2">
                            <Label>Notes (Optional)</Label>
                            <Textarea
                                placeholder="Describe what you completed..."
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                rows={3}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setSubmitDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleSubmitTask} disabled={submitting}>
                            {submitting ? <LoaderCircle className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle className="h-4 w-4 mr-2" />}
                            Submit Task
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Request Task Dialog */}
            <Dialog open={requestTaskOpen} onOpenChange={setRequestTaskOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Request New Task</DialogTitle>
                        <DialogDescription>
                            Request a new task for any project. Admin will review and approve it.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="req-title">Task Title *</Label>
                            <Input
                                id="req-title"
                                value={newTaskRequest.title}
                                onChange={(e) => setNewTaskRequest({ ...newTaskRequest, title: e.target.value })}
                                placeholder="What needs to be done?"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="req-description">Description</Label>
                            <Textarea
                                id="req-description"
                                value={newTaskRequest.description}
                                onChange={(e) => setNewTaskRequest({ ...newTaskRequest, description: e.target.value })}
                                placeholder="Provide details about the task..."
                                rows={3}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label>Project *</Label>
                            <Select 
                                value={newTaskRequest.projectId} 
                                onValueChange={(v) => setNewTaskRequest({ ...newTaskRequest, projectId: v })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a project" />
                                </SelectTrigger>
                                <SelectContent>
                                    {projects.map((project) => (
                                        <SelectItem key={project.id} value={project.id}>
                                            {project.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label>Priority</Label>
                                <Select 
                                    value={newTaskRequest.priority} 
                                    onValueChange={(v) => setNewTaskRequest({ ...newTaskRequest, priority: v as Task['priority'] })}
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
                            <div className="grid gap-2">
                                <Label>Requested Due Date</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button 
                                            variant="outline" 
                                            className={cn(
                                                'justify-start text-left font-normal', 
                                                !newTaskRequest.dueDate && 'text-muted-foreground'
                                            )}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {newTaskRequest.dueDate ? format(newTaskRequest.dueDate, 'PPP') : 'Pick a date'}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <Calendar 
                                            mode="single" 
                                            selected={newTaskRequest.dueDate} 
                                            onSelect={(date) => setNewTaskRequest({ ...newTaskRequest, dueDate: date })} 
                                            initialFocus 
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </div>
                        <div className="p-3 rounded-lg bg-muted/50">
                            <p className="text-sm text-muted-foreground">
                                This task will be assigned to you once approved by admin.
                            </p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setRequestTaskOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleRequestTask} disabled={requesting}>
                            {requesting ? <LoaderCircle className="h-4 w-4 animate-spin mr-2" /> : <PlusCircle className="h-4 w-4 mr-2" />}
                            Request Task
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Team Dialog */}
            <Dialog open={teamDialogOpen} onOpenChange={setTeamDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Project Team: {projectName}</DialogTitle>
                        <DialogDescription>{team.length} team members working on this project</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3 max-h-[300px] overflow-y-auto">
                        {team.map((member) => (
                            <div key={member.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
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
                        ))}
                    </div>
                    <DialogFooter>
                        <Button onClick={() => setTeamDialogOpen(false)}>Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Task Details Sheet */}
            <Sheet open={taskDetailsOpen} onOpenChange={setTaskDetailsOpen}>
                <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
                    {selectedTask && (
                        <>
                            <SheetHeader>
                                <SheetTitle>{selectedTask.title}</SheetTitle>
                                <SheetDescription>Task details and information</SheetDescription>
                                <div className="flex items-center gap-2 mt-2">
                                    <Badge variant="outline" className={cn('text-xs', priorityConfig[selectedTask.priority].color)}>
                                        {selectedTask.priority}
                                    </Badge>
                                    <Badge variant="outline" className={cn('text-xs', statusConfig[selectedTask.status].color)}>
                                        {statusConfig[selectedTask.status].label}
                                    </Badge>
                                </div>
                            </SheetHeader>

                            <div className="mt-6 space-y-6">
                                {/* Description */}
                                <div>
                                    <h4 className="font-semibold mb-2">Description</h4>
                                    <p className="text-sm text-muted-foreground">
                                        {selectedTask.description || 'No description provided'}
                                    </p>
                                </div>

                                {/* Details */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <h4 className="font-semibold mb-2 text-sm">Project</h4>
                                        <Badge variant="outline">{selectedTask.project?.name || projectName}</Badge>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold mb-2 text-sm">Due Date</h4>
                                        <p className="text-sm text-muted-foreground">
                                            {selectedTask.dueDate ? format(new Date(selectedTask.dueDate), 'PPP') : 'No due date'}
                                        </p>
                                    </div>
                                </div>

                                {/* Submission Info */}
                                {selectedTask.submissions && selectedTask.submissions.length > 0 && (
                                    <div>
                                        <h4 className="font-semibold mb-3">Submission</h4>
                                        <div className="p-4 rounded-lg bg-muted/50">
                                            {selectedTask.submissions[0].selfieUrl && (
                                                <div className="mb-3">
                                                    <Avatar className="h-20 w-20">
                                                        <AvatarImage src={selectedTask.submissions[0].selfieUrl} />
                                                        <AvatarFallback>IMG</AvatarFallback>
                                                    </Avatar>
                                                </div>
                                            )}
                                            {selectedTask.submissions[0].notes && (
                                                <div>
                                                    <p className="text-sm font-medium mb-1">Notes:</p>
                                                    <p className="text-sm text-muted-foreground">{selectedTask.submissions[0].notes}</p>
                                                </div>
                                            )}
                                            <p className="text-xs text-muted-foreground mt-2">
                                                Submitted: {format(new Date(selectedTask.submissions[0].submittedAt), 'PPp')}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Actions */}
                                {selectedTask.status !== 'Done' && (
                                    <div className="pt-4 border-t">
                                        <Button 
                                            className="w-full" 
                                            onClick={() => { 
                                                setTaskDetailsOpen(false); 
                                                setSubmitDialogOpen(true); 
                                            }}
                                        >
                                            <Camera className="h-4 w-4 mr-2" />
                                            Submit Task
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </SheetContent>
            </Sheet>
        </>
    );
}
