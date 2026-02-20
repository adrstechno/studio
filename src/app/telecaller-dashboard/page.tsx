'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/page-header';
import { useAuth } from '@/hooks/use-auth';
import { LoaderCircle, Phone, Clock, CheckCircle2, Calendar } from 'lucide-react';
import { PunchInOutCard } from '@/components/punch-in-out-card';

export default function TelecallerDashboardPage() {
  const { user } = useAuth();
  const [loading, setLoading] = React.useState(true);
  const [employeeId, setEmployeeId] = React.useState<string | null>(null);
  const [stats, setStats] = React.useState({
    todayCalls: 0,
    weekCalls: 0,
    monthCalls: 0,
    attendancePercentage: 0,
  });

  React.useEffect(() => {
    fetchData();
  }, [user?.email]);

  const fetchData = async () => {
    if (!user?.email) return;

    try {
      const employeeRes = await fetch(`/api/employees?email=${encodeURIComponent(user.email)}`);
      if (employeeRes.ok) {
        const employees = await employeeRes.json();
        const employee = Array.isArray(employees) 
          ? employees.find((e: any) => e.email === user.email) 
          : null;
        
        if (employee) {
          setEmployeeId(employee.id);
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
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
        title="Telecaller Dashboard"
        description={`Welcome back, ${user?.name || 'Telecaller'}!`}
      />

      {employeeId && (
        <div className="mb-6">
          <PunchInOutCard employeeId={employeeId} onUpdate={fetchData} />
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Calls</CardTitle>
            <Phone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.todayCalls}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.weekCalls}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.monthCalls}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Attendance</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.attendancePercentage}%</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Phone className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Call management features coming soon</p>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
