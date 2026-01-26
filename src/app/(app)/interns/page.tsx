'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { MoreHorizontal, PlusCircle, FileText, UserCog, Trash2, Search, Users, LoaderCircle, UserX, ImagePlus, GraduationCap, Calendar, DollarSign, Star, XCircle } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

// Form validation schema
const internFormSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    phone: z.string().optional(),
    university: z.string().optional(),
    degree: z.string().optional(),
    startDate: z.string().min(1, 'Start date is required'),
    endDate: z.string().optional(),
    mentorId: z.string().optional(),
    project: z.string().optional(),
    avatarUrl: z.string().optional(),
});

type InternFormValues = z.infer<typeof internFormSchema>;

type Intern = {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
    avatarUrl: string | null;
    university?: string | null;
    degree?: string | null;
    startDate: string;
    endDate: string;
    status: 'Upcoming' | 'Active' | 'Completed' | 'Terminated';
    stipendAmount?: number | null;
    mentorId?: string | null;
    project: string;
    projects?: string | null;
    terminationDate?: string | null;
    terminationReason?: string | null;
    mentor?: {
        id: string;
        name: string;
        email: string;
    } | null;
    evaluations?: Array<{
        id: string;
        rating: number;
        feedback?: string | null;
        createdAt: string;
    }>;
};

type Employee = {
    id: string;
    name: string;
    email: string;
    role: string;
};

type Project = {
    id: string;
    name: string;
};

const statusColors: Record<string, string> = {
    Upcoming: 'bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/20',
    Active: 'bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/20',
    Completed: 'bg-gray-500/20 text-gray-600 dark:text-gray-400 border-gray-500/20',
    Terminated: 'bg-red-500/20 text-red-600 dark:text-red-400 border-red-500/20',
};

