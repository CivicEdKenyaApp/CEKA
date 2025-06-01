
import React from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Users, Calendar, ExternalLink, Download, Share2 } from 'lucide-react';

const RejectFinanceBill = () => {
  const keyPoints = [
    "Increased taxation on basic commodities affecting low-income families",
    "Removal of tax exemptions on essential services",
    "Higher corporate tax rates that may discourage investment",
    "Inadequate public participation in the bill's formulation",
    "Potential negative impact on economic growth and job creation"
  ];

  const actionItems = [
    {
      title: "Contact Your MP",
      description: "Reach out to your Member of Parliament to express your concerns about the Finance Bill 2025",
      action: "Find Contact Info"
    },
    {
      title: "Sign the Petition",
      description: "Add your voice to thousands of Kenyans calling for the rejection of this bill",
      action: "Sign Now"
    },
    {
      title: "Attend Public Forums",
      description: "Participate in public forums and hearings to make your voice heard",
      action: "View Schedule"
    },
    {
      title: "Share Information",
      description: "Help spread awareness about the implications of the Finance Bill 2025",
      action: "Share Campaign"
    }
  ];

  const timeline = [
    { date: "January 15, 2025", event: "Finance Bill 2025 introduced in Parliament" },
    { date: "February 1, 2025", event: "Public participation period begins" },
    { date: "February 28, 2025", event: "Public participation period ends" },
    { date: "March 15, 2025", event: "Committee review and recommendations" },
    { date: "April 1, 2025", event: "Second reading in Parliament" }
  ];

  return (
    <Layout>
      <div className="container py-8 md:py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-full mb-4">
            <AlertTriangle className="h-4 w-4" />
            <span className="text-sm font-medium">Urgent Action Required</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            Reject Finance Bill 2025
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Join thousands of Kenyans in opposing the Finance Bill 2025 that threatens to burden citizens with excessive taxation and reduced public services.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-red-600 hover:bg-red-700">
              <Users className="mr-2 h-5 w-5" />
              Join the Movement
            </Button>
            <Button size="lg" variant="outline">
              <Download className="mr-2 h-5 w-5" />
              Download Bill Summary
            </Button>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-red-600 mb-2">45,000+</div>
              <div className="text-muted-foreground">Kenyans Supporting Rejection</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">23%</div>
              <div className="text-muted-foreground">Proposed Tax Increase</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">15</div>
              <div className="text-muted-foreground">Days Left for Action</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* Key Concerns */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                Key Concerns About the Bill
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {keyPoints.map((point, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Badge variant="destructive" className="mt-0.5">
                      {index + 1}
                    </Badge>
                    <span className="text-sm">{point}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-500" />
                Legislative Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {timeline.map((item, index) => (
                  <div key={index} className="flex gap-3">
                    <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div>
                      <div className="text-sm font-medium">{item.date}</div>
                      <div className="text-sm text-muted-foreground">{item.event}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Items */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle>Take Action Now</CardTitle>
            <p className="text-muted-foreground">
              Your voice matters. Here's how you can make a difference in opposing the Finance Bill 2025.
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              {actionItems.map((item, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{item.description}</p>
                  <Button variant="outline" size="sm">
                    {item.action}
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Resources */}
        <Card>
          <CardHeader>
            <CardTitle>Resources & Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <Button variant="outline" className="justify-start">
                <Download className="mr-2 h-4 w-4" />
                Full Bill Text (PDF)
              </Button>
              <Button variant="outline" className="justify-start">
                <Download className="mr-2 h-4 w-4" />
                Impact Analysis Report
              </Button>
              <Button variant="outline" className="justify-start">
                <Share2 className="mr-2 h-4 w-4" />
                Share on Social Media
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default RejectFinanceBill;
