
import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, MessageSquare, Download, ExternalLink, BookOpen } from 'lucide-react';

const ConstitutionPage = () => {
  return (
    <Layout>
      <div className="container py-8 md:py-12">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Understanding Kenya's Constitution</h1>
            <p className="text-lg text-muted-foreground">
              A citizen's guide to Kenya's Constitution with a focus on civic education and participation
            </p>
          </div>

          <div className="bg-muted p-6 rounded-lg mb-10 flex items-center gap-4">
            <div className="bg-white p-4 rounded-md shadow-sm">
              <FileText className="h-12 w-12 text-kenya-green" />
            </div>
            <div>
              <h2 className="text-xl font-semibold mb-2">Constitution of Kenya, 2010</h2>
              <p className="text-muted-foreground mb-4">
                The full text of Kenya's Constitution, promulgated on August 27, 2010
              </p>
              <div className="flex gap-3">
                <Button asChild>
                  <a href="#" target="_blank" rel="noopener noreferrer">
                    <Download className="mr-2 h-4 w-4" />
                    Download PDF
                  </a>
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/resources/1">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    View Details
                  </Link>
                </Button>
              </div>
            </div>
          </div>

          <Tabs defaultValue="overview" className="mb-10">
            <TabsList className="mb-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="civic-education">Civic Education</TabsTrigger>
              <TabsTrigger value="framework">NCEF</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-6">
              <Card>
                <CardContent className="pt-6">
                  <h3 className="text-xl font-medium mb-4">What is the Constitution?</h3>
                  <p className="mb-4">
                    Kenya's Constitution is the supreme law of the Republic of Kenya. It was promulgated on August 27, 2010, 
                    replacing the previous constitution dating back to independence. The Constitution establishes the structure of 
                    the Kenyan government and defines the relationship between the government and the citizens of Kenya.
                  </p>
                  <p>
                    As the foundation of Kenya's legal system, the Constitution outlines the fundamental rights and freedoms of all 
                    Kenyans, establishes the three branches of government (Executive, Legislative, and Judicial), and introduces 
                    a devolved system of governance with 47 counties.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <h3 className="text-xl font-medium mb-4">Key Features of Kenya's Constitution</h3>
                  <ul className="space-y-3 list-disc pl-5">
                    <li>
                      <strong>Bill of Rights:</strong> A comprehensive set of civil, political, economic, social, and cultural rights 
                      guaranteed to all Kenyans.
                    </li>
                    <li>
                      <strong>Devolution:</strong> A system of governance that transfers power, resources, and representation from 
                      the national government to 47 county governments.
                    </li>
                    <li>
                      <strong>Separation of Powers:</strong> Clear division of powers between the Executive, Legislature, and Judiciary.
                    </li>
                    <li>
                      <strong>Public Participation:</strong> Requirements for citizen involvement in governance and decision-making processes.
                    </li>
                    <li>
                      <strong>Independent Commissions:</strong> Establishment of independent bodies to protect democracy and enforce 
                      constitutional provisions.
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="civic-education" className="space-y-6">
              <Card>
                <CardContent className="pt-6">
                  <h3 className="text-xl font-medium mb-4">Civic Education in the Constitution</h3>
                  <p className="mb-4">
                    Article 33 of the Constitution of Kenya recognizes the right to freedom of expression, which includes the right 
                    to seek, receive, or impart information. This forms the foundation for civic education in Kenya.
                  </p>
                  <p className="mb-4">
                    Article 35 further guarantees every citizen the right of access to information held by the State and information 
                    held by another person required for the exercise or protection of any right or fundamental freedom.
                  </p>
                  <p>
                    The Fourth Schedule of the Constitution, which distributes functions between the National and County governments, 
                    places the responsibility for education policy, standards, curricula, and examinations with the National government. 
                    County governments are responsible for pre-primary education, village polytechnics, and childcare facilities.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <h3 className="text-xl font-medium mb-4">Public Participation as a Constitutional Principle</h3>
                  <p className="mb-4">
                    Article 10(2) of the Constitution establishes public participation as one of the national values and principles 
                    of governance. This principle binds all State organs, State officers, public officers, and all persons whenever 
                    they apply or interpret the Constitution, enact, apply or interpret any law, or make or implement public policy decisions.
                  </p>
                  <p>
                    Various other articles, including Articles 118, 174, and 196, emphasize the importance of public participation in 
                    legislative processes, devolved governance, and county assembly procedures. This constitutional emphasis on public 
                    participation necessitates effective civic education to ensure citizens are equipped to meaningfully participate 
                    in governance.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="framework" className="space-y-6">
              <Card>
                <CardContent className="pt-6">
                  <h3 className="text-xl font-medium mb-4">National Civic Education Framework (NCEF)</h3>
                  <p className="mb-4">
                    The National Civic Education Framework is a comprehensive document that outlines how civic education should be 
                    implemented at both the County and National levels in Kenya. It was developed to ensure a structured and 
                    standardized approach to civic education across the country.
                  </p>
                  <div className="flex mb-4">
                    <Button variant="outline" asChild className="mr-3">
                      <Link to="/resources/9">
                        <BookOpen className="mr-2 h-4 w-4" />
                        View NCEF Document
                      </Link>
                    </Button>
                    <Button variant="outline">
                      <Download className="mr-2 h-4 w-4" />
                      Download NCEF
                    </Button>
                  </div>
                  <h4 className="font-medium mb-2">Key Components of the NCEF:</h4>
                  <ul className="space-y-2 list-disc pl-5 mb-4">
                    <li>Guidelines for developing civic education programs and materials</li>
                    <li>Standards for civic education providers and facilitators</li>
                    <li>Mechanisms for coordination between National and County governments</li>
                    <li>Monitoring and evaluation frameworks for civic education initiatives</li>
                    <li>Strategies for ensuring inclusivity and accessibility in civic education</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <h3 className="text-xl font-medium mb-4">Implementation at County and National Levels</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="border p-4 rounded-md">
                      <h4 className="font-medium mb-2">National Level</h4>
                      <ul className="space-y-1 list-disc pl-5">
                        <li>Development of policy and legislative frameworks</li>
                        <li>Coordination of nationwide civic education programs</li>
                        <li>Setting standards and quality assurance</li>
                        <li>Resource mobilization and allocation</li>
                        <li>Research, monitoring, and evaluation</li>
                      </ul>
                    </div>
                    <div className="border p-4 rounded-md">
                      <h4 className="font-medium mb-2">County Level</h4>
                      <ul className="space-y-1 list-disc pl-5">
                        <li>Implementation of civic education programs</li>
                        <li>Localization of content to reflect county contexts</li>
                        <li>Community mobilization and engagement</li>
                        <li>Coordination with grassroots organizations</li>
                        <li>Feedback collection and reporting</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="bg-kenya-green/10 p-6 rounded-lg mb-8">
            <h3 className="text-xl font-semibold mb-4">Join the Discussion</h3>
            <p className="mb-6">
              Have questions about Kenya's Constitution or want to share your insights on civic education? 
              Join the conversation in our community discussion forum.
            </p>
            <Button asChild>
              <Link to="/community">
                <MessageSquare className="mr-2 h-4 w-4" />
                Go to Discussions
              </Link>
            </Button>
          </div>

          <div className="border-t pt-8">
            <h3 className="text-xl font-semibold mb-4">Related Resources</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <h4 className="font-medium mb-2">Guide to Devolved Government</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Comprehensive document explaining Kenya's devolved system of government.
                  </p>
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/resources/10">View Resource</Link>
                  </Button>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <h4 className="font-medium mb-2">Civil Society Engagement Handbook</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    A handbook for civil society organizations on effective engagement with government.
                  </p>
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/resources/11">View Resource</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ConstitutionPage;