export default function InternsPage() {
    const [interns, setInterns] = React.useState<Intern[]>([]);
    const [employees, setEmployees] = React.useState<Employee[]>([]);
    const [projects, setProjects] = React.useState<Project[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [selectedIntern, setSelectedIntern] = React.useState<Intern | null>(null);
    const [addDialogOpen, setAddDialogOpen] = React.useState(false);
    const [editDialogOpen, setEditDialogOpen] = React.useState(false);
    const [detailsDialogOpen, setDetailsDialogOpen] = React.useState(false);
    const [terminateDialogOpen, setTerminateDialogOpen] = React.useState(false);
    const [terminationReason, setTerminationReason] = React.useState('');
    const [searchQuery, setSearchQuery] = React.useState('');
    const [filterStatus, setFilterStatus] = React.useState<string>('all');
    const [filterProject, setFilterProject] = React.useState<string>('all');
    const [uploadingImage, setUploadingImage] = React.useState(false);
    const [previewImage, setPreviewImage] = React.useState<string>('');
    const { toast } = useToast();

    const addForm = useForm<InternFormValues>({
        resolver: zodResolver(internFormSchema),
        mode: 'onChange',
        defaultValues: {
            name: '',
            email: '',
            phone: '',
            university: '',
            degree: '',
            startDate: '',
            endDate: '',
            mentorId: '',
            project: '',
            avatarUrl: '',
        },
    });

    const editForm = useForm<InternFormValues>({
        resolver: zodResolver(internFormSchema),
        mode: 'onChange',
    });

    const fetchData = React.useCallback(async () => {
        try {
            const [internsRes, employeesRes, projectsRes] = await Promise.all([
                fetch('/api/interns'),
                fetch('/api/employees'),
                fetch('/api/projects'),
            ]);
            const internsData = await internsRes.json();
            const employeesData = await employeesRes.json();
            const projectsData = await projectsRes.json();
            setInterns(Array.isArray(internsData) ? internsData : []);
            setEmployees(Array.isArray(employeesData) ? employeesData : []);
            setProjects(Array.isArray(projectsData) ? projectsData : []);
        } catch (error) {
            console.error('Error fetching data:', error);
            toast({ title: 'Error', description: 'Failed to load data', variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    }, [toast]);

    React.useEffect(() => {
        fetchData();
    }, [fetchData]);

    const filteredInterns = interns.filter((intern) => {
        const matchesSearch =
            intern.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            intern.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            intern.university?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = filterStatus === 'all' || intern.status === filterStatus;
        const matchesProject = filterProject === 'all' || intern.project === filterProject;
        return matchesSearch && matchesStatus && matchesProject;
    });

    const handleImageUpload = async (file: File, formType: 'add' | 'edit') => {
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            toast({ title: 'Invalid file type', description: 'Please upload an image file', variant: 'destructive' });
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            toast({ title: 'File too large', description: 'Image must be less than 5MB', variant: 'destructive' });
            return;
        }

        setUploadingImage(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            const response = await fetch('/api/upload', { method: 'POST', body: formData });
            if (!response.ok) throw new Error('Upload failed');
            const data = await response.json();

            if (formType === 'add') {
                addForm.setValue('avatarUrl', data.url);
                setPreviewImage(data.url);
            } else {
                editForm.setValue('avatarUrl', data.url);
                if (selectedIntern) {
                    setSelectedIntern({ ...selectedIntern, avatarUrl: data.url });
                }
            }
            toast({ title: 'Success', description: 'Image uploaded successfully' });
        } catch (error) {
            toast({ title: 'Upload failed', description: 'Failed to upload image', variant: 'destructive' });
        } finally {
            setUploadingImage(false);
        }
    };

    const handleAddIntern = async (values: InternFormValues) => {
        try {
            const res = await fetch('/api/interns', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(values),
            });
            const data = await res.json();
            if (!res.ok) {
                if (data.code === 'DUPLICATE_EMAIL') {
                    toast({ title: 'Error', description: 'An intern with this email already exists', variant: 'destructive' });
                } else {
                    throw new Error(data.error || 'Failed to add intern');
                }
                return;
            }
            await fetchData();
            toast({ title: 'Success', description: `${data.name} has been added as an intern` });
            setAddDialogOpen(false);
            addForm.reset();
            setPreviewImage('');
        } catch (error: any) {
            toast({ title: 'Error', description: error.message || 'Failed to add intern', variant: 'destructive' });
        }
    };

    const handleUpdateIntern = async (values: InternFormValues) => {
        if (!selectedIntern) return;
        try {
            const res = await fetch(`/api/interns/${selectedIntern.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(values),
            });
            if (!res.ok) throw new Error('Failed to update');
            const updated = await res.json();
            await fetchData();
            toast({ title: 'Success', description: `${updated.name} has been updated` });
            setEditDialogOpen(false);
            editForm.reset();
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to update intern', variant: 'destructive' });
        }
    };

    const handleDeleteIntern = async (intern: Intern) => {
        try {
            const res = await fetch(`/api/interns/${intern.id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Failed to delete');
            setInterns((prev) => prev.filter((i) => i.id !== intern.id));
            toast({ title: 'Deleted', description: `${intern.name} has been removed`, variant: 'destructive' });
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to delete intern', variant: 'destructive' });
        }
    };

    const handleTerminateInternship = async () => {
        if (!selectedIntern) return;
        try {
            const res = await fetch(`/api/interns/${selectedIntern.id}/terminate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reason: terminationReason }),
            });
            if (!res.ok) throw new Error('Failed to terminate');
            await fetchData();
            toast({ title: 'Terminated', description: 'Internship has been terminated' });
            setTerminateDialogOpen(false);
            setTerminationReason('');
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to terminate internship', variant: 'destructive' });
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
            <PageHeader title="Interns Management" description="Manage interns, track their progress, and assign mentors.">
                <Button onClick={() => setAddDialogOpen(true)}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Intern
                </Button>
            </PageHeader>

            {/* Filters */}
            <Card className="mb-6">
                <CardContent className="pt-6">
                    <div className="flex flex-wrap gap-4">
                        <div className="flex-1 min-w-[200px]">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search by name, email, or university..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-9"
                                />
                            </div>
                        </div>
                        <Select value={filterStatus} onValueChange={setFilterStatus}>
                            <SelectTrigger className="w-[150px]">
                                <SelectValue placeholder="Filter by status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="Upcoming">Upcoming</SelectItem>
                                <SelectItem value="Active">Active</SelectItem>
                                <SelectItem value="Completed">Completed</SelectItem>
                                <SelectItem value="Terminated">Terminated</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={filterProject} onValueChange={setFilterProject}>
                            <SelectTrigger className="w-[150px]">
                                <SelectValue placeholder="Filter by project" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Projects</SelectItem>
                                {projects.map((proj) => (
                                    <SelectItem key={proj.id} value={proj.name}>{proj.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Interns Table */}
            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Intern</TableHead>
                                <TableHead>University</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Duration</TableHead>
                                <TableHead>Mentor</TableHead>
                                <TableHead>Project</TableHead>
                                <TableHead><span className="sr-only">Actions</span></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredInterns.length > 0 ? filteredInterns.map((intern) => (
                                <TableRow key={intern.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-10 w-10">
                                                <AvatarImage src={intern.avatarUrl || undefined} alt={intern.name} />
                                                <AvatarFallback>{intern.name.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-medium">{intern.name}</p>
                                                <p className="text-sm text-muted-foreground">{intern.email}</p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <GraduationCap className="h-4 w-4 text-muted-foreground" />
                                            <div>
                                                <p className="text-sm">{intern.university || 'Not specified'}</p>
                                                {intern.degree && <p className="text-xs text-muted-foreground">{intern.degree}</p>}
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={statusColors[intern.status]}>
                                            {intern.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-muted-foreground" />
                                            <div className="text-sm">
                                                <p>{new Date(intern.startDate).toLocaleDateString()}</p>
                                                <p className="text-muted-foreground">to {new Date(intern.endDate).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {intern.mentor ? (
                                            <div className="text-sm">
                                                <p className="font-medium">{intern.mentor.name}</p>
                                                <p className="text-muted-foreground">{intern.mentor.email}</p>
                                            </div>
                                        ) : (
                                            <span className="text-sm text-muted-foreground">No mentor</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={intern.project === 'Unassigned' ? 'secondary' : 'default'}>
                                            {intern.project}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => {
                                                    setSelectedIntern(intern);
                                                    editForm.reset({
                                                        name: intern.name,
                                                        email: intern.email,
                                                        phone: intern.phone || '',
                                                        university: intern.university || '',
                                                        degree: intern.degree || '',
                                                        startDate: intern.startDate.split('T')[0],
                                                        endDate: intern.endDate.split('T')[0],
                                                        mentorId: intern.mentorId || '',
                                                        project: intern.project,
                                                        avatarUrl: intern.avatarUrl || '',
                                                    });
                                                    setEditDialogOpen(true);
                                                }}>
                                                    <UserCog className="mr-2 h-4 w-4" />Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => { setSelectedIntern(intern); setDetailsDialogOpen(true); }}>
                                                    <FileText className="mr-2 h-4 w-4" />View Details
                                                </DropdownMenuItem>
                                                {intern.status === 'Active' && (
                                                    <DropdownMenuItem onClick={() => { setSelectedIntern(intern); setTerminateDialogOpen(true); }} className="text-orange-600">
                                                        <XCircle className="mr-2 h-4 w-4" />Terminate
                                                    </DropdownMenuItem>
                                                )}
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem className="text-red-500" onClick={() => handleDeleteIntern(intern)}>
                                                    <Trash2 className="mr-2 h-4 w-4" />Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                        No interns found
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Add Intern Dialog */}
            <Dialog open={addDialogOpen} onOpenChange={(open) => {
                setAddDialogOpen(open);
                if (!open) {
                    addForm.reset();
                    setPreviewImage('');
                }
            }}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Add New Intern</DialogTitle>
                        <DialogDescription>Add a new intern to your organization.</DialogDescription>
                    </DialogHeader>
                    <Form {...addForm}>
                        <form onSubmit={addForm.handleSubmit(handleAddIntern)} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={addForm.control}
                                    name="avatarUrl"
                                    render={({ field }) => (
                                        <FormItem className="col-span-2">
                                            <FormLabel>Profile Image</FormLabel>
                                            <FormControl>
                                                <div className="flex items-center gap-4">
                                                    <Avatar className="h-20 w-20">
                                                        <AvatarImage src={previewImage || field.value || undefined} />
                                                        <AvatarFallback><ImagePlus className="h-8 w-8 text-muted-foreground" /></AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex-1">
                                                        <Input
                                                            type="file"
                                                            accept="image/*"
                                                            onChange={(e) => {
                                                                const file = e.target.files?.[0];
                                                                if (file) handleImageUpload(file, 'add');
                                                            }}
                                                            disabled={uploadingImage}
                                                        />
                                                        {uploadingImage && <p className="text-xs text-muted-foreground mt-1">Uploading...</p>}
                                                    </div>
                                                </div>
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                                <FormField control={addForm.control} name="name" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Name *</FormLabel>
                                        <FormControl><Input placeholder="Full name" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={addForm.control} name="email" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email *</FormLabel>
                                        <FormControl><Input type="email" placeholder="email@example.com" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={addForm.control} name="phone" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Phone</FormLabel>
                                        <FormControl><Input placeholder="+1234567890" {...field} /></FormControl>
                                    </FormItem>
                                )} />
                                <FormField control={addForm.control} name="university" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>University</FormLabel>
                                        <FormControl><Input placeholder="University name" {...field} /></FormControl>
                                    </FormItem>
                                )} />
                                <FormField control={addForm.control} name="degree" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Degree</FormLabel>
                                        <FormControl><Input placeholder="e.g., B.Tech CS" {...field} /></FormControl>
                                    </FormItem>
                                )} />
                                <FormField control={addForm.control} name="startDate" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Start Date *</FormLabel>
                                        <FormControl><Input type="date" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={addForm.control} name="endDate" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>End Date</FormLabel>
                                        <FormControl><Input type="date" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={addForm.control} name="mentorId" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Assign Mentor</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select mentor" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {employees.map((emp) => (
                                                    <SelectItem key={emp.id} value={emp.id}>{emp.name} ({emp.role})</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </FormItem>
                                )} />
                                <FormField control={addForm.control} name="project" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Assign Project</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select project" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="Unassigned">Unassigned</SelectItem>
                                                {projects.map((proj) => (
                                                    <SelectItem key={proj.id} value={proj.name}>{proj.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </FormItem>
                                )} />
                            </div>
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setAddDialogOpen(false)}>Cancel</Button>
                                <Button type="submit">Add Intern</Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            {/* Edit Intern Dialog */}
            <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Edit Intern</DialogTitle>
                        <DialogDescription>Update intern information.</DialogDescription>
                    </DialogHeader>
                    <Form {...editForm}>
                        <form onSubmit={editForm.handleSubmit(handleUpdateIntern)} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <FormField control={editForm.control} name="name" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Name *</FormLabel>
                                        <FormControl><Input {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={editForm.control} name="email" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email *</FormLabel>
                                        <FormControl><Input type="email" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={editForm.control} name="phone" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Phone</FormLabel>
                                        <FormControl><Input {...field} /></FormControl>
                                    </FormItem>
                                )} />
                                <FormField control={editForm.control} name="university" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>University</FormLabel>
                                        <FormControl><Input {...field} /></FormControl>
                                    </FormItem>
                                )} />
                                <FormField control={editForm.control} name="degree" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Degree</FormLabel>
                                        <FormControl><Input {...field} /></FormControl>
                                    </FormItem>
                                )} />
                                <FormField control={editForm.control} name="startDate" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Start Date *</FormLabel>
                                        <FormControl><Input type="date" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={editForm.control} name="endDate" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>End Date</FormLabel>
                                        <FormControl><Input type="date" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={editForm.control} name="mentorId" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Mentor</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select mentor" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {employees.map((emp) => (
                                                    <SelectItem key={emp.id} value={emp.id}>{emp.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </FormItem>
                                )} />
                                <FormField control={editForm.control} name="project" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Project</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select project" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="Unassigned">Unassigned</SelectItem>
                                                {projects.map((proj) => (
                                                    <SelectItem key={proj.id} value={proj.name}>{proj.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </FormItem>
                                )} />
                            </div>
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)}>Cancel</Button>
                                <Button type="submit">Update</Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            {/* Terminate Dialog */}
            <Dialog open={terminateDialogOpen} onOpenChange={setTerminateDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Terminate Internship</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to terminate {selectedIntern?.name}'s internship?
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium">Reason (Optional)</label>
                            <Textarea
                                value={terminationReason}
                                onChange={(e) => setTerminationReason(e.target.value)}
                                placeholder="Enter termination reason..."
                                rows={3}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setTerminateDialogOpen(false)}>Cancel</Button>
                        <Button variant="destructive" onClick={handleTerminateInternship}>Terminate</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Details Dialog */}
            <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Intern Details</DialogTitle>
                    </DialogHeader>
                    {selectedIntern && (
                        <div className="space-y-4">
                            <div className="flex items-center gap-4">
                                <Avatar className="h-20 w-20">
                                    <AvatarImage src={selectedIntern.avatarUrl || undefined} />
                                    <AvatarFallback>{selectedIntern.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <h3 className="text-lg font-semibold">{selectedIntern.name}</h3>
                                    <p className="text-sm text-muted-foreground">{selectedIntern.email}</p>
                                    <Badge variant="outline" className={cn('mt-1', statusColors[selectedIntern.status])}>
                                        {selectedIntern.status}
                                    </Badge>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm font-medium">University</p>
                                    <p className="text-sm text-muted-foreground">{selectedIntern.university || 'Not specified'}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium">Degree</p>
                                    <p className="text-sm text-muted-foreground">{selectedIntern.degree || 'Not specified'}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium">Start Date</p>
                                    <p className="text-sm text-muted-foreground">{new Date(selectedIntern.startDate).toLocaleDateString()}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium">End Date</p>
                                    <p className="text-sm text-muted-foreground">{new Date(selectedIntern.endDate).toLocaleDateString()}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium">Stipend</p>
                                    <p className="text-sm text-muted-foreground">
                                        {selectedIntern.stipendAmount ? `$${selectedIntern.stipendAmount}/month` : 'Not specified'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium">Project</p>
                                    <p className="text-sm text-muted-foreground">{selectedIntern.project}</p>
                                </div>
                                <div className="col-span-2">
                                    <p className="text-sm font-medium">Mentor</p>
                                    <p className="text-sm text-muted-foreground">
                                        {selectedIntern.mentor ? `${selectedIntern.mentor.name} (${selectedIntern.mentor.email})` : 'No mentor assigned'}
                                    </p>
                                </div>
                                {selectedIntern.status === 'Terminated' && (
                                    <>
                                        <div>
                                            <p className="text-sm font-medium">Termination Date</p>
                                            <p className="text-sm text-muted-foreground">
                                                {selectedIntern.terminationDate ? new Date(selectedIntern.terminationDate).toLocaleDateString() : 'N/A'}
                                            </p>
                                        </div>
                                        <div className="col-span-2">
                                            <p className="text-sm font-medium">Termination Reason</p>
                                            <p className="text-sm text-muted-foreground">{selectedIntern.terminationReason || 'Not specified'}</p>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}
