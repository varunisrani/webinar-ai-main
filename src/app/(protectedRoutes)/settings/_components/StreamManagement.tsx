"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Radio, 
  Square, 
  Loader2, 
  AlertTriangle,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';
import { forceEndAllStreams } from '@/action/stremIo';
import { changeWebinarStatus } from '@/action/webinar';
import { useRouter } from 'next/navigation';
import type { Webinar } from '@prisma/client';

type Props = {
  activeWebinars: Webinar[];
  presenterId: string;
};

const StreamManagement = ({ activeWebinars, presenterId }: Props) => {
  const [loading, setLoading] = useState(false);
  const [endingStream, setEndingStream] = useState<string | null>(null);
  const router = useRouter();

  const handleForceEndAllStreams = async () => {
    setLoading(true);
    try {
      const result = await forceEndAllStreams(presenterId);
      
      if (result.success) {
        toast.success(result.message);
        router.refresh();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Error ending all streams:', error);
      toast.error('Failed to end streams. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEndSingleStream = async (webinarId: string) => {
    setEndingStream(webinarId);
    try {
      await changeWebinarStatus(webinarId, "ENDED");
      toast.success('Stream ended successfully');
      router.refresh();
    } catch (error) {
      console.error('Error ending stream:', error);
      toast.error('Failed to end stream. Please try again.');
    } finally {
      setEndingStream(null);
    }
  };

  return (
    <div className="w-full p-6 border border-input rounded-lg bg-background shadow-sm mb-6">
      <div className="flex items-center mb-4">
        <div className="h-10 w-10 rounded-full bg-gradient-to-r from-red-500 to-orange-600 flex items-center justify-center mr-4">
          <Radio className="h-5 w-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-primary">
            Stream Management
          </h2>
          <p className="text-muted-foreground text-sm">
            Manage your active live streams and resolve conflicts
          </p>
        </div>
      </div>

      {activeWebinars.length > 0 ? (
        <>
          <Alert className="mb-4 border-red-200 bg-red-50 dark:bg-red-950/20">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800 dark:text-red-200">
              <strong>Active Streams Detected:</strong> You have {activeWebinars.length} active stream(s). 
              This may prevent you from starting new webinars.
            </AlertDescription>
          </Alert>

          <div className="space-y-3 mb-6">
            {activeWebinars.map((webinar) => (
              <div key={webinar.id} className="flex items-center justify-between p-4 border border-border rounded-lg bg-muted/50">
                <div className="flex items-center gap-3">
                  <div className="h-3 w-3 bg-red-500 rounded-full animate-pulse"></div>
                  <div>
                    <h3 className="font-medium">{webinar.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      Started: {new Date(webinar.startTime).toLocaleString()}
                    </p>
                    <Badge variant="destructive" className="mt-1">
                      LIVE
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                  >
                    <a href={`/live-webinar/${webinar.id}`} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-1" />
                      View
                    </a>
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleEndSingleStream(webinar.id)}
                    disabled={endingStream === webinar.id}
                  >
                    {endingStream === webinar.id ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                        Ending...
                      </>
                    ) : (
                      <>
                        <Square className="h-4 w-4 mr-1" />
                        End Stream
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-border">
            <div className="text-sm text-muted-foreground">
              Ending all streams will allow you to start new webinars without conflicts
            </div>
            <Button
              variant="destructive"
              onClick={handleForceEndAllStreams}
              disabled={loading}
              className="flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Ending All Streams...
                </>
              ) : (
                <>
                  <Square className="h-4 w-4" />
                  End All Active Streams
                </>
              )}
            </Button>
          </div>
        </>
      ) : (
        <div className="text-center py-8">
          <div className="h-16 w-16 rounded-full bg-green-100 dark:bg-green-950 flex items-center justify-center mx-auto mb-4">
            <Radio className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
          <h3 className="text-lg font-medium text-green-800 dark:text-green-200 mb-2">
            No Active Streams
          </h3>
          <p className="text-sm text-green-600 dark:text-green-300">
            You don't have any active streams running. You can start new webinars without any conflicts.
          </p>
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-border">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.refresh()}
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh Status
        </Button>
      </div>
    </div>
  );
};

export default StreamManagement; 