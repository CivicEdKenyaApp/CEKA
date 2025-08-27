
import React from 'react';
import { motion } from 'framer-motion';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, BarChart3, FileText, Users } from 'lucide-react';

const SHAmbles = () => {
  return (
    <Layout>
      <div className="container mx-auto py-8 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          {/* Header Section */}
          <div className="text-center mb-12">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 260, damping: 20 }}
              className="inline-flex items-center justify-center w-20 h-20 bg-red-100 dark:bg-red-900/20 rounded-full mb-6"
            >
              <AlertTriangle className="w-10 h-10 text-red-600 dark:text-red-400" />
            </motion.div>
            
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
              SHAmbles Investigation
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Comprehensive analysis and visualization of critical governance issues requiring public attention and accountability.
            </p>
            
            <Badge variant="outline" className="mt-4 px-4 py-2 text-sm">
              <span className="w-2 h-2 bg-orange-500 rounded-full mr-2 animate-pulse"></span>
              Investigation in Progress
            </Badge>
          </div>

          {/* Placeholder Content Cards */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-blue-600" />
                    Data Analysis
                  </CardTitle>
                  <CardDescription>
                    Interactive visualizations and statistical breakdowns
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="h-4 bg-gradient-to-r from-blue-200 to-blue-100 dark:from-blue-800 dark:to-blue-900 rounded animate-pulse"></div>
                    <div className="h-4 bg-gradient-to-r from-blue-200 to-blue-100 dark:from-blue-800 dark:to-blue-900 rounded animate-pulse"></div>
                    <div className="h-4 bg-gradient-to-r from-blue-200 to-blue-100 dark:from-blue-800 dark:to-blue-900 rounded animate-pulse w-3/4"></div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-4">
                    Comprehensive data visualization tools coming soon...
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-green-600" />
                    Documentation
                  </CardTitle>
                  <CardDescription>
                    Official documents, reports, and evidence compilation
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="h-4 bg-gradient-to-r from-green-200 to-green-100 dark:from-green-800 dark:to-green-900 rounded animate-pulse"></div>
                    <div className="h-4 bg-gradient-to-r from-green-200 to-green-100 dark:from-green-800 dark:to-green-900 rounded animate-pulse w-4/5"></div>
                    <div className="h-4 bg-gradient-to-r from-green-200 to-green-100 dark:from-green-800 dark:to-green-900 rounded animate-pulse"></div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-4">
                    Document repository and analysis framework in development...
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Impact Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <Card className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20 border-orange-200 dark:border-orange-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-800 dark:text-orange-200">
                  <Users className="w-5 h-5" />
                  Public Impact Assessment
                </CardTitle>
                <CardDescription className="text-orange-700 dark:text-orange-300">
                  Understanding the broader implications for Kenyan citizens
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-white/50 dark:bg-black/20 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600 mb-1">TBD</div>
                    <div className="text-sm text-muted-foreground">Affected Citizens</div>
                  </div>
                  <div className="text-center p-4 bg-white/50 dark:bg-black/20 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600 mb-1">TBD</div>
                    <div className="text-sm text-muted-foreground">Financial Impact</div>
                  </div>
                  <div className="text-center p-4 bg-white/50 dark:bg-black/20 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600 mb-1">TBD</div>
                    <div className="text-sm text-muted-foreground">Timeline</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Call to Action */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.0 }}
            className="text-center mt-12 p-8 bg-muted/50 rounded-xl"
          >
            <h3 className="text-xl font-semibold mb-4">Stay Informed</h3>
            <p className="text-muted-foreground mb-6">
              This investigation page is currently under development. We're working to bring you 
              comprehensive analysis and visualization tools to better understand critical governance issues.
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              <Badge variant="secondary">Data Visualization</Badge>
              <Badge variant="secondary">Document Analysis</Badge>
              <Badge variant="secondary">Public Impact</Badge>
              <Badge variant="secondary">Accountability Tracking</Badge>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </Layout>
  );
};

export default SHAmbles;
