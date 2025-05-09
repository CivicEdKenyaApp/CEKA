
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Award, BookOpen, CheckCircle, ChevronRight, HelpCircle, RotateCcw } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Quiz types aligned with bill objectives
type QuizCategory = 
  | 'Constitutional Implementation' 
  | 'Devolved Government' 
  | 'Electoral Knowledge' 
  | 'Bill of Rights' 
  | 'National Cohesion'
  | 'Patriotism';

interface Question {
  id: number;
  text: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  category: QuizCategory;
}

interface CivicEducationQuizProps {
  category?: QuizCategory;
  onComplete?: (score: number, totalQuestions: number) => void;
}

// Sample questions aligned with bill objectives
const sampleQuestions: Question[] = [
  {
    id: 1,
    text: "When was the current Constitution of Kenya promulgated?",
    options: ["August 27, 2010", "December 12, 2002", "December 12, 1963", "August 27, 2008"],
    correctAnswer: 0,
    explanation: "The Constitution of Kenya was promulgated on August 27, 2010, replacing the previous constitution that had been in place since independence.",
    category: "Constitutional Implementation"
  },
  {
    id: 2,
    text: "How many counties are there in Kenya's devolved system of government?",
    options: ["8", "47", "42", "52"],
    correctAnswer: 1,
    explanation: "Kenya's devolved system of government consists of 47 counties, each with its own county government.",
    category: "Devolved Government"
  },
  {
    id: 3,
    text: "Which of the following is NOT a function of county governments?",
    options: ["Agriculture", "County health services", "Defense and foreign affairs", "Water and sanitation"],
    correctAnswer: 2,
    explanation: "Defense and foreign affairs are functions reserved for the national government. County governments handle local matters like agriculture, health services, and water.",
    category: "Devolved Government"
  },
  {
    id: 4,
    text: "Which institution is responsible for conducting and supervising elections in Kenya?",
    options: ["Supreme Court", "Independent Electoral and Boundaries Commission (IEBC)", "Kenya National Bureau of Statistics", "Ministry of Interior"],
    correctAnswer: 1,
    explanation: "The Independent Electoral and Boundaries Commission (IEBC) is responsible for conducting elections and referenda and maintaining the voters' register.",
    category: "Electoral Knowledge"
  },
  {
    id: 5,
    text: "What is the minimum number of members needed to form a political party in Kenya?",
    options: ["1,000", "500", "100", "5,000"],
    correctAnswer: 0,
    explanation: "According to the Political Parties Act, a political party must have at least 1,000 registered members to be registered in Kenya.",
    category: "Electoral Knowledge"
  },
  {
    id: 6,
    text: "Which of these is guaranteed in the Bill of Rights in Kenya's Constitution?",
    options: ["Right to free primary education only", "Right to healthcare only", "Right to fair labor practices", "Right to own property anywhere in Kenya only"],
    correctAnswer: 2,
    explanation: "The right to fair labor practices is explicitly guaranteed in Article 41 of Kenya's Constitution under the Bill of Rights.",
    category: "Bill of Rights"
  },
  {
    id: 7,
    text: "Which body is mandated to promote national cohesion in Kenya?",
    options: ["National Gender and Equality Commission", "Kenya National Human Rights Commission", "National Cohesion and Integration Commission", "Ethics and Anti-Corruption Commission"],
    correctAnswer: 2,
    explanation: "The National Cohesion and Integration Commission (NCIC) is mandated to promote national unity and advise the government on all matters affecting ethnic relations.",
    category: "National Cohesion"
  },
  {
    id: 8,
    text: "Who was Kenya’s first President?",
    options: ["Jaramogi Oginga Odinga", "Jomo Kenyatta", "Daniel arap Moi", "Mwai Kibaki"],
    correctAnswer: 1,
    explanation: "The first president of the republic of Kenya, post-independence, was Jomo Kenyatta.",
    category: "Electoral Knowledge"
  },
{
    id: 9,
    text: "In which language were the original lyrics of Kenya’s national anthem written?",
    options: ["English", "Giriama", "Swahili", "Mijikenda"],
    correctAnswer: 2,
    explanation: "The Kenya National Anthem was originally written in Swahili, based on a traditional tune sung by Pokomo mothers to their children.",
    category: "Patriotism"
  },
{
    id: 10,
    text: "On what date was the constitutional referendum approving the 2010 Constitution held?",
    options: ["4 August 2010", "27 August 2010", "6 May 2010", "1 April 2010"],
    correctAnswer: 0,
    explanation: "The constitution was presented to the Attorney General of Kenya on 7 April 2010, officially published on 6 May 2010, and was subjected to a referendum on 4 August 2010.",
    category: "Constitutional Implementation"
  },
{
    id: 11,
    text: "In what year was Kenya restored to a multi-party system by repealing Section 2A of the constitution?",
    options: ["1982", "1991", "2005", "2010"],
    correctAnswer: 1,
    explanation: "In December 1991, President Daniel Arap Moi allowed for the restoration of multiparty government by repealing article 2A of the Constitution.",
    category: "Electoral Knowledge"
  },
{
    id: 12,
    text: "On the Kenyan flag, what does the white fimbriation (narrow border) between the stripes symbolize in terms of national cohesion?",
    options: ["The people of Kenya", "The blood shed for freedom", "The land’s fertility", "Peace and unity"],
    correctAnswer: 3,
    explanation: "The colours symbolize the Kenyan people, blood shed for independence and the vast natural wealth. On independence the white fimbriations were added, symbolizing peace.",
    category: "Patriotism"
  },
];

