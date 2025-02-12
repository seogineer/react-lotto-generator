import React, { useState, useEffect } from 'react';
import { Loader2, ChevronLeft, ChevronRight, BarChart2, List, Dices } from 'lucide-react';
import axios from 'axios';

const LOTTO_API_URL = process.env.REACT_APP_LOTTO_API_URL;

const TabButton = ({ active, children, onClick, className = '' }) => (
  <button
    onClick={onClick}
    className={`px-3 py-2 rounded-lg text-sm sm:text-base sm:px-4 sm:py-2 ${active
      ? 'bg-indigo-600 text-white'
      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      } transition-colors duration-200 flex-1 sm:flex-none ${className}`}
  >
    {children}
  </button>
);

const NumberBall = ({ number, size = 'md' }) => {
  const getNumberColor = (num) => {
    if (num <= 10) return 'bg-yellow-500';
    if (num <= 20) return 'bg-blue-500';
    if (num <= 30) return 'bg-red-500';
    if (num <= 40) return 'bg-gray-500';
    return 'bg-green-500';
  };

  const sizeClasses = {
    sm: 'w-6 h-6 text-xs sm:w-8 sm:h-8 sm:text-sm',
    md: 'w-10 h-10 text-base sm:w-12 sm:h-12 sm:text-lg',
    lg: 'w-12 h-12 text-lg sm:w-16 sm:h-16 sm:text-xl'
  };

  return (
    <div
      className={`${sizeClasses[size]} ${getNumberColor(number)} 
                 rounded-full flex items-center justify-center 
                 text-white font-bold shadow-md`}
    >
      {number}
    </div>
  );
};

const GeneratorSection = () => {
  const [numbers, setNumbers] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationType, setGenerationType] = useState('recommend');

  const generateByRandom = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const newNumbers = new Set();
      while (newNumbers.size < 6) {
        newNumbers.add(Math.floor(Math.random() * 45) + 1);
      }
      setNumbers([...newNumbers].sort((a, b) => a - b));
      setIsGenerating(false);
    }, 800);
  };

  const generateByRecommend = () => {
    setIsGenerating(true);
    axios.get(`${LOTTO_API_URL}/drawings/generate`).then(response => {
      const { one, two, three, four, five, six } = response.data;
      setNumbers([one, two, three, four, five, six]);
      setIsGenerating(false);
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-center gap-2 sm:gap-4">
        <TabButton
          active={generationType === 'recommend'}
          onClick={() => setGenerationType('recommend')}
        >
          <div className="flex items-center gap-1 sm:gap-2">
            <BarChart2 size={16} className="sm:w-5 sm:h-5" />
            <span className="inline sm:inline">추천</span>
          </div>
        </TabButton>
        <TabButton
          active={generationType === 'random'}
          onClick={() => setGenerationType('random')}
        >
          <div className="flex items-center gap-1 sm:gap-2">
            <Dices size={16} className="sm:w-5 sm:h-5" />
            <span className="inline sm:inline">랜덤</span>
          </div>
        </TabButton>
      </div>

      <div className="flex justify-center">
        <button
          onClick={generationType === 'random' ? generateByRandom : generateByRecommend}
          disabled={isGenerating}
          className="w-full sm:w-auto px-4 sm:px-6 py-3 bg-indigo-600 text-white rounded-lg 
                   hover:bg-indigo-700 transition-colors duration-200 
                   disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isGenerating ? (
            <>
              <Loader2 className="animate-spin w-4 h-4 sm:w-5 sm:h-5" />
              생성 중...
            </>
          ) : (
            '번호 생성하기'
          )}
        </button>
      </div>

      <div className="flex justify-center gap-2 sm:gap-4 flex-wrap">
        {numbers.map((number, index) => (
          <NumberBall key={index} number={number} />
        ))}
      </div>
    </div>
  );
};

