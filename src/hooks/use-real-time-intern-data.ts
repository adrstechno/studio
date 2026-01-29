import { useState, useEffect, useCallback } from 'react';

type Task = {
    id: string;
    title: string;
    status: string;
    projectId: string;
    project?: { id: string; name: string };
};

type Evaluation = {
    id: string;
    rating: number;
    feedback: string;
    createdAt: string;
    mentorName: string;
};

type Project = {
    id: string;
    name: string;
    status: string;
    progress: number;
};

type InternData = {
    tasks: Task[];
    evaluations: Evaluation[];
    projects: Project[];
    intern: any;
};

export const useRealTimeInternData = (userEmail: string | null) => {
    const [data, setData] = useState<InternData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

    const fetchData = useCallback(async () => {
        if (!userEmail) return;

        try {
            setError(null);
            
            // Get intern by email
            const internRes = await fetch(`/api/interns?email=${encodeURIComponent(userEmail)}`);
            if (!internRes.ok) {
                throw new Error('Failed to fetch intern data');
            }

            const interns = await internRes.json();
            const currentIntern = Array.isArray(interns) ? interns.find((i: any) => i.email === userEmail) : null;

            if (!currentIntern?.id) {
                throw new Error('Intern profile not found');
            }

            // Fetch all data in parallel
            const [tasksRes, evalRes, projectsRes] = await Promise.all([
                fetch(`/api/tasks?assigneeId=${currentIntern.id}&assigneeType=Intern`),
                fetch(`/api/interns/${currentIntern.id}/evaluations`),
                fetch('/api/projects')
            ]);

            // Process tasks
            let tasks: Task[] = [];
            if (tasksRes.ok) {
                const tasksData = await tasksRes.json();
                tasks = Array.isArray(tasksData) ? tasksData : [];
            }

            // Process evaluations
            let evaluations: Evaluation[] = [];
            if (evalRes.ok) {
                const evalData = await evalRes.json();
                evaluations = Array.isArray(evalData) ? evalData : [];
            }

            // Process projects
            let projects: Project[] = [];
            if (projectsRes.ok) {
                const allProjects = await projectsRes.json();
                if (Array.isArray(allProjects)) {
                    let internProjects: string[] = [];
                    if (currentIntern.projects) {
                        try {
                            internProjects = JSON.parse(currentIntern.projects);
                        } catch {
                            internProjects = [currentIntern.project];
                        }
                    } else if (currentIntern.project && currentIntern.project !== 'Unassigned') {
                        internProjects = [currentIntern.project];
                    }
                    
                    projects = allProjects.filter((p: Project) =>
                        internProjects.includes(p.name)
                    );
                }
            }

            setData({
                tasks,
                evaluations,
                projects,
                intern: currentIntern
            });
            setLastUpdated(new Date());
        } catch (error: any) {
            console.error('Error fetching intern data:', error);
            setError(error.message || 'Failed to fetch data');
        } finally {
            setLoading(false);
        }
    }, [userEmail]);

    // Initial fetch
    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Set up polling for real-time updates
    useEffect(() => {
        if (!userEmail) return;

        const interval = setInterval(() => {
            fetchData();
        }, 30000); // Update every 30 seconds

        return () => clearInterval(interval);
    }, [fetchData, userEmail]);

    // Manual refresh function
    const refresh = useCallback(() => {
        setLoading(true);
        fetchData();
    }, [fetchData]);

    return {
        data,
        loading,
        error,
        lastUpdated,
        refresh
    };
};