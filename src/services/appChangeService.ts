
import { supabase } from '@/integrations/supabase/client';
import { notificationService } from './notificationService';

export interface AppChange {
  id: string;
  change_type: string;
  description: string;
  technical_details: string;
  user_friendly_message: string;
  severity: string; // Changed from 'low' | 'medium' | 'high' to string to match database
  affects_users: boolean;
  created_at: string;
  processed: boolean;
}

class AppChangeService {
  // Log a technical change to the system
  async logAppChange(
    changeType: string,
    description: string,
    technicalDetails: string,
    userFriendlyMessage: string,
    severity: 'low' | 'medium' | 'high' = 'low',
    affectsUsers: boolean = false
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('app_changes')
        .insert({
          change_type: changeType,
          description,
          technical_details: technicalDetails,
          user_friendly_message: userFriendlyMessage,
          severity,
          affects_users: affectsUsers,
          processed: false
        });

      if (error) throw error;
      console.log('App change logged successfully');
    } catch (error) {
      console.error('Error logging app change:', error);
    }
  }

  // Get unprocessed changes that affect users
  async getUnprocessedUserChanges(): Promise<AppChange[]> {
    try {
      const { data, error } = await supabase
        .from('app_changes')
        .select('*')
        .eq('affects_users', true)
        .eq('processed', false)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching unprocessed changes:', error);
      return [];
    }
  }

  // Process daily/weekly notifications
  async processChangeNotifications(): Promise<void> {
    try {
      const changes = await this.getUnprocessedUserChanges();
      
      if (changes.length === 0) {
        console.log('No changes to process');
        return;
      }

      // Group changes by severity and type
      const groupedChanges = this.groupChanges(changes);
      
      // Get all users who should receive notifications
      const { data: users } = await supabase
        .from('profiles')
        .select('id');

      if (!users) return;

      // Create notifications for each user
      for (const user of users) {
        await this.createUserNotifications(user.id, groupedChanges);
      }

      // Mark changes as processed
      const changeIds = changes.map(c => c.id);
      await supabase
        .from('app_changes')
        .update({ processed: true })
        .in('id', changeIds);

      console.log(`Processed ${changes.length} app changes for ${users.length} users`);
    } catch (error) {
      console.error('Error processing change notifications:', error);
    }
  }

  private groupChanges(changes: AppChange[]) {
    const grouped = {
      high: changes.filter(c => c.severity === 'high'),
      medium: changes.filter(c => c.severity === 'medium'),
      low: changes.filter(c => c.severity === 'low')
    };

    return grouped;
  }

  private async createUserNotifications(userId: string, groupedChanges: any): Promise<void> {
    // Create high priority notifications immediately
    for (const change of groupedChanges.high) {
      await notificationService.createNotification(
        userId,
        `Important Update: ${change.user_friendly_message}`,
        'app_update',
        undefined,
        change.id
      );
    }

    // Create summary notifications for medium and low priority changes
    if (groupedChanges.medium.length > 0) {
      const message = this.createSummaryMessage(groupedChanges.medium, 'medium');
      await notificationService.createNotification(
        userId,
        message,
        'app_update'
      );
    }

    if (groupedChanges.low.length > 0) {
      const message = this.createSummaryMessage(groupedChanges.low, 'low');
      await notificationService.createNotification(
        userId,
        message,
        'app_update'
      );
    }
  }

  private createSummaryMessage(changes: AppChange[], severity: string): string {
    if (changes.length === 1) {
      return changes[0].user_friendly_message;
    }

    const priorityText = severity === 'medium' ? 'improvements' : 'updates';
    return `We've made ${changes.length} ${priorityText} to improve your experience. Check the app for the latest features!`;
  }

  // Convenience method to log common types of changes
  async logFeatureUpdate(featureName: string, description: string): Promise<void> {
    await this.logAppChange(
      'feature_update',
      `Updated ${featureName}`,
      description,
      `We've improved ${featureName} to make it work better for you!`,
      'medium',
      true
    );
  }

  async logBugFix(bugDescription: string, userImpact: string): Promise<void> {
    await this.logAppChange(
      'bug_fix',
      `Fixed: ${bugDescription}`,
      bugDescription,
      `We fixed an issue that was ${userImpact}. Everything should work smoother now!`,
      'low',
      true
    );
  }

  async logSecurityUpdate(description: string): Promise<void> {
    await this.logAppChange(
      'security_update',
      `Security improvement: ${description}`,
      description,
      'We\'ve made your account more secure with our latest safety updates.',
      'high',
      true
    );
  }

  async logNewFeature(featureName: string, description: string): Promise<void> {
    await this.logAppChange(
      'new_feature',
      `New feature: ${featureName}`,
      description,
      `Exciting news! We've added ${featureName} - check it out in the app!`,
      'medium',
      true
    );
  }
}

export const appChangeService = new AppChangeService();