const WinningNumbersSection = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [winningNumbersData, setWinningNumbersData] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const itemsPerPage = 5;

  const winningNumbers = async (currentPage) => {
    try {
      const response = await axios.get(`${LOTTO_API_URL}/drawings?page=${currentPage - 1}&size=${itemsPerPage}`);
      setTotalPages(response.data.totalPages);
      setWinningNumbersData(response.data.content);
    } catch (error) {
      console.error('데이터 요청 실패:', error);
    }
  };

  useEffect(() => {
    winningNumbers(currentPage);
  }, [currentPage]);

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="grid gap-3 sm:gap-4">
        {winningNumbersData.map(({ round, date, one, two, three, four, five, six, bonus, firstWinners, firstWinPrize }) => (
          <div key={round} className="bg-white p-3 sm:p-4 rounded-lg shadow">
            <div className="flex items-center justify-between mb-2 text-sm sm:text-base">
              <span className="font-bold">{round}회</span>
              <span className="text-gray-600">{date.split('-')[0]}년 {date.split('-')[1]}월 {date.split('-')[2]}일 추첨</span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2.5 mb-4 sm:mb-6">
              <NumberBall key={round + '-1'} number={one} size="sm" />
              <NumberBall key={round + '-2'} number={two} size="sm" />
              <NumberBall key={round + '-3'} number={three} size="sm" />
              <NumberBall key={round + '-4'} number={four} size="sm" />
              <NumberBall key={round + '-5'} number={five} size="sm" />
              <NumberBall key={round + '-6'} number={six} size="sm" />
              <span className="mx-1 sm:mx-2">+</span>
              <NumberBall number={bonus} size="sm" />
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <span className="text-blue-600 font-medium">1등 상금:</span>
                <span>{firstWinPrize.toLocaleString()}원</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-blue-600 font-medium">당첨자 수:</span>
                <span>{firstWinners}명</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-center items-center gap-2 sm:gap-4 text-sm sm:text-base">
        <button
          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
          disabled={currentPage === 1}
          className="p-1 sm:p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50"
        >
          <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
        <span>{currentPage} / {totalPages}</span>
        <button
          onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
          disabled={currentPage === totalPages}
          className="p-1 sm:p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50"
        >
          <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      </div>
    </div>
  );
};

const StatisticsSection = () => {
  const [mostFrequentNumbers, setMostFrequentNumbers] = useState([]);
  const [positionStats, setPositionStats] = useState([]);

  const getMostFrequentNumbers = async () => {
    try {
      const response = await axios.get(`${LOTTO_API_URL}/drawings/frequent`);
      setMostFrequentNumbers(response.data);
    } catch (error) {
      console.error('데이터 요청 실패:', error);
    }
  };

  const getPositionStats = async () => {
    try {
      const response = await axios.get(`${LOTTO_API_URL}/drawings/position/frequent`);

      setPositionStats([
        { position: 1, numbers: response.data.filter(number => number.position === 1).map(number => number.number) },
        { position: 2, numbers: response.data.filter(number => number.position === 2).map(number => number.number) },
        { position: 3, numbers: response.data.filter(number => number.position === 3).map(number => number.number) },
        { position: 4, numbers: response.data.filter(number => number.position === 4).map(number => number.number) },
        { position: 5, numbers: response.data.filter(number => number.position === 5).map(number => number.number) },
        { position: 6, numbers: response.data.filter(number => number.position === 6).map(number => number.number) },
      ]);
    } catch (error) {
      console.error('데이터 요청 실패:', error);
    }
  };

  useEffect(() => {
    getMostFrequentNumbers();
    getPositionStats();
  }, []);

  return (
    <div className="space-y-6 sm:space-y-8">
      <div>
        <h3 className="text-base sm:text-lg font-bold mb-3 sm:mb-4">가장 많이 나온 번호</h3>
        <div className="bg-white p-3 sm:p-4 rounded-lg shadow">
          <div className="grid gap-3 sm:gap-4">
            {mostFrequentNumbers.map(({ number, frequency }, index) => (
              <div key={index} className="flex items-center gap-2 sm:gap-4">
                <NumberBall number={number} size="sm" />
                <div className="flex-1">
                  <div className="h-3 sm:h-4 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-600 transition-all duration-500"
                      style={{ width: `${(frequency / 300) * 100}%` }}
                    />
                  </div>
                </div>
                <span className="text-gray-600 min-w-[3rem] sm:min-w-[4rem] text-sm sm:text-base">
                  {frequency}회
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-base sm:text-lg font-bold mb-3 sm:mb-4">자리별 많이 나온 번호</h3>
        <div className="grid gap-3 sm:gap-4">
          {positionStats.map(({ position, numbers }) => (
            <div key={position} className="bg-white p-3 sm:p-4 rounded-lg shadow">
              <div className="flex items-center gap-2 sm:gap-4">
                <span className="font-bold min-w-[3rem] sm:min-w-[4rem] text-sm sm:text-base">
                  {position}번째
                </span>
                <div className="flex gap-1 sm:gap-2">
                  {numbers.map((num, idx) => (
                    <NumberBall key={idx} number={num} size="sm" />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const LottoApp = () => {
  const [activeTab, setActiveTab] = useState('generator');

  const tabs = [
    { id: 'generator', label: '번호 생성', icon: Dices },
    { id: 'winning-numbers', label: '당첨 번호', icon: List },
    { id: 'statistics', label: '통계', icon: BarChart2 },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6 sm:mb-8">로또 번호 생성기</h1>

        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
          <div className="flex justify-between sm:justify-center gap-2 sm:gap-4 mb-6 sm:mb-8">
            {tabs.map(({ id, label, icon: Icon }) => (
              <TabButton
                key={id}
                active={activeTab === id}
                onClick={() => setActiveTab(id)}
                className="text-sm sm:text-base"
              >
                <div className="flex items-center gap-1 sm:gap-2">
                  <Icon size={16} className="sm:w-5 sm:h-5" />
                  <span className="hidden sm:inline">{label}</span>
                  <span className="sm:hidden">{label.split(' ')[0]}</span>
                </div>
              </TabButton>
            ))}
          </div>

          {activeTab === 'generator' && <GeneratorSection />}
          {activeTab === 'winning-numbers' && <WinningNumbersSection />}
          {activeTab === 'statistics' && <StatisticsSection />}
        </div>
      </div>
    </div>
  );
};

export default LottoApp;