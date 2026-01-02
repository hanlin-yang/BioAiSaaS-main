import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Search, MoreHorizontal, FolderOpen, Dna, Activity, FlaskConical, Trash2, Edit, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { useToast } from '@/hooks/use-toast';

interface Project {
  id: string;
  name: string;
  type: 'scRNA' | 'GWAS' | 'CRISPR';
  status: 'active' | 'completed' | 'archived';
  created: string;
}

const projectTypeIcons = {
  scRNA: Dna,
  GWAS: Activity,
  CRISPR: FlaskConical,
};

const initialProjects: Project[] = [
  { id: '1', name: 'Lung Cancer scRNA Analysis', type: 'scRNA', status: 'active', created: '2024-01-15' },
  { id: '2', name: 'T2D GWAS Study', type: 'GWAS', status: 'completed', created: '2024-01-10' },
  { id: '3', name: 'Drug Resistance Screen', type: 'CRISPR', status: 'active', created: '2024-01-08' },
  { id: '4', name: 'Immune Cell Atlas', type: 'scRNA', status: 'archived', created: '2023-12-20' },
];

export const Projects = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [search, setSearch] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', type: 'scRNA' as Project['type'] });

  const filteredProjects = projects.filter((project) =>
    project.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreateProject = () => {
    if (!newProject.name.trim()) {
      toast({
        title: t('common.error'),
        description: 'Please enter a project name',
        variant: 'destructive',
      });
      return;
    }

    const project: Project = {
      id: Date.now().toString(),
      name: newProject.name,
      type: newProject.type,
      status: 'active',
      created: new Date().toISOString().split('T')[0],
    };

    setProjects((prev) => [project, ...prev]);
    setNewProject({ name: '', type: 'scRNA' });
    setIsDialogOpen(false);
    toast({
      title: t('common.success'),
      description: 'Project created successfully',
    });
  };

  const handleDeleteProject = (id: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
    toast({
      title: t('common.success'),
      description: 'Project deleted',
    });
  };

  const getStatusVariant = (status: Project['status']) => {
    switch (status) {
      case 'active':
        return 'default';
      case 'completed':
        return 'secondary';
      case 'archived':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  return (
    <div className="space-y-6">
      <Breadcrumbs />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-serif text-3xl font-bold text-foreground">{t('projects.title')}</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              {t('projects.new')}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('projects.new')}</DialogTitle>
              <DialogDescription>
                Create a new biomedical analysis project
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Project Name</Label>
                <Input
                  id="name"
                  value={newProject.name}
                  onChange={(e) => setNewProject((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter project name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Project Type</Label>
                <Select
                  value={newProject.type}
                  onValueChange={(value) =>
                    setNewProject((prev) => ({ ...prev, type: value as Project['type'] }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="scRNA">scRNA-seq Analysis</SelectItem>
                    <SelectItem value="GWAS">GWAS Analysis</SelectItem>
                    <SelectItem value="CRISPR">CRISPR Screening</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                {t('common.cancel')}
              </Button>
              <Button onClick={handleCreateProject}>{t('common.confirm')}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder={t('projects.search')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {filteredProjects.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FolderOpen className="mb-4 h-16 w-16 text-muted" />
            <CardTitle className="mb-2 text-lg">{t('projects.empty')}</CardTitle>
            <CardDescription>
              Click the "New Project" button to create your first project.
            </CardDescription>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('projects.columns.name')}</TableHead>
                <TableHead>{t('projects.columns.type')}</TableHead>
                <TableHead>{t('projects.columns.status')}</TableHead>
                <TableHead>{t('projects.columns.created')}</TableHead>
                <TableHead className="text-right">{t('projects.columns.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProjects.map((project) => {
                const TypeIcon = projectTypeIcons[project.type];
                return (
                  <TableRow key={project.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                          <TypeIcon className="h-4 w-4 text-primary" />
                        </div>
                        {project.name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{project.type}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(project.status)}>
                        {t(`projects.status.${project.status}`)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{project.created}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem className="gap-2">
                            <Eye className="h-4 w-4" />
                            {t('common.view')}
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-2">
                            <Edit className="h-4 w-4" />
                            {t('common.edit')}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="gap-2 text-destructive"
                            onClick={() => handleDeleteProject(project.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                            {t('common.delete')}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
};