const CivicEducationQuiz: React.FC<CivicEducationQuizProps> = ({ category, onComplete }) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  
  useEffect(() => {
    // Filter questions by category if provided, otherwise use all questions
    let filteredQuestions = category 
      ? sampleQuestions.filter(q => q.category === category)
      : sampleQuestions;
      
    // Shuffle questions
    filteredQuestions = [...filteredQuestions].sort(() => Math.random() - 0.5);
    
    // Take only first 5 questions if there are more
    const selectedQuestions = filteredQuestions.slice(0, 5);
    
    setQuestions(selectedQuestions);
  }, [category]);
  
  const currentQuestion = questions[currentQuestionIndex];
  
  const handleOptionSelect = (optionIndex: number) => {
    if (isAnswered) return;
    
    setSelectedOption(optionIndex);
    setIsAnswered(true);
    
    if (optionIndex === currentQuestion?.correctAnswer) {
      setScore(score + 1);
    }
    
    setShowExplanation(true);
  };
  
  const handleNextQuestion = () => {
    setSelectedOption(null);
    setIsAnswered(false);
    setShowExplanation(false);
    
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setQuizCompleted(true);
      if (onComplete) {
        onComplete(score, questions.length);
      }
    }
  };
  
  const restartQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setQuizCompleted(false);
    setShowExplanation(false);
  };
  
  if (questions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Civic Knowledge Quiz</CardTitle>
          <CardDescription>Loading questions...</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <div className="animate-spin h-8 w-8 border-4 border-kenya-green/60 border-t-kenya-green rounded-full"></div>
        </CardContent>
      </Card>
    );
  }
  
  const getScoreCategory = (score: number, total: number) => {
    const percentage = (score / total) * 100;
    if (percentage >= 80) return "Expert";
    if (percentage >= 60) return "Proficient";
    if (percentage >= 40) return "Developing";
    return "Beginning";
  };
  
  const getScoreMessage = (score: number, total: number) => {
    const percentage = (score / total) * 100;
    if (percentage >= 80) return "Excellent! You have a strong understanding of civic concepts.";
    if (percentage >= 60) return "Good job! You understand many key civic concepts.";
    if (percentage >= 40) return "You're on your way to understanding civic concepts.";
    return "Keep learning about civic concepts to improve your understanding.";
  };
  
  const getRecommendations = (score: number, total: number) => {
    const percentage = (score / total) * 100;
    if (percentage >= 80) {
      return [
        "Explore advanced constitutional analysis resources",
        "Consider joining civic education outreach programs"
      ];
    }
    if (percentage >= 60) {
      return [
        "Review county governance structures",
        "Learn more about electoral processes"
      ];
    }
    if (percentage >= 40) {
      return [
        "Focus on understanding the Bill of Rights",
        "Study the basics of Kenya's devolved government"
      ];
    }
    return [
      "Start with the Constitution basics resources",
      "Explore our 'What is Civic Education?' guide",
      "Watch our introductory videos on governance"
    ];
  };
  
  if (quizCompleted) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Quiz Complete!</CardTitle>
          <CardDescription>
            You scored {score} out of {questions.length} questions correctly
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-center py-4">
            <div className="text-center">
              <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <Award className="h-12 w-12 text-kenya-green" />
              </div>
              <h3 className="text-2xl font-bold">{getScoreCategory(score, questions.length)} Level</h3>
              <p className="text-muted-foreground mt-1">{getScoreMessage(score, questions.length)}</p>
            </div>
          </div>
          
          <Progress value={(score / questions.length) * 100} className="h-2 w-full" />
          
          <div className="mt-6">
            <h4 className="font-medium mb-2">Recommended Resources for You:</h4>
            <ul className="space-y-2">
              {getRecommendations(score, questions.length).map((recommendation, index) => (
                <li key={index} className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-kenya-green mr-2 mt-0.5 shrink-0" />
                  <span>{recommendation}</span>
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={restartQuiz} className="w-full">
            <RotateCcw className="mr-2 h-4 w-4" />
            Restart Quiz
          </Button>
        </CardFooter>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Civic Knowledge Quiz</CardTitle>
            <CardDescription>
              Test your understanding of Kenya's civic concepts
            </CardDescription>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium">
              Question {currentQuestionIndex + 1}/{questions.length}
            </p>
            <p className="text-xs text-muted-foreground">{currentQuestion?.category}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Progress value={((currentQuestionIndex) / questions.length) * 100} className="h-2 w-full" />
        
        <div className="py-4">
          <h3 className="text-lg font-medium mb-4 flex items-start">
            <HelpCircle className="h-5 w-5 mr-2 mt-0.5 shrink-0 text-kenya-green" />
            {currentQuestion?.text}
          </h3>
          
          <div className="space-y-2 mt-6">
            {currentQuestion?.options.map((option, index) => (
              <Button
                key={index}
                variant={
                  selectedOption === index 
                    ? index === currentQuestion.correctAnswer 
                      ? "default" 
                      : "destructive"
                    : selectedOption !== null && index === currentQuestion.correctAnswer
                      ? "default"
                      : "outline"
                }
                className={`w-full justify-start text-left p-4 h-auto ${
                  selectedOption === index 
                    ? index === currentQuestion.correctAnswer 
                      ? "bg-green-500 hover:bg-green-600" 
                      : "bg-red-500 hover:bg-red-600"
                    : selectedOption !== null && index === currentQuestion.correctAnswer
                      ? "bg-green-500 hover:bg-green-600"
                      : ""
                }`}
                onClick={() => handleOptionSelect(index)}
                disabled={isAnswered}
              >
                <span className="font-medium mr-2">{String.fromCharCode(65 + index)}.</span>
                {option}
              </Button>
            ))}
          </div>
        </div>
        
        {showExplanation && (
          <Alert className={selectedOption === currentQuestion?.correctAnswer ? "bg-green-50" : "bg-amber-50"}>
            <BookOpen className={`h-5 w-5 ${selectedOption === currentQuestion?.correctAnswer ? "text-green-600" : "text-amber-600"}`} />
            <AlertTitle>Explanation</AlertTitle>
            <AlertDescription>
              {currentQuestion?.explanation}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleNextQuestion} 
          disabled={!isAnswered} 
          className="w-full"
        >
          {currentQuestionIndex < questions.length - 1 ? (
            <>
              Next Question
              <ChevronRight className="ml-2 h-4 w-4" />
            </>
          ) : (
            "See Results"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CivicEducationQuiz;
