import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { employees, tasks, type Task } from '@/lib/data';
import { PlusCircle } from 'lucide-react';
import { PageHeader } from '@/components/page-header';

type TaskColumnProps = {
  title: Task['status'];
  tasks: Task[];
};

function TaskCard({ task }: { task: Task }) {
  const assignee = employees.find((e) => e.id === task.assigneeId);
  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-4">
        <div className="flex flex-col gap-2">
          <p className="font-medium leading-snug">{task.title}</p>
          <div className="flex items-center justify-between text-sm text-muted-foreground">
             <Badge variant="outline">{task.projectId}</Badge>
            {assignee && (
              <Avatar className="h-6 w-6">
                <AvatarImage src={assignee.avatarUrl} alt={assignee.name} />
                <AvatarFallback>{assignee.name.charAt(0)}</AvatarFallback>
              </Avatar>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function TaskColumn({ title, tasks }: TaskColumnProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="font-headline font-semibold text-lg">{title}</h2>
        <span className="text-muted-foreground text-sm">{tasks.length}</span>
      </div>
      <div className="flex flex-col gap-3">
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
      </div>
    </div>
  );
}

export default function TasksPage() {
  const todoTasks = tasks.filter((t) => t.status === 'To Do');
  const inProgressTasks = tasks.filter((t) => t.status === 'In Progress');
  const doneTasks = tasks.filter((t) => t.status === 'Done');

  return (
    <>
      <PageHeader
        title="Task Board"
        description="Organize and track your team's work."
      >
        <Button>
          <PlusCircle />
          New Task
        </Button>
      </PageHeader>
      <div className="grid md:grid-cols-3 gap-6 items-start">
        <TaskColumn title="To Do" tasks={todoTasks} />
        <TaskColumn title="In Progress" tasks={inProgressTasks} />
        <TaskColumn title="Done" tasks={doneTasks} />
      </div>
    </>
  );
}
