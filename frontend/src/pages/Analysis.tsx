import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Upload, FileText, Play, Download, CheckCircle, XCircle, Loader2, Dna, Activity, FlaskConical, GitBranch, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { useToast } from '@/hooks/use-toast';

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
}

interface AnalysisTask {
  key: string;
  icon: React.ComponentType<{ className?: string }>;
  selected: boolean;
}

type TaskStatus = 'idle' | 'running' | 'completed' | 'error';

export const Analysis = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [status, setStatus] = useState<TaskStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [tasks, setTasks] = useState<AnalysisTask[]>([
    { key: 'scRNA', icon: Dna, selected: false },
    { key: 'gwas', icon: Activity, selected: false },
    { key: 'crispr', icon: FlaskConical, selected: false },
    { key: 'pathway', icon: GitBranch, selected: false },
    { key: 'variant', icon: Zap, selected: false },
  ]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files).map((file) => ({
      id: Date.now().toString() + Math.random(),
      name: file.name,
      size: file.size,
      type: file.type,
    }));
    setFiles((prev) => [...prev, ...droppedFiles]);
    toast({
      title: t('common.success'),
      description: `${droppedFiles.length} file(s) uploaded`,
    });
  }, [toast, t]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files).map((file) => ({
        id: Date.now().toString() + Math.random(),
        name: file.name,
        size: file.size,
        type: file.type,
      }));
      setFiles((prev) => [...prev, ...selectedFiles]);
      toast({
        title: t('common.success'),
        description: `${selectedFiles.length} file(s) uploaded`,
      });
    }
  }, [toast, t]);

  const toggleTask = (key: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.key === key ? { ...task, selected: !task.selected } : task
      )
    );
  };

  const runAnalysis = () => {
    if (files.length === 0 || !tasks.some((t) => t.selected)) {
      toast({
        title: t('common.error'),
        description: 'Please upload files and select at least one task',
        variant: 'destructive',
      });
      return;
    }

    setStatus('running');
    setProgress(0);

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setStatus('completed');
          toast({
            title: t('common.success'),
            description: 'Analysis completed successfully!',
          });
          return 100;
        }
        return prev + 10;
      });
    }, 500);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const statusConfig = {
    idle: { icon: null, color: 'secondary' as const, label: t('analysis.status.idle') },
    running: { icon: Loader2, color: 'default' as const, label: t('analysis.status.running') },
    completed: { icon: CheckCircle, color: 'default' as const, label: t('analysis.status.completed') },
    error: { icon: XCircle, color: 'destructive' as const, label: t('analysis.status.error') },
  };

  return (
    <div className="space-y-6">
      <Breadcrumbs />
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-3xl font-bold text-foreground">{t('analysis.title')}</h1>
        <Badge variant={statusConfig[status].color} className="gap-1 px-3 py-1">
          {statusConfig[status].icon && (() => {
            const Icon = statusConfig[status].icon;
            return <Icon className={`h-4 w-4 ${status === 'running' ? 'animate-spin' : ''}`} />;
          })()}
          {statusConfig[status].label}
        </Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* File Upload */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5 text-primary" />
              {t('analysis.upload.title')}
            </CardTitle>
            <CardDescription>{t('analysis.upload.supported')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`relative flex min-h-[200px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors ${
                isDragging
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <input
                type="file"
                multiple
                onChange={handleFileInput}
                className="absolute inset-0 cursor-pointer opacity-0"
                accept=".csv,.tsv,.h5ad,.vcf,.fastq,.fq,.gz"
              />
              <Upload className="mb-4 h-12 w-12 text-muted-foreground" />
              <p className="text-center text-sm text-muted-foreground">
                {t('analysis.upload.description')}
              </p>
            </div>

            {files.length > 0 && (
              <div className="mt-4 space-y-2">
                {files.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center gap-3 rounded-lg bg-muted/50 p-3"
                  >
                    <FileText className="h-5 w-5 text-primary" />
                    <div className="flex-1 overflow-hidden">
                      <p className="truncate text-sm font-medium text-foreground">
                        {file.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setFiles((prev) => prev.filter((f) => f.id !== file.id))}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Task Selection */}
        <Card>
          <CardHeader>
            <CardTitle>{t('analysis.tasks.title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2">
              {tasks.map(({ key, icon: Icon, selected }) => (
                <button
                  key={key}
                  onClick={() => toggleTask(key)}
                  className={`flex items-center gap-3 rounded-lg border-2 p-4 text-left transition-all ${
                    selected
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                      selected ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="font-medium text-foreground">
                    {t(`analysis.tasks.${key}`)}
                  </span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress & Actions */}
      <Card>
        <CardContent className="pt-6">
          {status === 'running' && (
            <div className="mb-6">
              <div className="mb-2 flex justify-between text-sm">
                <span className="text-muted-foreground">Analysis Progress</span>
                <span className="font-medium text-foreground">{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          <div className="flex flex-wrap gap-4">
            <Button
              onClick={runAnalysis}
              disabled={status === 'running' || files.length === 0}
              className="gap-2"
            >
              {status === 'running' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Play className="h-4 w-4" />
              )}
              {t('analysis.run')}
            </Button>
            <Button
              variant="outline"
              disabled={status !== 'completed'}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              {t('analysis.download')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
