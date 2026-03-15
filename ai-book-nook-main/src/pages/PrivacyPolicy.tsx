import { Helmet } from 'react-helmet-async';
import Layout from '@/components/layout/Layout';
import { useTranslation } from 'react-i18next';

const PrivacyPolicy = () => {
    const { t } = useTranslation();

    return (
        <Layout>
            <Helmet>
                <title>{t('privacyPolicy.title')} | Sri Chola Book Shop</title>
            </Helmet>
            <div className="container mx-auto px-4 py-12 max-w-4xl">
                <h1 className="font-serif text-3xl font-bold mb-8">{t('privacyPolicy.title')}</h1>

                <div className="prose prose-slate dark:prose-invert max-w-none space-y-6">
                    <p className="text-muted-foreground">{t('privacyPolicy.lastUpdated')}</p>

                    <section>
                        <h2 className="text-xl font-semibold mb-3">{t('privacyPolicy.sections.s1.title')}</h2>
                        <p>
                            {t('privacyPolicy.sections.s1.text')}
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-3">{t('privacyPolicy.sections.s2.title')}</h2>
                        <p>
                            {t('privacyPolicy.sections.s2.text')}
                        </p>
                        <ul className="list-disc pl-6 mt-2 space-y-1">
                            {((t('privacyPolicy.sections.s2.list', { returnObjects: true }) as string[]) || []).map((item, index) => (
                                <li key={index}>{item}</li>
                            ))}
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-3">{t('privacyPolicy.sections.s3.title')}</h2>
                        <p>
                            {t('privacyPolicy.sections.s3.text')}
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-3">{t('privacyPolicy.sections.s4.title')}</h2>
                        <p>
                            {t('privacyPolicy.sections.s4.text')}
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-3">{t('privacyPolicy.sections.s5.title')}</h2>
                        <p>
                            {t('privacyPolicy.sections.s5.text')}
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-3">{t('privacyPolicy.sections.s6.title')}</h2>
                        <p>
                            {t('privacyPolicy.sections.s6.text')}
                        </p>
                    </section>
                </div>
            </div>
        </Layout>
    );
};

export default PrivacyPolicy;
