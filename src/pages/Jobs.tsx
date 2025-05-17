
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell, Trash2, Edit, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface JobAlert {
  id: number;
  keywords: string;
  sources: string[];
  frequency: string;
  createdAt: Date;
}

const Jobs = () => {
  const [keywords, setKeywords] = useState('');
  const [sources, setSources] = useState<string[]>(['LinkedIn']);
  const [frequency, setFrequency] = useState('daily');
  const [alerts, setAlerts] = useState<JobAlert[]>([
    {
      id: 1,
      keywords: 'Frontend Developer React',
      sources: ['LinkedIn', 'AngelList'],
      frequency: 'daily',
      createdAt: new Date('2023-05-10')
    },
    {
      id: 2,
      keywords: 'UX Designer',
      sources: ['LinkedIn'],
      frequency: 'weekly',
      createdAt: new Date('2023-05-08')
    }
  ]);
  
  const { toast } = useToast();
  const navigate = useNavigate();

  const toggleSource = (source: string) => {
    if (sources.includes(source)) {
      setSources(sources.filter(s => s !== source));
    } else {
      setSources([...sources, source]);
    }
  };

  const createAlert = () => {
    if (!keywords.trim()) {
      toast({
        title: "Error",
        description: "Please enter keywords for your job alert",
        variant: "destructive"
      });
      return;
    }

    const newAlert: JobAlert = {
      id: Date.now(),
      keywords,
      sources,
      frequency,
      createdAt: new Date()
    };

    setAlerts([...alerts, newAlert]);
    setKeywords('');
    setSources(['LinkedIn']);
    setFrequency('daily');

    toast({
      title: "Alert Created",
      description: "Your job alert has been set up successfully",
    });
  };

  const deleteAlert = (id: number) => {
    setAlerts(alerts.filter(alert => alert.id !== id));
    toast({
      title: "Alert Deleted",
      description: "Your job alert has been deleted",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <header className="max-w-3xl mx-auto mb-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/')}
          className="mb-4"
        >
          ← Back to Home
        </Button>
        <h1 className="text-3xl font-bold text-gray-800">Job Alerts</h1>
        <p className="text-gray-600">Get notified when relevant job opportunities are posted</p>
      </header>

      <div className="max-w-3xl mx-auto">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Create New Job Alert</CardTitle>
            <CardDescription>
              Set up notifications for job openings that match your skills and interests
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="keywords">Keywords (skills, job titles, companies)</Label>
              <Input
                id="keywords"
                placeholder="e.g., React Developer, Frontend Engineer, Google"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
              />
              <p className="text-xs text-gray-500">Use specific skills and job titles for better matches</p>
            </div>

            <div className="space-y-2">
              <Label>Job Sources</Label>
              <div className="flex flex-wrap gap-2">
                {['LinkedIn', 'AngelList', 'Indeed', 'Glassdoor'].map((source) => (
                  <Button
                    key={source}
                    type="button"
                    variant={sources.includes(source) ? "default" : "outline"}
                    className={sources.includes(source) ? "bg-interview-blue" : ""}
                    onClick={() => toggleSource(source)}
                    size="sm"
                  >
                    {source}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="frequency">Alert Frequency</Label>
              <select
                id="frequency"
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="instant">Instant</option>
              </select>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={createAlert} className="w-full bg-interview-blue">
              <Plus className="mr-2 h-4 w-4" />
              Create Alert
            </Button>
          </CardFooter>
        </Card>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800">Your Job Alerts</h2>
          
          {alerts.length === 0 ? (
            <Card className="p-6 text-center text-gray-500">
              <Bell className="mx-auto h-8 w-8 text-gray-400 mb-2" />
              <p>You don't have any job alerts yet</p>
            </Card>
          ) : (
            alerts.map((alert) => (
              <Card key={alert.id}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{alert.keywords}</CardTitle>
                      <CardDescription>
                        Created {alert.createdAt.toLocaleDateString()}
                      </CardDescription>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                        onClick={() => deleteAlert(alert.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {alert.sources.map((source) => (
                      <span 
                        key={source} 
                        className="bg-gray-100 text-gray-700 text-xs py-1 px-2 rounded-full"
                      >
                        {source}
                      </span>
                    ))}
                  </div>
                  <div className="text-xs text-gray-500">
                    Frequency: <span className="font-medium capitalize">{alert.frequency}</span>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Jobs;
