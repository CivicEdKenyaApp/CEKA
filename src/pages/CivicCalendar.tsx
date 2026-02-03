
import React from 'react';
import Layout from '@/components/layout/Layout';
import EventCalendar from '@/components/calendar/EventCalendar';
import { useAdminAccess } from '@/hooks/useAdminAccess';
import { motion } from 'framer-motion';
import { Calendar as CalendarIcon, Bell, Info } from 'lucide-react';

const CivicCalendar = () => {
    const { isAdmin } = useAdminAccess();

    return (
        <Layout>
            <div className="container mx-auto px-4 py-12 space-y-12">
                {/* Hero Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-2">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-center gap-2 text-primary font-bold uppercase tracking-[0.2em] text-[10px]"
                        >
                            <CalendarIcon className="h-4 w-4" />
                            Civic Timeline
                        </motion.div>
                        <h1 className="text-4xl md:text-5xl font-black tracking-tighter">Tactical Schedule</h1>
                        <p className="text-slate-500 max-w-xl">
                            Stay synchronized with upcoming legislative deadlines, volunteer opportunities,
                            and community assemblies across the Republic.
                        </p>
                    </div>

                    <div className="flex gap-3">
                        <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-[2rem] flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-white dark:bg-slate-700 flex items-center justify-center shadow-sm">
                                <Bell className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase text-slate-400">Notifications</p>
                                <p className="text-sm font-bold">Alert System Active</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Calendar View */}
                <section>
                    <EventCalendar view="large" isAdmin={isAdmin} />
                </section>

                {/* Help Footnote */}
                <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-[2rem] flex items-start gap-4 border border-blue-100 dark:border-blue-800">
                    <Info className="h-6 w-6 text-blue-500 mt-1" />
                    <div className="space-y-1">
                        <h4 className="font-bold text-blue-900 dark:text-blue-100">Synchronize your life</h4>
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                            You can tap any event to view detailed intelligence and sync it directly to your
                            Google or Apple calendar. Admins can perform inline adjustments directly from the event view.
                        </p>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default CivicCalendar;
