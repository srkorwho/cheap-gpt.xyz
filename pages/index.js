import React, { useState, useRef, useEffect } from 'react';
import { Send, Key, Zap, AlertCircle } from 'lucide-react';

export default function AIChat() {
  const [apiKey, setApiKey] = useState('');
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [model, setModel] = useState('gpt-4o');
  const [isCheapMode, setIsCheapMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLang, setSelectedLang] = useState(null);
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  const [langSearch, setLangSearch] = useState('');
  const [tokenUsage, setTokenUsage] = useState({ prompt: 0, completion: 0, total: 0 });

  const langDropdownRef = useRef(null);
  const messagesEndRef = useRef(null);

  const models = ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-3.5-turbo'];

  const languages = [
    { code: 'en', name: 'English', native: 'English' },
    { code: 'tr', name: 'Turkish', native: 'Türkçe' },
    { code: 'es', name: 'Spanish', native: 'Español' },
    { code: 'fr', name: 'French', native: 'Français' },
    { code: 'de', name: 'German', native: 'Deutsch' },
    { code: 'it', name: 'Italian', native: 'Italiano' },
    { code: 'pt', name: 'Portuguese', native: 'Português' },
    { code: 'ru', name: 'Russian', native: 'Русский' },
    { code: 'ja', name: 'Japanese', native: '日本語' },
    { code: 'ko', name: 'Korean', native: '한국어' },
    { code: 'zh', name: 'Chinese', native: '中文' },
    { code: 'ar', name: 'Arabic', native: 'العربية' },
    { code: 'hi', name: 'Hindi', native: 'हिन्दी' },
    { code: 'bn', name: 'Bengali', native: 'বাংলা' },
    { code: 'nl', name: 'Dutch', native: 'Nederlands' },
    { code: 'pl', name: 'Polish', native: 'Polski' },
    { code: 'sv', name: 'Swedish', native: 'Svenska' },
    { code: 'no', name: 'Norwegian', native: 'Norsk' },
    { code: 'da', name: 'Danish', native: 'Dansk' },
    { code: 'fi', name: 'Finnish', native: 'Suomi' },
  ];

  const filteredLanguages = languages.filter((lang) => {
    const q = langSearch.trim().toLowerCase();
    if (!q) return true;
    return (
      lang.name.toLowerCase().startsWith(q) ||
      lang.native.toLowerCase().startsWith(q) ||
      lang.code.toLowerCase().startsWith(q)
    );
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => scrollToBottom(), [messages, isLoading]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (langDropdownRef.current && !langDropdownRef.current.contains(e.target)) {
        setIsLangDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const translateText = async (text, fromLangCode, toLangCode) => {
    if (!text || fromLangCode === toLangCode) return text;
    try {
      const normalize = (c) => (c === 'zh' ? 'zh-TW' : c);
      const from = normalize(fromLangCode);
      const to = normalize(toLangCode);
      const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(
        text
      )}&langpair=${from}|${to}`;
      const res = await fetch(url);
      const data = await res.json();
      return data.responseData?.translatedText || text;
    } catch (error) {
      console.error('Translation error:', error);
      return text;
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || !apiKey.trim()) {
      alert('Please enter API key and message!');
      return;
    }

    if (isCheapMode && !selectedLang) {
      alert('Please select your language in Cheap Mode before sending messages.');
      return;
    }

    const userMessage = { role: 'user', content: input, original: input, translated: null };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      let messageToSend = input;

      if (isCheapMode) {
        const fromCode = selectedLang.code;
        messageToSend = await translateText(input, fromCode, 'zh-TW');
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = { ...updated[updated.length - 1], translated: messageToSend };
          return updated;
        });
      }
/*
      const payloadMessages = messages.map((m) => {
        if (isCheapMode) {
          return { role: m.role, content: m.translated || m.content };
        } else return { role: m.role, content: m.content };
      });

      payloadMessages.push({ role: 'user', content: messageToSend });
*/

const payloadMessages = [
  { role: 'user', content: messageToSend }
];

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: payloadMessages,
          temperature: 0.7,
        }),
      });

      if (!response.ok) throw new Error(`API Error: ${response.status}`);

      const data = await response.json();

      if (data.usage) {
        setTokenUsage({
          prompt: data.usage.prompt_tokens,
          completion: data.usage.completion_tokens,
          total: data.usage.total_tokens,
        });
      }

      const aiChineseContent = data.choices[0].message.content;
      let aiResponseToShow = aiChineseContent;

      if (isCheapMode) {
        aiResponseToShow = await translateText(aiChineseContent, 'zh-TW', selectedLang.code);
      }

      const aiMessage = { role: 'assistant', content: aiResponseToShow };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error:', error);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: `❌ Error: ${error.message}` },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6 h-screen flex flex-col">
        {/* Header */}
        <div className="mb-6 space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">Cheap-GPT</h1>
            <div className="flex items-center gap-3 bg-white rounded-lg px-4 py-2 border border-gray-200 shadow-sm">
              <span className={`text-sm font-medium ${!isCheapMode ? 'text-gray-900' : 'text-gray-400'}`}>Normal</span>
              <button
                onClick={() => {
                  const newVal = !isCheapMode;
                  setIsCheapMode(newVal);
                  if (newVal) setIsLangDropdownOpen(true);
                  else setIsLangDropdownOpen(false);
                }}
                className={`relative w-14 h-7 rounded-full transition-colors ${isCheapMode ? 'bg-blue-600' : 'bg-gray-300'}`}
              >
                <div className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${isCheapMode ? 'translate-x-7' : ''}`} />
              </button>
              <span className={`text-sm font-medium flex items-center gap-1 ${isCheapMode ? 'text-blue-600' : 'text-gray-400'}`}><Zap size={14} /> Cheap</span>
            </div>
          </div>

          {/* API Key Input */}
          <div className="relative">
            <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your OpenAI API Key..."
              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
            />
          </div>

          {/* Cheap Mode Language Selector */}
          {isCheapMode && (
            <div className="relative mt-2" ref={langDropdownRef}>
              <input
                type="text"
                value={langSearch}
                onChange={(e) => {
                  setLangSearch(e.target.value);
                  setIsLangDropdownOpen(true);
                }}
                onFocus={() => setIsLangDropdownOpen(true)}
                placeholder={selectedLang ? `${selectedLang.name} (${selectedLang.native})` : 'Search language...'}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {isLangDropdownOpen && (
                <ul className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  {filteredLanguages.map((lang) => (
                    <li
                      key={lang.code}
                      className="px-4 py-2 hover:bg-blue-50 cursor-pointer"
                      onClick={() => {
                        setSelectedLang(lang);
                        setLangSearch('');
                        setIsLangDropdownOpen(false);
                      }}
                    >
                      {lang.name} — {lang.native} ({lang.code})
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 bg-white rounded-lg border border-gray-200 p-6 mb-2 overflow-y-auto">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} mb-2`}>
              <div className={`max-w-[80%] px-4 py-3 rounded-lg ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-900'}`}>
                {msg.content}
              </div>
            </div>
          ))}
          {isLoading && <div className="text-gray-400">Typing...</div>}
          <div ref={messagesEndRef} />
        </div>

        {/* Token Usage */}
        <div className="text-sm text-gray-500 mb-2">
          Tokens - Prompt: {tokenUsage.prompt}, Completion: {tokenUsage.completion}, Total: {tokenUsage.total}
        </div>

        {/* Input */}
        <div className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !isLoading && sendMessage()}
            placeholder="Type your message..."
            disabled={isLoading}
            className="flex-1 px-4 py-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={sendMessage}
            disabled={isLoading}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg flex items-center gap-2 hover:bg-blue-700"
          >
            <Send size={18} /> Send
          </button>
        </div>
      </div>
    </div>
  );
}
