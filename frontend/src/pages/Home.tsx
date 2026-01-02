import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ArrowRight, Bot, Dna, Activity, FlaskConical, Database, Users, BarChart3, Zap, Settings, Upload, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import heroBg from '@/assets/hero-bg.jpg';

const features = [
  { key: 'aiAgent', icon: Bot, color: 'bg-primary/10 text-primary' },
  { key: 'scRNA', icon: Dna, color: 'bg-accent text-accent-foreground' },
  { key: 'gwas', icon: Activity, color: 'bg-primary/10 text-primary' },
  { key: 'crispr', icon: FlaskConical, color: 'bg-accent text-accent-foreground' },
];

const quickStartSteps = [
  { key: 'step1', icon: Settings },
  { key: 'step2', icon: Upload },
  { key: 'step3', icon: Bot },
  { key: 'step4', icon: FileText },
];

const stats = [
  { key: 'tools', value: '50+', icon: Zap },
  { key: 'databases', value: '20+', icon: Database },
  { key: 'users', value: '10K+', icon: Users },
  { key: 'analyses', value: '100K+', icon: BarChart3 },
];

export const Home = () => {
  const { t } = useTranslation();

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroBg})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/80 to-background/60" />
        <div className="relative px-6 py-20 text-center sm:py-28">
          <div className="mx-auto max-w-3xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium">
              <Dna className="h-4 w-4 text-primary" />
              <span className="text-foreground">{t('home.subtitle')}</span>
            </div>
            <h1 className="mb-6 font-serif text-5xl font-bold tracking-tight text-foreground md:text-6xl lg:text-7xl">
              {t('home.title')}
            </h1>
            <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground">
              {t('home.description')}
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button asChild size="lg" className="gap-2">
                <Link to="/console">
                  {t('home.getStarted')}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/knowledge">{t('home.learnMore')}</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {stats.map(({ key, value, icon: Icon }) => (
          <Card key={key} className="text-center">
            <CardContent className="pt-6">
              <Icon className="mx-auto mb-2 h-8 w-8 text-primary" />
              <div className="text-3xl font-bold text-foreground">{value}</div>
              <div className="text-sm text-muted-foreground">{t(`home.stats.${key}`)}</div>
            </CardContent>
          </Card>
        ))}
      </section>

      {/* Features Section */}
      <section>
        <h2 className="mb-8 text-center font-serif text-3xl font-bold text-foreground">
          {t('home.features.title')}
        </h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {features.map(({ key, icon: Icon, color }) => (
            <Card key={key} className="group transition-all hover:shadow-lg hover:-translate-y-1">
              <CardHeader>
                <div className={`mb-2 inline-flex h-12 w-12 items-center justify-center rounded-xl ${color}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <CardTitle className="text-lg">{t(`home.features.${key}.title`)}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{t(`home.features.${key}.description`)}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Quick Start Section */}
      <section className="rounded-2xl bg-card p-8 shadow-sm">
        <h2 className="mb-8 text-center font-serif text-3xl font-bold text-foreground">
          {t('home.quickStart.title')}
        </h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {quickStartSteps.map(({ key, icon: Icon }, index) => (
            <div key={key} className="relative flex flex-col items-center text-center">
              {index < quickStartSteps.length - 1 && (
                <div className="absolute left-1/2 top-8 hidden h-0.5 w-full bg-border lg:block" />
              )}
              <div className="relative z-10 mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Icon className="h-7 w-7" />
                <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-accent text-xs font-bold text-accent-foreground">
                  {index + 1}
                </span>
              </div>
              <h3 className="mb-2 font-semibold text-foreground">
                {t(`home.quickStart.${key}.title`)}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t(`home.quickStart.${key}.description`)}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="rounded-2xl bg-primary p-8 text-center text-primary-foreground">
        <h2 className="mb-4 font-serif text-3xl font-bold">
          Ready to accelerate your research?
        </h2>
        <p className="mx-auto mb-6 max-w-xl opacity-90">
          Start using BioAiSaaS today and experience the power of AI-driven biomedical analysis.
        </p>
        <Button asChild size="lg" variant="secondary" className="gap-2">
          <Link to="/console">
            {t('home.getStarted')}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </section>
    </div>
  );
};
