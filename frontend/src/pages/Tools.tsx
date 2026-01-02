import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, ExternalLink, Dna, Activity, FlaskConical, Database, Microscope, BarChart3 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';

interface Tool {
  id: string;
  name: string;
  description: string;
  category: string;
  version: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
}

const tools: Tool[] = [
  { id: 'scanpy', name: 'Scanpy', description: 'Single-cell analysis in Python', category: 'sequencing', version: '1.9.6', url: 'https://scanpy.readthedocs.io', icon: Dna },
  { id: 'plink', name: 'PLINK', description: 'Whole-genome association analysis', category: 'genomics', version: '2.0', url: 'https://www.cog-genomics.org/plink/', icon: Activity },
  { id: 'mageck', name: 'MAGeCK', description: 'CRISPR screen analysis', category: 'sequencing', version: '0.5.9', url: 'https://sourceforge.net/projects/mageck/', icon: FlaskConical },
  { id: 'deseq2', name: 'DESeq2', description: 'Differential expression analysis', category: 'sequencing', version: '1.40.0', url: 'https://bioconductor.org/packages/DESeq2/', icon: BarChart3 },
  { id: 'cellranger', name: 'Cell Ranger', description: '10x Genomics data processing', category: 'sequencing', version: '7.2.0', url: 'https://support.10xgenomics.com/single-cell-gene-expression/software/pipelines/latest/what-is-cell-ranger', icon: Microscope },
  { id: 'ensembl', name: 'Ensembl', description: 'Genome browser and annotation', category: 'databases', version: '110', url: 'https://www.ensembl.org', icon: Database },
  { id: 'seurat', name: 'Seurat', description: 'R toolkit for single-cell genomics', category: 'sequencing', version: '5.0', url: 'https://satijalab.org/seurat/', icon: Dna },
  { id: 'gatk', name: 'GATK', description: 'Genome Analysis Toolkit', category: 'genomics', version: '4.4', url: 'https://gatk.broadinstitute.org/', icon: Activity },
  { id: 'stringdb', name: 'STRING', description: 'Protein-protein interaction networks', category: 'proteomics', version: '12.0', url: 'https://string-db.org', icon: Database },
  { id: 'uniprot', name: 'UniProt', description: 'Protein sequence and functional information', category: 'databases', version: '2024_01', url: 'https://www.uniprot.org', icon: Database },
  { id: 'ncbi', name: 'NCBI', description: 'National Center for Biotechnology Information', category: 'databases', version: 'Latest', url: 'https://www.ncbi.nlm.nih.gov', icon: Database },
  { id: 'bwa', name: 'BWA', description: 'Burrows-Wheeler Aligner', category: 'genomics', version: '0.7.17', url: 'http://bio-bwa.sourceforge.net', icon: Activity },
];

const categories = [
  { key: 'all', icon: null },
  { key: 'sequencing', icon: Dna },
  { key: 'genomics', icon: Activity },
  { key: 'proteomics', icon: FlaskConical },
  { key: 'databases', icon: Database },
];

export const Tools = () => {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const filteredTools = tools.filter((tool) => {
    const matchesSearch =
      tool.name.toLowerCase().includes(search.toLowerCase()) ||
      tool.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === 'all' || tool.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      <Breadcrumbs />
      <h1 className="font-serif text-3xl font-bold text-foreground">{t('tools.title')}</h1>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t('tools.search')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <Tabs value={activeCategory} onValueChange={setActiveCategory}>
        <TabsList className="flex-wrap">
          {categories.map(({ key, icon: Icon }) => (
            <TabsTrigger key={key} value={key} className="gap-2">
              {Icon && <Icon className="h-4 w-4" />}
              {t(`tools.categories.${key}`)}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={activeCategory} className="mt-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredTools.map((tool) => (
              <Card
                key={tool.id}
                className="group cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1"
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <tool.icon className="h-5 w-5 text-primary" />
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      v{tool.version}
                    </Badge>
                  </div>
                  <CardTitle className="mt-2 flex items-center gap-2 text-lg">
                    {tool.name}
                    <a
                      href={tool.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      <ExternalLink className="h-4 w-4 text-muted-foreground hover:text-primary" />
                    </a>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{tool.description}</CardDescription>
                  <Badge variant="outline" className="mt-3 capitalize">
                    {tool.category}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredTools.length === 0 && (
            <div className="py-12 text-center">
              <p className="text-muted-foreground">No tools found matching your search.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
