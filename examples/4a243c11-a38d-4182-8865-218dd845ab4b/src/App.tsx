import React, { useState, useEffect } from 'react';
import { Volume2, Play, Pause, Settings, Volume1, Volume, VolumeX, History, Trash2, Clock, RefreshCw } from 'lucide-react';

interface Voice {
  name: string;
  lang: string;
  voiceURI: string;
}

interface HistoryItem {
  id: string;
  text: string;
  timestamp: number;
}

function App() {
  const [text, setText] = useState('');
  const [voices, setVoices] = useState<Voice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string>('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [speechRate, setSpeechRate] = useState(1);
  const [volume, setVolume] = useState(1);
  const [pitch, setPitch] = useState(1);
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    const saved = localStorage.getItem('tts-history');
    return saved ? JSON.parse(saved) : [];
  });
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);
      if (availableVoices.length > 0) {
        setSelectedVoice(availableVoices[0].voiceURI);
      }
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

  useEffect(() => {
    localStorage.setItem('tts-history', JSON.stringify(history));
  }, [history]);

  const speak = (textToSpeak = text) => {
    if (textToSpeak.trim() === '') return;

    // Stop any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    const voice = voices.find(v => v.voiceURI === selectedVoice);
    if (voice) {
      utterance.voice = voice as SpeechSynthesisVoice;
    }
    utterance.rate = speechRate;
    utterance.volume = volume;
    utterance.pitch = pitch;

    utterance.onstart = () => {
      setIsPlaying(true);
      setIsPaused(false);
      // Add to history if it's a new entry
      if (textToSpeak === text) {
        const newHistoryItem = {
          id: Date.now().toString(),
          text: textToSpeak,
          timestamp: Date.now(),
        };
        setHistory(prev => [newHistoryItem, ...prev].slice(0, 10)); // Keep only last 10 items
      }
    };
    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };
    utterance.onerror = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  const pauseSpeaking = () => {
    window.speechSynthesis.pause();
    setIsPaused(true);
  };

  const resumeSpeaking = () => {
    window.speechSynthesis.resume();
    setIsPaused(false);
  };

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
  };

  const clearHistory = () => {
    setHistory([]);
  };

  const VolumeIcon = () => {
    if (volume === 0) return <VolumeX />;
    if (volume < 0.3) return <Volume />;
    if (volume < 0.7) return <Volume1 />;
    return <Volume2 />;
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Volume2 className="w-8 h-8 text-purple-600" />
              <h1 className="text-2xl font-bold text-gray-800">语音模拟器</h1>
            </div>
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <History className="w-5 h-5" />
              {showHistory ? '隐藏历史' : '显示历史'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    输入要读的内容
                  </label>
                  <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    className="w-full h-32 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="请输入文字内容..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      选择音色
                    </label>
                    <select
                      value={selectedVoice}
                      onChange={(e) => setSelectedVoice(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      {voices.map((voice) => (
                        <option key={voice.voiceURI} value={voice.voiceURI}>
                          {voice.name} ({voice.lang})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      语速调节
                    </label>
                    <div className="flex items-center gap-4">
                      <input
                        type="range"
                        min="0.5"
                        max="2"
                        step="0.1"
                        value={speechRate}
                        onChange={(e) => setSpeechRate(Number(e.target.value))}
                        className="flex-1"
                      />
                      <span className="text-sm text-gray-600 w-12">
                        {speechRate}x
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      音量调节
                    </label>
                    <div className="flex items-center gap-4">
                      <VolumeIcon />
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={volume}
                        onChange={(e) => setVolume(Number(e.target.value))}
                        className="flex-1"
                      />
                      <span className="text-sm text-gray-600 w-12">
                        {Math.round(volume * 100)}%
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      音调调节
                    </label>
                    <div className="flex items-center gap-4">
                      <input
                        type="range"
                        min="0.5"
                        max="2"
                        step="0.1"
                        value={pitch}
                        onChange={(e) => setPitch(Number(e.target.value))}
                        className="flex-1"
                      />
                      <span className="text-sm text-gray-600 w-12">
                        {pitch}x
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-center gap-4">
                  {isPlaying ? (
                    <>
                      <button
                        onClick={isPaused ? resumeSpeaking : pauseSpeaking}
                        className="flex items-center gap-2 px-6 py-3 rounded-lg text-white font-medium bg-yellow-500 hover:bg-yellow-600 transition-colors"
                      >
                        {isPaused ? (
                          <>
                            <Play className="w-5 h-5" />
                            继续播放
                          </>
                        ) : (
                          <>
                            <Pause className="w-5 h-5" />
                            暂停播放
                          </>
                        )}
                      </button>
                      <button
                        onClick={stopSpeaking}
                        className="flex items-center gap-2 px-6 py-3 rounded-lg text-white font-medium bg-red-500 hover:bg-red-600 transition-colors"
                      >
                        <RefreshCw className="w-5 h-5" />
                        停止播放
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => speak()}
                      className="flex items-center gap-2 px-6 py-3 rounded-lg text-white font-medium bg-purple-600 hover:bg-purple-700 transition-colors"
                    >
                      <Play className="w-5 h-5" />
                      开始播放
                    </button>
                  )}
                </div>
              </div>
            </div>

            {showHistory && (
              <div className="md:col-span-1 border-l pl-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-800">历史记录</h2>
                  <button
                    onClick={clearHistory}
                    className="text-red-500 hover:text-red-600"
                    title="清空历史"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
                {history.length === 0 ? (
                  <p className="text-gray-500 text-center">暂无历史记录</p>
                ) : (
                  <div className="space-y-4">
                    {history.map((item) => (
                      <div
                        key={item.id}
                        className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer"
                        onClick={() => speak(item.text)}
                      >
                        <p className="text-sm text-gray-800 line-clamp-2">{item.text}</p>
                        <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                          <Clock className="w-4 h-4" />
                          {formatTime(item.timestamp)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 text-center text-sm text-gray-600">
          <p>提示：不同浏览器支持的语音库可能有所不同</p>
        </div>
      </div>
    </div>
  );
}

export default App;