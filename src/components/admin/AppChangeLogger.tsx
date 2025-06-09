
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useAppChanges } from '@/hooks/useAppChanges';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus, Send } from 'lucide-react';

const AppChangeLogger = () => {
  const { changes, loading, processNotifications, logFeatureUpdate, logBugFix, logSecurityUpdate, logNewFeature } = useAppChanges();
  const { toast } = useToast();
  const [isLogging, setIsLogging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [formData, setFormData] = useState({
    type: '',
    title: '',
    description: '',
    userImpact: ''
  });

  const handleLogChange = async () => {
    if (!formData.type || !formData.title || !formData.description) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setIsLogging(true);
    try {
      switch (formData.type) {
        case 'feature_update':
          await logFeatureUpdate(formData.title, formData.description);
          break;
        case 'bug_fix':
          await logBugFix(formData.description, formData.userImpact || 'causing issues');
          break;
        case 'security_update':
          await logSecurityUpdate(formData.description);
          break;
        case 'new_feature':
          await logNewFeature(formData.title, formData.description);
          break;
        default:
          throw new Error('Invalid change type');
      }

      toast({
        title: "Success",
        description: "App change logged successfully"
      });

      // Reset form
      setFormData({
        type: '',
        title: '',
        description: '',
        userImpact: ''
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to log app change",
        variant: "destructive"
      });
    } finally {
      setIsLogging(false);
    }
  };

  const handleProcessNotifications = async () => {
    setIsProcessing(true);
    try {
      await processNotifications();
      toast({
        title: "Success",
        description: "Notifications processed and sent to users"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process notifications",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-orange-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Log App Change
          </CardTitle>
          <CardDescription>
            Record changes to the application that should be communicated to users
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Change Type</label>
            <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select change type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="new_feature">New Feature</SelectItem>
                <SelectItem value="feature_update">Feature Update</SelectItem>
                <SelectItem value="bug_fix">Bug Fix</SelectItem>
                <SelectItem value="security_update">Security Update</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium">Title/Feature Name</label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="e.g., Notification System, Login Page, etc."
            />
          </div>

          <div>
            <label className="text-sm font-medium">Technical Description</label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Detailed description of the change"
              rows={3}
            />
          </div>

          {formData.type === 'bug_fix' && (
            <div>
              <label className="text-sm font-medium">User Impact</label>
              <Input
                value={formData.userImpact}
                onChange={(e) => setFormData(prev => ({ ...prev, userImpact: e.target.value }))}
                placeholder="e.g., preventing login, causing page errors"
              />
            </div>
          )}

          <Button onClick={handleLogChange} disabled={isLogging} className="w-full">
            {isLogging ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Logging Change...
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Log App Change
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Pending Changes ({changes.length})</span>
            <Button 
              onClick={handleProcessNotifications} 
              disabled={isProcessing || changes.length === 0}
              variant="outline"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Send Notifications
                </>
              )}
            </Button>
          </CardTitle>
          <CardDescription>
            Changes that will be included in the next notification batch
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : changes.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No pending changes to process
            </p>
          ) : (
            <div className="space-y-3">
              {changes.map((change) => (
                <div key={change.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge className={getSeverityColor(change.severity)}>
                        {change.severity}
                      </Badge>
                      <Badge variant="outline">
                        {change.change_type.replace('_', ' ')}
                      </Badge>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(change.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <h4 className="font-medium mb-1">{change.description}</h4>
                  <p className="text-sm text-muted-foreground">
                    User Message: "{change.user_friendly_message}"
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AppChangeLogger;
