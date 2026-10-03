import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import AdminLayout from '@/components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Settings, Save, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/axios';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const StoreSettings = () => {
    const { t } = useTranslation();
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [lowStockLimit, setLowStockLimit] = useState<number>(20);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const { data } = await api.get('/api/settings');
                if (data && data.lowStockLimit !== undefined) {
                    setLowStockLimit(data.lowStockLimit);
                }
            } catch (error) {
                toast.error(t('admin.settings.messages.fetchError'));
            } finally {
                setLoading(false);
            }
        };

        fetchSettings();
    }, [t]);

    const handleSave = async () => {
        if (lowStockLimit < 0) {
            toast.error(t('admin.settings.messages.negativeError'));
            return;
        }

        try {
            setSaving(true);
            const config = { headers: { Authorization: `Bearer ${user?.token}` } };
            await api.put('/api/settings', { lowStockLimit }, config);
            toast.success(t('admin.settings.messages.saveSuccess'));
        } catch (error) {
            toast.error(t('admin.settings.messages.saveError'));
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center min-h-[60vh]">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <Helmet>
                <title>{t('admin.settings.title')} | Admin Dashboard</title>
            </Helmet>

            <div className="w-full">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <h1 className="text-3xl font-bold font-serif text-foreground mb-2 flex items-center gap-3">
                        <Settings className="h-8 w-8 text-primary" /> {t('admin.settings.title')}
                    </h1>
                    <p className="text-muted-foreground">{t('admin.settings.subtitle')}</p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-xl pb-2 border-b border-border">{t('admin.settings.inventoryAlerts')}</CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6 space-y-6">
                                <div className="space-y-3">
                                    <Label htmlFor="lowStockLimit" className="text-base font-semibold">{t('admin.settings.lowStockLimit')}</Label>
                                    <p className="text-sm text-muted-foreground">
                                        {t('admin.settings.lowStockDesc')}
                                    </p>
                                    <div className="flex items-center gap-4">
                                        <Input
                                            id="lowStockLimit"
                                            type="number"
                                            min="0"
                                            className="w-32"
                                            value={lowStockLimit}
                                            onChange={(e) => setLowStockLimit(parseInt(e.target.value) || 0)}
                                        />
                                        <span className="text-muted-foreground">{t('admin.settings.units')}</span>
                                    </div>
                                </div>

                                <div className="pt-4 flex justify-end">
                                    <Button onClick={handleSave} disabled={saving} className="flex items-center gap-2">
                                        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                        {t('admin.settings.save')}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default StoreSettings;
