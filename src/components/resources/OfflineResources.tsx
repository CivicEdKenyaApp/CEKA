
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Wifi, WifiOff, Download, Trash2, CheckCircle } from 'lucide-react';

interface DownloadStatus {
  id: string;
  title: string;
  type: string;
  size: string;
  progress: number;
  status: 'downloading' | 'completed' | 'failed';
}

const OfflineResources: React.FC = () => {
  const [downloads, setDownloads] = useState<DownloadStatus[]>([
    { 
      id: '1', 
      title: 'Constitution of Kenya, 2010', 
      type: 'PDF', 
      size: '2.3 MB', 
      progress: 100, 
      status: 'completed' 
    },
    { 
      id: '2', 
      title: 'County Government Structure', 
      type: 'Infographic', 
      size: '1.1 MB', 
      progress: 70, 
      status: 'downloading' 
    }
  ]);
  
  const [networkStatus, setNetworkStatus] = useState<'online' | 'offline'>('online');
  
  const toggleNetworkStatus = () => {
    setNetworkStatus(networkStatus === 'online' ? 'offline' : 'online');
  };
  
  const removeDownload = (id: string) => {
    setDownloads(downloads.filter(download => download.id !== id));
  };
  
  const getTotalStorageUsage = () => {
    return '3.4 MB';
  };
  
  const getAvailableStorage = () => {
    return '500 MB';
  };
  
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Offline Resources</CardTitle>
            <CardDescription>Manage your downloaded resources for offline access</CardDescription>
          </div>
          <Button 
            variant={networkStatus === 'online' ? "outline" : "secondary"} 
            size="sm"
            onClick={toggleNetworkStatus}
          >
            {networkStatus === 'online' ? (
              <>
                <Wifi className="h-4 w-4 mr-2 text-green-500" />
                Online
              </>
            ) : (
              <>
                <WifiOff className="h-4 w-4 mr-2 text-muted-foreground" />
                Offline
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Storage usage: {getTotalStorageUsage()}</span>
          <span className="font-medium">{getAvailableStorage()} available</span>
        </div>
        <Progress value={30} className="h-2" />
        
        <div className="space-y-3 mt-4">
          {downloads.length === 0 ? (
            <div className="text-center py-8">
              <WifiOff className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
              <p className="text-muted-foreground">No resources downloaded for offline access</p>
              <Button className="mt-4" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Download Resources
              </Button>
            </div>
          ) : (
            downloads.map(download => (
              <div key={download.id} className="flex items-center justify-between p-3 border rounded-md">
                <div className="flex-1 mr-4">
                  <div className="flex items-center">
                    {download.status === 'completed' ? (
                      <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                    ) : (
                      <Download className="h-4 w-4 mr-2 text-blue-500" />
                    )}
                    <span className="font-medium">{download.title}</span>
                  </div>
                  <div className="flex items-center text-xs text-muted-foreground mt-1">
                    <span>{download.type}</span>
                    <span className="mx-2">•</span>
                    <span>{download.size}</span>
                  </div>
                  {download.status === 'downloading' && (
                    <Progress value={download.progress} className="h-1 mt-2" />
                  )}
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8" 
                  onClick={() => removeDownload(download.id)}
                >
                  <Trash2 className="h-4 w-4 text-muted-foreground" />
                </Button>
              </div>
            ))
          )}
        </div>
      </CardContent>
      <CardFooter>
        <div className="w-full text-center">
          <p className="text-xs text-muted-foreground">
            Content available offline will automatically sync when you reconnect
          </p>
        </div>
      </CardFooter>
    </Card>
  );
};

export default OfflineResources;
