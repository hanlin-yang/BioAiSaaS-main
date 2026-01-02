import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, BookOpen, FileText, AlertCircle, GraduationCap, ChevronRight, Clock, Tag } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';

interface Article {
  id: string;
  title: string;
  description: string;
  category: string;
  readTime: string;
  tags: string[];
}

const articles: Article[] = [
  {
    id: 'scrna-best-practices',
    title: 'scRNA-seq Analysis Best Practices',
    description: 'Complete guide to single-cell RNA sequencing analysis including quality control, normalization, and clustering.',
    category: 'bestPractices',
    readTime: '15 min',
    tags: ['scRNA-seq', 'Quality Control', 'Clustering'],
  },
  {
    id: 'gwas-qc',
    title: 'GWAS Quality Control Guide',
    description: 'Essential QC steps for genome-wide association studies including sample and variant filtering.',
    category: 'protocols',
    readTime: '20 min',
    tags: ['GWAS', 'Quality Control', 'Variant Filtering'],
  },
  {
    id: 'crispr-screen-design',
    title: 'CRISPR Screen Experimental Design',
    description: 'Guidelines for designing effective CRISPR screens including library selection and control strategies.',
    category: 'protocols',
    readTime: '25 min',
    tags: ['CRISPR', 'Experimental Design', 'Library'],
  },
  {
    id: 'cell-type-annotation',
    title: 'Automated Cell Type Annotation',
    description: 'Step-by-step tutorial on using reference-based and marker-based cell type annotation methods.',
    category: 'tutorials',
    readTime: '12 min',
    tags: ['Cell Type', 'Annotation', 'scRNA-seq'],
  },
  {
    id: 'batch-effect-correction',
    title: 'Batch Effect Correction Methods',
    description: 'Common troubleshooting approaches for batch effects in multi-sample analyses.',
    category: 'troubleshooting',
    readTime: '10 min',
    tags: ['Batch Effect', 'Integration', 'Normalization'],
  },
  {
    id: 'variant-calling-pipeline',
    title: 'Building a Variant Calling Pipeline',
    description: 'Comprehensive tutorial on setting up an automated variant calling workflow.',
    category: 'tutorials',
    readTime: '30 min',
    tags: ['Variant Calling', 'Pipeline', 'WGS'],
  },
  {
    id: 'differential-expression',
    title: 'Differential Expression Analysis',
    description: 'Best practices for identifying differentially expressed genes in bulk and single-cell data.',
    category: 'bestPractices',
    readTime: '18 min',
    tags: ['DEG', 'Statistics', 'RNA-seq'],
  },
  {
    id: 'memory-optimization',
    title: 'Memory Optimization Tips',
    description: 'Solutions for common memory issues when processing large genomic datasets.',
    category: 'troubleshooting',
    readTime: '8 min',
    tags: ['Memory', 'Optimization', 'Large Data'],
  },
];

const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  bestPractices: BookOpen,
  protocols: FileText,
  troubleshooting: AlertCircle,
  tutorials: GraduationCap,
};

const categories = ['bestPractices', 'protocols', 'troubleshooting', 'tutorials'];

export const Knowledge = () => {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const filteredArticles = articles.filter((article) => {
    const matchesSearch =
      article.title.toLowerCase().includes(search.toLowerCase()) ||
      article.description.toLowerCase().includes(search.toLowerCase()) ||
      article.tags.some((tag) => tag.toLowerCase().includes(search.toLowerCase()));
    const matchesCategory = activeCategory === 'all' || article.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      <Breadcrumbs />
      <h1 className="font-serif text-3xl font-bold text-foreground">{t('knowledge.title')}</h1>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder={t('knowledge.search')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      <Tabs value={activeCategory} onValueChange={setActiveCategory}>
        <TabsList className="flex-wrap">
          <TabsTrigger value="all">All</TabsTrigger>
          {categories.map((cat) => {
            const Icon = categoryIcons[cat];
            return (
              <TabsTrigger key={cat} value={cat} className="gap-2">
                {Icon && <Icon className="h-4 w-4" />}
                {t(`knowledge.categories.${cat}`)}
              </TabsTrigger>
            );
          })}
        </TabsList>

        <TabsContent value={activeCategory} className="mt-6">
          <div className="space-y-4">
            {filteredArticles.map((article) => {
              const CategoryIcon = categoryIcons[article.category];
              return (
                <Card
                  key={article.id}
                  className="group cursor-pointer transition-all hover:shadow-lg hover:border-primary/50"
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                          <CategoryIcon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="flex items-center gap-2 text-lg">
                            {article.title}
                            <ChevronRight className="h-4 w-4 opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-1" />
                          </CardTitle>
                          <div className="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {article.readTime}
                            </span>
                            <Badge variant="secondary" className="text-xs capitalize">
                              {t(`knowledge.categories.${article.category}`)}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="mb-3">{article.description}</CardDescription>
                    <div className="flex flex-wrap items-center gap-2">
                      <Tag className="h-3 w-3 text-muted-foreground" />
                      {article.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {filteredArticles.length === 0 && (
            <div className="py-12 text-center">
              <p className="text-muted-foreground">No articles found matching your search.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
