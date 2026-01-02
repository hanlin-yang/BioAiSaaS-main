import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Key, Globe, Palette, Bell, Save, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { useTheme } from '@/contexts/ThemeContext';
import { useToast } from '@/hooks/use-toast';

export const Settings = () => {
  const { t, i18n } = useTranslation();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [notifications, setNotifications] = useState({
    email: true,
    browser: false,
  });

  const handleSaveApiKey = () => {
    if (!apiKey.trim()) {
      toast({
        title: t('common.error'),
        description: 'Please enter an API key',
        variant: 'destructive',
      });
      return;
    }
    toast({
      title: t('common.success'),
      description: 'API key saved successfully',
    });
  };

  const handleTestConnection = () => {
    toast({
      title: t('common.success'),
      description: 'Connection successful!',
    });
  };

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('language', lang);
  };

  return (
    <div className="space-y-6">
      <Breadcrumbs />
      <h1 className="font-serif text-3xl font-bold text-foreground">{t('settings.title')}</h1>

      <div className="grid gap-6">
        {/* API Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5 text-primary" />
              {t('settings.api.title')}
            </CardTitle>
            <CardDescription>
              Configure your API credentials for external services
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="api-key">{t('settings.api.key')}</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    id="api-key"
                    type={showApiKey ? 'text' : 'password'}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder={t('settings.api.placeholder')}
                    className="pr-10"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full"
                    onClick={() => setShowApiKey(!showApiKey)}
                  >
                    {showApiKey ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSaveApiKey} className="gap-2">
                <Save className="h-4 w-4" />
                {t('settings.api.save')}
              </Button>
              <Button variant="outline" onClick={handleTestConnection} className="gap-2">
                <CheckCircle className="h-4 w-4" />
                {t('settings.api.test')}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Language Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" />
              {t('settings.language.title')}
            </CardTitle>
            <CardDescription>{t('settings.language.description')}</CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={i18n.language}
              onValueChange={changeLanguage}
              className="flex flex-col gap-3"
            >
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="en" id="lang-en" />
                <Label htmlFor="lang-en" className="cursor-pointer font-normal">
                  English
                </Label>
              </div>
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="zh" id="lang-zh" />
                <Label htmlFor="lang-zh" className="cursor-pointer font-normal">
                  简体中文
                </Label>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Theme Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5 text-primary" />
              {t('settings.theme.title')}
            </CardTitle>
            <CardDescription>{t('settings.theme.description')}</CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={theme}
              onValueChange={(value) => setTheme(value as 'light' | 'dark' | 'system')}
              className="flex flex-col gap-3"
            >
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="light" id="theme-light" />
                <Label htmlFor="theme-light" className="cursor-pointer font-normal">
                  {t('settings.theme.light')}
                </Label>
              </div>
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="dark" id="theme-dark" />
                <Label htmlFor="theme-dark" className="cursor-pointer font-normal">
                  {t('settings.theme.dark')}
                </Label>
              </div>
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="system" id="theme-system" />
                <Label htmlFor="theme-system" className="cursor-pointer font-normal">
                  {t('settings.theme.system')}
                </Label>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              {t('settings.notifications.title')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="email-notifications" className="font-normal">
                  {t('settings.notifications.email')}
                </Label>
                <p className="text-sm text-muted-foreground">
                  Receive email notifications for completed analyses
                </p>
              </div>
              <Switch
                id="email-notifications"
                checked={notifications.email}
                onCheckedChange={(checked) =>
                  setNotifications((prev) => ({ ...prev, email: checked }))
                }
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="browser-notifications" className="font-normal">
                  {t('settings.notifications.browser')}
                </Label>
                <p className="text-sm text-muted-foreground">
                  Show browser notifications for real-time updates
                </p>
              </div>
              <Switch
                id="browser-notifications"
                checked={notifications.browser}
                onCheckedChange={(checked) =>
                  setNotifications((prev) => ({ ...prev, browser: checked }))
                }
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
