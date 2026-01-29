'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Users, Send, Clock, X } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';

interface Recipient {
  id: string;
  name: string;
  email: string;
  role: string;
  employeeRole?: string;
  project?: string;
}

interface BulkMessageComposerProps {
  onMessageSent: (message: any) => void;
  onCancel: () => void;
}

export function BulkMessageComposer({ onMessageSent, onCancel }: BulkMessageComposerProps) {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState('general');
  const [priority, setPriority] = useState('medium');
  const [recipientType, setRecipientType] = useState('all');
  const [recipientFilter, setRecipientFilter] = useState<any>({});
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [availableRoles, setAvailableRoles] = useState<any[]>([]);
  const [availableProjects, setAvailableProjects] = useState<any[]>([]);
  const [scheduledDate, setScheduledDate] = useState<Date>();
  const [loading, setLoading] = useState(false);
  const [previewRecipients, setPreviewRecipients] = useState(false);
  
  const { toast } = useToast();
  const { user } = useAuth();

  // Debug: Log user info
  console.log('Current user in BulkMessageComposer:', user);

  useEffect(() => {
    fetchRecipients();
    fetchRoles();
    fetchProjects();
  }, [recipientType, recipientFilter]);

  const fetchRecipients = async () => {
    try {
      let url = `/api/messages/recipients?type=${recipientType}`;
      if (recipientType === 'role' && recipientFilter.role) {
        url += `&filter=${recipientFilter.role}`;
      } else if (recipientType === 'project' && recipientFilter.project) {
        url += `&filter=${recipientFilter.project}`;
      }

      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setRecipients(data.recipients || []);
      }
    } catch (error) {
      console.error('Error fetching recipients:', error);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await fetch('/api/messages/recipients?type=roles');
      if (response.ok) {
        const data = await response.json();
        setAvailableRoles(data.roles || []);
      }
    } catch (error) {
      console.error('Error fetching roles:', error);
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/messages/recipients?type=projects');
      if (response.ok) {
        const data = await response.json();
        setAvailableProjects(data.projects || []);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const handleSend = async () => {
    if (!title.trim() || !message.trim()) {
      toast({
        title: 'Error',
        description: 'Please fill in both title and message',
        variant: 'destructive'
      });
      return;
    }

    if (recipients.length === 0) {
      toast({
        title: 'Error',
        description: 'No recipients selected',
        variant: 'destructive'
      });
      return;
    }

    if (!user?.id) {
      toast({
        title: 'Error',
        description: 'User not authenticated. Please refresh and try again.',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      const payload = {
        title: title.trim(),
        message: message.trim(),
        type,
        priority,
        recipientType,
        recipientFilter: Object.keys(recipientFilter).length > 0 ? recipientFilter : null,
        scheduledAt: scheduledDate?.toISOString(),
        sentBy: user.id
      };

      console.log('Sending bulk message payload:', payload); // Debug log

      const response = await fetch('/api/messages/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const result = await response.json();
        onMessageSent({
          id: result.id,
          title,
          message,
          type,
          priority,
          recipientType,
          totalRecipients: result.totalRecipients,
          deliveredCount: scheduledDate ? 0 : result.totalRecipients,
          readCount: 0,
          status: result.status,
          sentAt: scheduledDate ? null : new Date().toISOString(),
          createdAt: new Date().toISOString()
        });
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to send message');
      }
    } catch (error: any) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to send message',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const getRecipientTypeLabel = () => {
    switch (recipientType) {
      case 'all': return 'All Users';
      case 'employees': return 'All Employees';
      case 'interns': return 'All Interns';
      case 'role': return `${recipientFilter.role || 'Select Role'}`;
      case 'project': return `Project: ${recipientFilter.project || 'Select Project'}`;
      default: return 'Select Recipients';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Compose Bulk Message</CardTitle>
            <CardDescription>Send a message to multiple recipients at once</CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Message Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              placeholder="Enter message title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="type">Message Type</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">General</SelectItem>
                <SelectItem value="announcement">Announcement</SelectItem>
                <SelectItem value="update">Update</SelectItem>
                <SelectItem value="reminder">Reminder</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Debug: Show current user info */}
        {user && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm">
            <strong>Current User:</strong> {user.name} ({user.email}) - ID: {user.id}
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="message">Message *</Label>
          <Textarea
            id="message"
            placeholder="Enter your message here..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="priority">Priority</Label>
            <Select value={priority} onValueChange={setPriority}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Schedule (Optional)</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {scheduledDate ? format(scheduledDate, "PPP") : "Send now"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={scheduledDate}
                  onSelect={setScheduledDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Recipients Selection */}
        <div className="space-y-4">
          <Label>Recipients</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select value={recipientType} onValueChange={setRecipientType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                <SelectItem value="employees">All Employees</SelectItem>
                <SelectItem value="interns">All Interns</SelectItem>
                <SelectItem value="role">By Role</SelectItem>
                <SelectItem value="project">By Project</SelectItem>
              </SelectContent>
            </Select>

            {recipientType === 'role' && (
              <Select 
                value={recipientFilter.role || ''} 
                onValueChange={(value) => setRecipientFilter({ role: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {availableRoles.map((role) => (
                    <SelectItem key={role.role} value={role.role}>
                      {role.role} ({role.count})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {recipientType === 'project' && (
              <Select 
                value={recipientFilter.project || ''} 
                onValueChange={(value) => setRecipientFilter({ project: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  {availableProjects.map((project) => (
                    <SelectItem key={project.name} value={project.name}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Recipients Preview */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-gray-600" />
              <span className="text-sm font-medium">
                {recipients.length} recipients selected
              </span>
              <Badge variant="outline">{getRecipientTypeLabel()}</Badge>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPreviewRecipients(!previewRecipients)}
            >
              {previewRecipients ? 'Hide' : 'Preview'}
            </Button>
          </div>

          {previewRecipients && recipients.length > 0 && (
            <div className="max-h-40 overflow-y-auto border rounded-lg p-3 space-y-1">
              {recipients.map((recipient) => (
                <div key={recipient.id} className="flex items-center justify-between text-sm">
                  <span>{recipient.name}</span>
                  <span className="text-gray-500">{recipient.email}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={handleSend} disabled={loading} className="flex items-center gap-2">
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : scheduledDate ? (
              <Clock className="h-4 w-4" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            {loading ? 'Sending...' : scheduledDate ? 'Schedule' : 'Send Now'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}