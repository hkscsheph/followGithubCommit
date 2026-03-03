import { useState } from 'react';
import { RefreshCw, Copy, Sparkles } from 'lucide-react';

function App() {
  const [generatedText, setGeneratedText] = useState('');
  const [copied, setCopied] = useState(false);

  const subjects = [
    '核心競爭力', '企業文化', '戰略佈局', '創新思維', '市場定位',
    '商業模式', '組織架構', '團隊協作', '品牌價值', '客戶體驗',
    '數位轉型', '永續發展', '敏捷開發', '價值創造', '生態系統'
  ];

  const actions = [
    '賦能', '賦予', '驅動', '引領', '推動', '促進', '加速', '優化',
    '提升', '深化', '強化', '打造', '構建', '塑造', '整合'
  ];

  const modifiers = [
    '全方位', '多層次', '立體化', '系統性', '戰略性', '創新性',
    '協同性', '可持續', '高效率', '差異化', '精準化', '智能化'
  ];

  const objects = [
    '增長引擎', '競爭優勢', '價值鏈條', '協同效應', '發展動能',
    '核心能力', '創新機制', '服務體系', '運營模式', '管理體系',
    '產業升級', '資源整合', '品質提升', '效能優化', '生態圈層'
  ];

  const conclusions = [
    '實現高質量發展', '達成戰略目標', '提升核心競爭力', '創造長期價值',
    '打造行業標桿', '引領市場趨勢', '推動產業升級', '贏得市場先機',
    '構建競爭壁壘', '實現跨越式發展', '開創嶄新局面', '邁向新的高度'
  ];

  const generateBullshit = () => {
    const parts = [
      subjects[Math.floor(Math.random() * subjects.length)],
      actions[Math.floor(Math.random() * actions.length)],
      modifiers[Math.floor(Math.random() * modifiers.length)],
      objects[Math.floor(Math.random() * objects.length)],
      conclusions[Math.floor(Math.random() * conclusions.length)]
    ];

    const templates = [
      `${parts[0]}的本質是${parts[1]}${parts[2]}的${parts[3]}，從而${parts[4]}。`,
      `通過${parts[1]}${parts[2]}的${parts[3]}，我們的${parts[0]}能夠${parts[4]}。`,
      `在當前形勢下，${parts[0]}必須${parts[1]}${parts[2]}的${parts[3]}，以${parts[4]}。`,
      `${parts[2]}的${parts[0]}是${parts[1]}${parts[3]}的關鍵，這將幫助我們${parts[4]}。`,
      `只有${parts[1]}${parts[2]}的${parts[3]}，才能真正提升${parts[0]}，最終${parts[4]}。`
    ];

    const randomTemplate = templates[Math.floor(Math.random() * templates.length)];
    setGeneratedText(randomTemplate);
    setCopied(false);
  };

  const copyToClipboard = async () => {
    if (generatedText) {
      await navigator.clipboard.writeText(generatedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-full mb-4 shadow-lg">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">廢話生成器</h1>
          <p className="text-gray-600">一鍵生成看似專業的商業廢話</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6 border border-gray-100">
          {generatedText ? (
            <div className="min-h-[120px] flex items-center justify-center">
              <p className="text-xl text-gray-700 leading-relaxed text-center">
                {generatedText}
              </p>
            </div>
          ) : (
            <div className="min-h-[120px] flex items-center justify-center">
              <p className="text-gray-400 text-center">
                點擊下方按鈕生成專業廢話
              </p>
            </div>
          )}
        </div>

        <div className="flex gap-4">
          <button
            onClick={generateBullshit}
            className="flex-1 bg-gradient-to-r from-blue-500 to-emerald-500 hover:from-blue-600 hover:to-emerald-600 text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 transform hover:scale-105"
          >
            <RefreshCw className="w-5 h-5" />
            生成廢話
          </button>

          {generatedText && (
            <button
              onClick={copyToClipboard}
              className="bg-white hover:bg-gray-50 text-gray-700 font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 border border-gray-200"
            >
              <Copy className="w-5 h-5" />
              {copied ? '已複製！' : '複製'}
            </button>
          )}
        </div>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>此生成器僅供娛樂，請勿用於實際工作報告 😄</p>
        </div>
      </div>
    </div>
  );
}

export default App;
