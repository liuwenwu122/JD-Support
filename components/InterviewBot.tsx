
import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage, InterviewFeedback, Language } from '../types';
import { createInterviewSession, generateInterviewFeedback } from '../services/geminiService';
import { Mic, Send, Bot, User, StopCircle, RefreshCcw, CheckCircle, AlertTriangle } from 'lucide-react';
import { Chat } from '@google/genai';

interface InterviewBotProps {
  targetRole: string;
  language: Language;
  jobDescription?: string;
}

const InterviewBot: React.FC<InterviewBotProps> = ({ targetRole, language, jobDescription }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [session, setSession] = useState<Chat | null>(null);
  const [hasStarted, setHasStarted] = useState(false);
  const [feedback, setFeedback] = useState<InterviewFeedback | null>(null);
  const [isGeneratingFeedback, setIsGeneratingFeedback] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Reset when role/language changes
  useEffect(() => {
    setHasStarted(false);
    setMessages([]);
    setFeedback(null);
  }, [targetRole, language, jobDescription]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const startInterview = async () => {
    // Rely on the jobDescription prop passed from parent
    const chatSession = createInterviewSession(targetRole, language, jobDescription);
    setSession(chatSession);
    setHasStarted(true);
    setIsTyping(true);
    setFeedback(null);
    setMessages([]);
    
    try {
      const result = await chatSession.sendMessage({ message: "Start the interview." });
      const text = result.text;
      
      setMessages([
        {
          id: Date.now().toString(),
          role: 'model',
          text: text || "Hello, I'm ready to interview you.",
          timestamp: Date.now()
        }
      ]);
    } catch (error) {
      console.error("Error starting chat:", error);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'model',
        text: "Error connecting. Please check API key.",
        timestamp: Date.now()
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || !session) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const result = await session.sendMessage({ message: userMsg.text });
      const text = result.text;

      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: text || "I didn't catch that.",
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
       console.error("Error sending message:", error);
    } finally {
      setIsTyping(false);
    }
  };

  const endInterview = async () => {
    if (messages.length < 2) {
        setHasStarted(false);
        return;
    }
    setIsGeneratingFeedback(true);
    try {
        const result = await generateInterviewFeedback(messages, language);
        setFeedback(result);
    } catch (e) {
        console.error(e);
    } finally {
        setIsGeneratingFeedback(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (feedback) {
      return (
        <div className="flex flex-col h-full bg-white rounded-lg shadow-lg p-8 overflow-y-auto">
            <div className="text-center mb-8">
                <div className="inline-block p-4 rounded-full bg-purple-100 mb-4">
                    <AwardIcon score={feedback.score} />
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Interview Performance</h2>
                <div className="text-5xl font-bold text-purple-600 my-4">{feedback.score}<span className="text-2xl text-gray-400">/100</span></div>
                <p className="text-gray-600 italic">"{feedback.summary}"</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-green-50 p-6 rounded-xl">
                    <h3 className="font-bold text-green-800 mb-4 flex items-center gap-2"><CheckCircle size={20}/> Strengths</h3>
                    <ul className="space-y-2">
                        {feedback.strengths?.map((s, i) => (
                            <li key={i} className="text-green-700 text-sm">• {s}</li>
                        ))}
                    </ul>
                </div>
                <div className="bg-orange-50 p-6 rounded-xl">
                    <h3 className="font-bold text-orange-800 mb-4 flex items-center gap-2"><AlertTriangle size={20}/> Improvements</h3>
                    <ul className="space-y-2">
                        {feedback.areasForImprovement?.map((s, i) => (
                            <li key={i} className="text-orange-700 text-sm">• {s}</li>
                        ))}
                    </ul>
                </div>
            </div>
            
            <button onClick={() => { setHasStarted(false); setFeedback(null); }} className="mt-8 mx-auto bg-gray-800 text-white px-6 py-3 rounded-full hover:bg-gray-900 transition-colors flex items-center gap-2">
                <RefreshCcw size={18} /> Start New Interview
            </button>
        </div>
      );
  }

  if (isGeneratingFeedback) {
      return (
        <div className="flex flex-col items-center justify-center h-full bg-white rounded-lg">
             <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-purple-600 mb-4"></div>
             <p className="text-gray-600">Generating feedback report...</p>
        </div>
      );
  }

  if (!hasStarted) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
        <div className="bg-indigo-50 p-6 rounded-full mb-6">
          <Bot size={64} className="text-indigo-600" />
        </div>
        <h2 className="text-3xl font-bold text-slate-800 mb-4">{language === 'zh' ? '模拟面试' : 'Mock Interview'}</h2>
        <p className="text-slate-600 max-w-lg mb-4 text-lg">
          {language === 'zh' 
           ? `我是你的 AI 面试官。我将模拟 ${targetRole} 的面试流程。`
           : `I am your AI interviewer. I will simulate a structured interview for the ${targetRole} position.`}
        </p>
        <div className="bg-gray-50 px-4 py-2 rounded-lg mb-8 text-sm text-gray-500 border border-gray-200">
            Target: <strong>{targetRole}</strong> | Lang: <strong>{language.toUpperCase()}</strong>
        </div>
        <button
          onClick={startInterview}
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-lg font-semibold py-4 px-10 rounded-full transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center gap-3"
        >
          <Mic size={24} />
          {language === 'zh' ? '开始面试' : 'Start Interview'}
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[800px] bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-slate-900 p-4 text-white flex justify-between items-center shadow-md z-10">
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center border-2 border-white">
                <Bot size={24} className="text-white" />
            </div>
            <div>
                <h3 className="font-bold">Interviewer (AI)</h3>
                <p className="text-xs text-slate-400">{targetRole}</p>
            </div>
        </div>
        <button onClick={endInterview} className="bg-red-500/20 hover:bg-red-500/40 text-red-200 px-3 py-1 rounded-full text-xs flex items-center gap-1 transition-colors border border-red-500/50">
            <StopCircle size={14} /> End & Report
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 bg-slate-50 space-y-6">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex max-w-[80%] gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${
                msg.role === 'user' ? 'bg-blue-600' : 'bg-green-600'
              } text-white shadow-sm`}>
                {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
              </div>
              
              <div
                className={`p-4 rounded-2xl shadow-sm text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white rounded-tr-none'
                    : 'bg-white text-gray-800 border border-gray-200 rounded-tl-none'
                }`}
              >
                {msg.text}
              </div>
            </div>
          </div>
        ))}
        
        {isTyping && (
           <div className="flex w-full justify-start animate-pulse">
            <div className="flex max-w-[80%] gap-3 flex-row">
              <div className="w-8 h-8 rounded-full bg-green-600 flex-shrink-0 flex items-center justify-center text-white">
                <Bot size={16} />
              </div>
              <div className="bg-white border border-gray-200 p-4 rounded-2xl rounded-tl-none flex items-center gap-1">
                 <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                 <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.15s'}}></span>
                 <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.3s'}}></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-gray-200">
        <div className="relative flex items-center">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Type your answer..."
            className="w-full bg-gray-100 text-gray-800 rounded-full pl-6 pr-14 py-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all resize-none shadow-inner"
            rows={1}
            style={{ minHeight: '56px' }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className={`absolute right-2 p-2 rounded-full transition-colors ${
              input.trim() ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-gray-200 text-gray-400'
            }`}
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

const AwardIcon = ({score}: {score: number}) => {
    if(score >= 90) return <span className="text-4xl">🏆</span>
    if(score >= 80) return <span className="text-4xl">🥇</span>
    if(score >= 70) return <span className="text-4xl">🥈</span>
    return <span className="text-4xl">📚</span>
}

export default InterviewBot;
