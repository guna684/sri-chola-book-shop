import { Helmet } from 'react-helmet-async';
import Layout from '@/components/layout/Layout';
import { useTranslation } from 'react-i18next';

const ReturnPolicy = () => {
    const { t } = useTranslation();

    return (
        <Layout>
            <Helmet>
                <title>{t('returnPolicy.title')} | Sri Chola Book Shop</title>
            </Helmet>
            <div className="container mx-auto px-4 py-12 max-w-4xl">
                <h1 className="font-serif text-3xl font-bold mb-8">{t('returnPolicy.title')}</h1>

                <div className="prose prose-slate dark:prose-invert max-w-none space-y-6">
                    <p className="text-muted-foreground">
                        {t('returnPolicy.intro')}
                    </p>

                    <section>
                        <h2 className="text-xl font-semibold mb-3">{t('returnPolicy.returns.title')}</h2>
                        <p>
                            {t('returnPolicy.returns.text')}
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-3">{t('returnPolicy.refunds.title')}</h2>
                        <p>
                            {t('returnPolicy.refunds.text1')}
                        </p>
                        <p className="mt-2">
                            {t('returnPolicy.refunds.text2')}
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-3">{t('returnPolicy.shipping.title')}</h2>
                        <p>
                            {t('returnPolicy.shipping.text')}
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-3">{t('returnPolicy.damaged.title')}</h2>
                        <p>
                            {t('returnPolicy.damaged.text')}
                        </p>
                    </section>
                </div>
            </div>
        </Layout>
    );
};

export default ReturnPolicy;
