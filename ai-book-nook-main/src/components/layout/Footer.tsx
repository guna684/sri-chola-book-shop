import { Link } from 'react-router-dom';
import { BookOpen, Mail, Phone, MapPin } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import api from '@/lib/axios';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface QuickLink {
  id: number;
  title: string;
  path: string;
  icon: string;
  order: number;
  active: boolean;
}

interface FooterCategory {
  _id: string;
  name: string;
  slug: string;
  icon: string;
  description: string;
  bookCount: number;
}

const Footer = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [quickLinks, setQuickLinks] = useState<QuickLink[]>([]);
  const [categories, setCategories] = useState<FooterCategory[]>([]);

  useEffect(() => {
    const fetchFooterData = async () => {
      try {
        const [linksRes, catsRes] = await Promise.all([
          api.get('/api/admin/quick-links/public'),
          api.get('/api/categories')
        ]);
        setQuickLinks(linksRes.data);
        setCategories(catsRes.data);
      } catch (error) {
        console.error('Failed to fetch footer data:', error);
      }
    };
    fetchFooterData();
  }, []);

  const handleSubscribe = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      await api.post('/api/newsletter/subscribe', { email });
      toast.success('Successfully subscribed to newsletter!');
      setEmail('');
    } catch (error: any) {
      console.error('Error subscribing:', error);
      toast.error(
        error.response?.data?.message || 'Failed to subscribe. Please try again.'
      );
    }
  };

  return (
    <footer className="bg-sidebar text-sidebar-foreground">

      {/* Newsletter Section */}
      <div className="border-b border-sidebar-border">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto text-center">
            <h3 className="font-serif text-2xl md:text-3xl font-bold mb-3">
              {t('footer.newsletterTitle')}
            </h3>
            <p className="text-sidebar-foreground/70 mb-6">
              {t('footer.newsletterSubtitle')}
            </p>

            <form
              onSubmit={handleSubscribe}
              className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
            >
              <Input
                type="email"
                required
                placeholder={t('footer.emailPlaceholder')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-sidebar-accent border-sidebar-border text-sidebar-foreground placeholder:text-sidebar-foreground/50"
              />
              <Button type="submit" variant="gold" className="whitespace-nowrap">
                {t('footer.subscribe')}
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">

          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center gap-2 mb-4">
              <BookOpen className="h-8 w-8 text-sidebar-primary" />
              <span className="font-serif text-2xl font-bold">
                {t('common.bookHaven')}
              </span>
            </Link>
            <p className="text-sidebar-foreground/70 mb-6 leading-relaxed">
              {t('footer.tagline')}
            </p>
          </div>

          {/* Quick Links - fetched from API */}
          <div>
            <h4 className="font-serif text-lg font-semibold mb-4">{t('footer.quickLinks')}</h4>
            <ul className="space-y-3">
              {quickLinks.map(link => (
                <li key={link.id}>
                  <Link to={link.path} className="text-sidebar-foreground/70 hover:text-sidebar-primary">
                    {t(`footer.links.${link.title.toLowerCase()}`, link.title)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories - fetched from API */}
          <div>
            <h4 className="font-serif text-lg font-semibold mb-4">{t('footer.categories')}</h4>
            <ul className="space-y-3">
              {categories.map(cat => (
                <li key={cat._id}>
                  <Link
                    to={`/books?category=${cat.slug}`}
                    className="text-sidebar-foreground/70 hover:text-sidebar-primary"
                  >
                    {t(`categories.${cat.slug}`, cat.name)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-serif text-lg font-semibold mb-4">{t('footer.contactUs')}</h4>
            <ul className="space-y-4">
              <li className="flex gap-3 items-start">
                <MapPin className="h-5 w-5 text-sidebar-primary mt-0.5 flex-shrink-0" />
                <span className="text-sidebar-foreground/70 leading-tight">
                  Kuthirai Vandi Theru, Seethalakshmi Puram<br />
                  Gobichettipalayam, Tamil Nadu - 638476
                </span>
              </li>
              <li className="flex gap-3 items-center">
                <Phone className="h-5 w-5 text-sidebar-primary flex-shrink-0" />
                <span className="text-sidebar-foreground/70">+91 9486762192</span>
              </li>
              <li className="flex gap-3 items-center">
                <Mail className="h-5 w-5 text-sidebar-primary flex-shrink-0" />
                <span className="text-sidebar-foreground/70">sricholabookgob@gmail.com</span>
              </li>
            </ul>
          </div>

        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-sidebar-border">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-sidebar-foreground/60">
          © 2024 Sri Chola Book Shop. {t('footer.rights')}
        </div>
      </div>

    </footer>
  );
};

export default Footer;

