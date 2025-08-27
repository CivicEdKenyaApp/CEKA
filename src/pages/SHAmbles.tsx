
import React from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, BarChart3, FileText, Eye, Users, TrendingUp } from 'lucide-react';

const SHAmbles = () => {
  return (
    <Layout>
      <div className="container py-8">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <AlertTriangle className="h-8 w-8 text-destructive mr-3" />
            <h1 className="text-4xl font-bold text-foreground">SHAmbles</h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Exposing Systemic Issues Through Data Visualization and Analysis
          </p>
          <Badge variant="outline" className="mt-4">
            Coming Soon - Under Development
          </Badge>
        </div>

        {/* Placeholder Content Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <Card className="border-2 border-dashed border-muted-foreground/30">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <BarChart3 className="h-6 w-6 text-primary" />
                <CardTitle>Data Analytics</CardTitle>
              </div>
              <CardDescription>
                Interactive charts and graphs revealing patterns in governance data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-32 bg-muted/50 rounded-md flex items-center justify-center">
                <span className="text-sm text-muted-foreground">Visualization Placeholder</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-dashed border-muted-foreground/30">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <FileText className="h-6 w-6 text-primary" />
                <CardTitle>Document Analysis</CardTitle>
              </div>
              <CardDescription>
                Comprehensive analysis of public documents and policy papers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-32 bg-muted/50 rounded-md flex items-center justify-center">
                <span className="text-sm text-muted-foreground">Document Scanner Placeholder</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-dashed border-muted-foreground/30">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Eye className="h-6 w-6 text-primary" />
                <CardTitle>Transparency Index</CardTitle>
              </div>
              <CardDescription>
                Real-time monitoring of government transparency metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-32 bg-muted/50 rounded-md flex items-center justify-center">
                <span className="text-sm text-muted-foreground">Transparency Meter Placeholder</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-dashed border-muted-foreground/30">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Users className="h-6 w-6 text-primary" />
                <CardTitle>Public Sentiment</CardTitle>
              </div>
              <CardDescription>
                Analysis of public opinion and citizen feedback on key issues
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-32 bg-muted/50 rounded-md flex items-center justify-center">
                <span className="text-sm text-muted-foreground">Sentiment Analysis Placeholder</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-dashed border-muted-foreground/30">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-6 w-6 text-primary" />
                <CardTitle>Trend Analysis</CardTitle>
              </div>
              <CardDescription>
                Historical trends and predictive modeling for governance patterns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-32 bg-muted/50 rounded-md flex items-center justify-center">
                <span className="text-sm text-muted-foreground">Trend Chart Placeholder</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-dashed border-muted-foreground/30 md:col-span-2 lg:col-span-1">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-6 w-6 text-destructive" />
                <CardTitle>Critical Issues</CardTitle>
              </div>
              <CardDescription>
                Highlighted systemic problems requiring immediate attention
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-32 bg-muted/50 rounded-md flex items-center justify-center">
                <span className="text-sm text-muted-foreground">Alert System Placeholder</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Development Notice */}
        <Card className="bg-muted/30 border-primary/20">
          <CardHeader>
            <CardTitle className="text-center">Development in Progress</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              This powerful tool for exposing systemic governance issues is currently under development. 
              It will feature comprehensive data visualization, document analysis, and transparency monitoring capabilities.
            </p>
            <div className="flex justify-center space-x-4">
              <Button variant="outline" disabled>
                Preview Demo
              </Button>
              <Button variant="outline" disabled>
                Request Early Access
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              Expected Launch: Coming Soon | For updates, join our community
            </p>
          </CardContent>
        </Card>

        {/* Methodology Preview */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6 text-center">Our Methodology</h2>
          <div className="grid md:grid-cols-4 gap-4 text-center">
            <div className="p-4">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-xl font-bold text-primary">1</span>
              </div>
              <h3 className="font-semibold mb-2">Data Collection</h3>
              <p className="text-sm text-muted-foreground">Systematic gathering of public documents and datasets</p>
            </div>
            <div className="p-4">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-xl font-bold text-primary">2</span>
              </div>
              <h3 className="font-semibold mb-2">Analysis</h3>
              <p className="text-sm text-muted-foreground">Advanced analytics to identify patterns and anomalies</p>
            </div>
            <div className="p-4">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-xl font-bold text-primary">3</span>
              </div>
              <h3 className="font-semibold mb-2">Visualization</h3>
              <p className="text-sm text-muted-foreground">Clear, interactive presentations of findings</p>
            </div>
            <div className="p-4">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-xl font-bold text-primary">4</span>
              </div>
              <h3 className="font-semibold mb-2">Action</h3>
              <p className="text-sm text-muted-foreground">Empowering citizens with actionable insights</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SHAmbles;
