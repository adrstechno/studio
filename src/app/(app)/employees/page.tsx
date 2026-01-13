import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { employees, type Employee } from '@/lib/data';
import { MoreHorizontal, PlusCircle } from 'lucide-react';
import { PageHeader } from '@/components/page-header';

const roleColors: Record<Employee['role'], string> = {
  Developer: 'bg-blue-100 text-blue-800 border-blue-200',
  Designer: 'bg-purple-100 text-purple-800 border-purple-200',
  Manager: 'bg-red-100 text-red-800 border-red-200',
  QA: 'bg-green-100 text-green-800 border-green-200',
};

export default function EmployeesPage() {
  return (
    <>
      <PageHeader
        title="Employee Management"
        description="View, add, and manage your team members."
      >
        <Button>
          <PlusCircle />
          Add Employee
        </Button>
      </PageHeader>
      <Card>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Project</TableHead>
                <TableHead>Enrollment Date</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarImage
                          src={employee.avatarUrl}
                          alt={employee.name}
                        />
                        <AvatarFallback>
                          {employee.name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="grid">
                        <span>{employee.name}</span>
                        <span className="text-sm text-muted-foreground">{employee.email}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={`${roleColors[employee.role]}`}
                    >
                      {employee.role}
                    </Badge>
                  </TableCell>
                  <TableCell>{employee.project}</TableCell>
                  <TableCell>
                    {new Date(employee.enrollmentDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button aria-haspopup="true" size="icon" variant="ghost">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Toggle menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Edit</DropdownMenuItem>
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
