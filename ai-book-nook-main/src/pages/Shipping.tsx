import { Helmet } from 'react-helmet-async';
import Layout from '@/components/layout/Layout';
import { useTranslation } from 'react-i18next';

const Shipping = () => {
    const { t } = useTranslation();

    return (
        <Layout>
            <Helmet>
                <title>{t('shipping.title')} | Sri Chola Book Shop</title>
            </Helmet>
            <div className="container mx-auto px-4 py-12 max-w-4xl">
                <h1 className="font-serif text-3xl font-bold mb-8">{t('shipping.title')}</h1>

                <div className="prose prose-slate dark:prose-invert max-w-none space-y-6">
                    <section>
                        <h2 className="text-xl font-semibold mb-3">{t('shipping.deliveryOptions.title')}</h2>
                        <div className="grid md:grid-cols-2 gap-6 mt-4">
                            <div className="p-6 border border-border rounded-lg bg-card">
                                <h3 className="font-bold text-lg mb-2">{t('shipping.deliveryOptions.standard.title')}</h3>
                                <p className="text-muted-foreground mb-2">{t('shipping.deliveryOptions.standard.days')}</p>
                                <p className="font-medium">{t('shipping.deliveryOptions.standard.price')}</p>
                            </div>
                            <div className="p-6 border border-border rounded-lg bg-card">
                                <h3 className="font-bold text-lg mb-2">{t('shipping.deliveryOptions.express.title')}</h3>
                                <p className="text-muted-foreground mb-2">{t('shipping.deliveryOptions.express.days')}</p>
                                <p className="font-medium">{t('shipping.deliveryOptions.express.price')}</p>
                            </div>
                        </div>
                    </section>

                    <section className="mt-8">
                        <h2 className="text-xl font-semibold mb-3">{t('shipping.processing.title')}</h2>
                        <p>
                            {t('shipping.processing.text')}
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-3">{t('shipping.international.title')}</h2>
                        <p>
                            {t('shipping.international.text')}
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-3">{t('shipping.tracking.title')}</h2>
                        <p>
                            {t('shipping.tracking.text')}
                        </p>
                    </section>
                </div>
            </div>
        </Layout>
    );
};

export default Shipping;
