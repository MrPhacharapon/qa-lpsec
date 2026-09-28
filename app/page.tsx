'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Table,
  FileText,
  Award,
  BookOpen,
  BarChart3,
  BookmarkCheck,
  History,
  Folder,
  ArrowLeft,
  ExternalLink,
  ChevronRight,
  RotateCw,
  AlertTriangle,
  Layers,
  Sparkles,
  Info,
} from 'lucide-react';
import { AppPayload, Category, DocumentLink, YearGroupLinks } from '@/lib/types';

const LOGO_URL = 'https://i.postimg.cc/8kKrvnfY/removebg-preview.png';

interface VisualConfig {
  icon: React.ElementType;
  gradient: string;
  shadow: string;
  textHover: string;
  badge: string;
  btn: string;
  iconBg: string;
  borderHover: string;
}

const VISUAL_CONFIGS: Record<string, VisualConfig> = {
  table: {
    icon: Table,
    gradient: 'from-blue-500 to-indigo-600',
    shadow: 'hover:shadow-blue-200/80',
    textHover: 'group-hover:text-blue-600',
    badge: 'bg-blue-100 text-blue-800 border-blue-200',
    btn: 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-blue-200',
    iconBg: 'bg-blue-50 text-blue-600',
    borderHover: 'hover:border-blue-300 hover:shadow-blue-100',
  },
  desc: {
    icon: FileText,
    gradient: 'from-emerald-500 to-teal-600',
    shadow: 'hover:shadow-emerald-200/80',
    textHover: 'group-hover:text-emerald-600',
    badge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    btn: 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-emerald-200',
    iconBg: 'bg-emerald-50 text-emerald-600',
    borderHover: 'hover:border-emerald-300 hover:shadow-emerald-100',
  },
  standard: {
    icon: Award,
    gradient: 'from-purple-500 to-violet-600',
    shadow: 'hover:shadow-purple-200/80',
    textHover: 'group-hover:text-purple-600',
    badge: 'bg-purple-100 text-purple-800 border-purple-200',
    btn: 'bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 shadow-purple-200',
    iconBg: 'bg-purple-50 text-purple-600',
    borderHover: 'hover:border-purple-300 hover:shadow-purple-100',
  },
  manual: {
    icon: BookOpen,
    gradient: 'from-amber-500 to-orange-600',
    shadow: 'hover:shadow-orange-200/80',
    textHover: 'group-hover:text-orange-600',
    badge: 'bg-orange-100 text-orange-800 border-orange-200',
    btn: 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 shadow-orange-200',
    iconBg: 'bg-orange-50 text-orange-600',
    borderHover: 'hover:border-orange-300 hover:shadow-orange-100',
  },
  report: {
    icon: BarChart3,
    gradient: 'from-rose-500 to-pink-600',
    shadow: 'hover:shadow-rose-200/80',
    textHover: 'group-hover:text-rose-600',
    badge: 'bg-rose-100 text-rose-800 border-rose-200',
    btn: 'bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 shadow-rose-200',
    iconBg: 'bg-rose-50 text-rose-600',
    borderHover: 'hover:border-rose-300 hover:shadow-rose-100',
  },
  sar: {
    icon: BookmarkCheck,
    gradient: 'from-indigo-500 to-blue-700',
    shadow: 'hover:shadow-indigo-200/80',
    textHover: 'group-hover:text-indigo-600',
    badge: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    btn: 'bg-gradient-to-r from-indigo-600 to-blue-700 hover:from-indigo-700 hover:to-blue-800 shadow-indigo-200',
    iconBg: 'bg-indigo-50 text-indigo-600',
    borderHover: 'hover:border-indigo-300 hover:shadow-indigo-100',
  },
  history: {
    icon: History,
    gradient: 'from-teal-500 to-cyan-600',
    shadow: 'hover:shadow-teal-200/80',
    textHover: 'group-hover:text-teal-600',
    badge: 'bg-teal-100 text-teal-800 border-teal-200',
    btn: 'bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 shadow-teal-200',
    iconBg: 'bg-teal-50 text-teal-600',
    borderHover: 'hover:border-teal-300 hover:shadow-teal-100',
  },
};

const DEFAULT_VISUAL: VisualConfig = {
  icon: Folder,
  gradient: 'from-slate-600 to-slate-800',
  shadow: 'hover:shadow-slate-200',
  textHover: 'group-hover:text-slate-800',
  badge: 'bg-slate-100 text-slate-800 border-slate-200',
  btn: 'bg-gradient-to-r from-slate-600 to-slate-800 hover:from-slate-700 hover:to-slate-900 shadow-slate-200',
  iconBg: 'bg-slate-50 text-slate-600',
  borderHover: 'hover:border-slate-300',
};

function getVisual(id: string): VisualConfig {
  return VISUAL_CONFIGS[id] || DEFAULT_VISUAL;
}

export default function HomePage() {
  const [data, setData] = useState<AppPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentView, setCurrentView] = useState('home');
  const [showDebug, setShowDebug] = useState(false);

  // Fetch data from Next.js Edge API Route
  const loadData = async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    try {
      const res = await fetch('/api/data', { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP Error ${res.status}`);
      const payload: AppPayload = await res.json();
      setData(payload);
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการโหลดข้อมูล';
      setData({
        status: 'error',
        timestamp: Date.now(),
        categories: [],
        tabData: {},
        availableYears: [],
        totalDocuments: 0,
        message: errMsg,
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Reset scroll when changing views
  const handleViewChange = (viewId: string) => {
    setCurrentView(viewId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const activeCategory = useMemo(() => {
    return data?.categories.find(c => c.id === currentView);
  }, [data, currentView]);

  const activeCategoryData = useMemo(() => {
    if (!data || currentView === 'home') return null;
    return data.tabData[currentView] || null;
  }, [data, currentView]);

  // Links for link_list view
  const filteredLinkList = useMemo(() => {
    if (!activeCategoryData || activeCategoryData.type !== 'link_list') return [];
    return activeCategoryData.links;
  }, [activeCategoryData]);

  // Items for multi_link_list view
  const filteredMultiLinkList = useMemo(() => {
    if (!activeCategoryData || activeCategoryData.type !== 'multi_link_list') return [];
    return activeCategoryData.items;
  }, [activeCategoryData]);

  return (
    <div className="flex flex-col min-h-screen text-slate-800">
      {/* 1. Header with Glassmorphism */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-sm transition-all">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div
            className="flex items-center space-x-3.5 cursor-pointer group"
            onClick={() => handleViewChange('home')}
          >
            <div className="w-13 h-13 sm:w-14 sm:h-14 flex-shrink-0 p-1 bg-white rounded-full shadow-sm border border-slate-100 group-hover:scale-105 transition-transform">
              <img
                src={LOGO_URL}
                alt="โลโก้ศูนย์การศึกษาพิเศษ"
                className="w-full h-full object-contain"
                onError={e => {
                  (e.target as HTMLImageElement).src = 'https://cdn-icons-png.flaticon.com/512/1256/1256675.png';
                }}
              />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-900 leading-tight">
                งานประกันคุณภาพการศึกษา
              </h1>
              <p className="text-xs sm:text-sm font-medium text-slate-500">
                ศูนย์การศึกษาพิเศษ ประจำจังหวัดลำปาง
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => loadData(true)}
              disabled={refreshing}
              title="ดึงข้อมูลล่าสุดจาก Google Sheets"
              className="p-2 sm:px-3 sm:py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all flex items-center gap-1.5 active:scale-95 disabled:opacity-50"
            >
              <RotateCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-blue-600' : ''}`} />
              <span className="hidden sm:inline">อัปเดตข้อมูล</span>
            </button>
          </div>
        </div>

        {/* Categories Tab Navigation */}
        <div className="bg-slate-900 border-t border-slate-800">
          <div className="max-w-7xl mx-auto px-4 flex items-center py-2 space-x-2 overflow-x-auto no-scrollbar">
            <button
              onClick={() => handleViewChange('home')}
              className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all whitespace-nowrap active:scale-95 ${
                currentView === 'home'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              หน้าแรก
            </button>
            {data?.categories.map(cat => {
              const isActive = currentView === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => handleViewChange(cat.id)}
                  className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all whitespace-nowrap active:scale-95 ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  {cat.title}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* 2. Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 py-6 sm:py-8 flex-grow w-full relative">
        {/* Error Notification Banner */}
        {data?.status === 'error' && (
          <div className="max-w-4xl mx-auto mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-2xl shadow-sm flex items-start animate-fade-in-up">
            <AlertTriangle className="w-6 h-6 text-red-500 mr-3 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-red-800">เกิดข้อผิดพลาดในการเชื่อมต่อข้อมูล</h3>
              <p className="text-sm text-red-600">{data.message}</p>
            </div>
          </div>
        )}

        {/* VIEW 1: HOME VIEW */}
        {currentView === 'home' ? (
          <div className="space-y-8">
            {/* Hero Welcome Banner */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-700 via-indigo-800 to-blue-950 text-white p-7 sm:p-12 shadow-xl border border-white/10 animate-fade-in-up">
              <div className="absolute -top-24 -right-24 w-72 h-72 bg-blue-400/20 rounded-full blur-3xl pointer-events-none"></div>
              <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"></div>
              
              <div className="relative z-10 max-w-3xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-blue-200 text-xs font-semibold mb-4 border border-white/10">
                  <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                  ระบบสารสนเทศงานประกันคุณภาพสถานศึกษา
                </div>
                <h2 className="text-2xl sm:text-4xl font-extrabold mb-3 leading-tight tracking-tight">
                  ยินดีต้อนรับเข้าสู่ระบบงานประกันคุณภาพ
                </h2>
                <p className="text-blue-100 text-sm sm:text-base font-light opacity-90 mb-6 max-w-2xl leading-relaxed">
                  รวบรวมมาตรฐานการศึกษา คู่มือการประเมิน ตารางวิเคราะห์ และรายงานการประเมินตนเอง (SAR) ของศูนย์การศึกษาพิเศษ ประจำจังหวัดลำปาง
                </p>

              </div>
            </div>

            {/* Skeleton Loading State */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div
                    key={i}
                    className="bg-white/80 rounded-3xl p-6 border border-slate-100 shadow-sm animate-pulse space-y-4"
                  >
                    <div className="w-20 h-20 rounded-2xl bg-slate-200 mx-auto"></div>
                    <div className="h-5 bg-slate-200 rounded-full w-3/4 mx-auto"></div>
                    <div className="h-4 bg-slate-100 rounded-full w-1/2 mx-auto"></div>
                  </div>
                ))}
              </div>
            ) : (
              /* Categories Grid */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {data?.categories.map((cat, index) => {
                  const visual = getVisual(cat.id);
                  const IconComp = visual.icon;
                  const catData = data.tabData[cat.id];
                  const delayClass = `delay-${(index % 6 + 1) * 100}`;

                  // Calculate item count badge
                  let itemCountText = '';
                  if (catData?.type === 'link_list') {
                    itemCountText = `${catData.links.length} รายการ`;
                  } else if (catData?.type === 'multi_link_list') {
                    itemCountText = `${catData.items.length} ปีการศึกษา`;
                  }

                  return (
                    <div
                      key={cat.id}
                      onClick={() => handleViewChange(cat.id)}
                      className={`animate-fade-in-up ${delayClass} relative bg-white/90 backdrop-blur-lg rounded-3xl p-6 sm:p-7 border border-white shadow-sm hover:-translate-y-2 hover:shadow-xl active:scale-95 transition-all duration-300 cursor-pointer group overflow-hidden ${visual.shadow}`}
                    >
                      <div
                        className={`absolute -right-6 -top-6 w-28 h-28 bg-gradient-to-br ${visual.gradient} opacity-10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500`}
                      ></div>

                      <div className="flex flex-col items-center text-center relative z-10">
                        <div
                          className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-5 bg-gradient-to-br ${visual.gradient} shadow-lg shadow-indigo-100 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}
                        >
                          <IconComp className="w-8 h-8 text-white" />
                        </div>
                        <h3
                          className={`text-lg font-bold text-slate-800 mb-2 transition-colors duration-300 ${visual.textHover}`}
                        >
                          {cat.title}
                        </h3>
                        {itemCountText && (
                          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 mb-4">
                            {itemCountText}
                          </span>
                        )}
                        <div className="w-full border-t border-slate-100 pt-4 mt-auto flex items-center justify-center text-xs sm:text-sm font-medium text-slate-400 group-hover:text-slate-700 transition-colors">
                          คลิกดูรายละเอียด
                          <ChevronRight className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          /* VIEW 2: CATEGORY DETAIL VIEW */
          <div className="max-w-5xl mx-auto space-y-6 animate-fade-in-up">
            {/* Top Back Button */}
            <div>
              <button
                onClick={() => handleViewChange('home')}
                className="flex items-center text-slate-700 hover:text-blue-700 bg-white border border-slate-200/80 px-4 py-2.5 rounded-full text-xs sm:text-sm font-bold shadow-sm hover:shadow active:scale-95 transition-all group"
              >
                <ArrowLeft className="w-4 h-4 mr-2 transform group-hover:-translate-x-1 transition-transform" />
                กลับหน้าหลัก
              </button>
            </div>

            {/* Category Main Container */}
            <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-xl border border-slate-200/70 overflow-hidden">
              {/* Category Header */}
              {(() => {
                const visual = getVisual(currentView);
                const IconComp = visual.icon;
                return (
                  <div className="bg-slate-50/90 border-b border-slate-200/80 px-6 sm:px-8 py-5 flex items-center justify-between gap-4 relative overflow-hidden">
                    <div className={`absolute top-0 left-0 w-2 h-full bg-gradient-to-b ${visual.gradient}`}></div>
                    <div className="flex items-center gap-3.5">
                      <div
                        className={`p-3 rounded-2xl shadow-md bg-gradient-to-br ${visual.gradient} flex items-center justify-center`}
                      >
                        <IconComp className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h2 className="text-xl sm:text-2xl font-black text-slate-800">
                          {activeCategory?.title || 'หมวดหมู่'}
                        </h2>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {activeCategoryData?.type === 'link_list'
                            ? `เอกสารทั้งหมด (${filteredLinkList.length} รายการ)`
                            : activeCategoryData?.type === 'multi_link_list'
                            ? `ข้อมูลรายปีการศึกษา (${filteredMultiLinkList.length} ปี)`
                            : ''}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })()}



              {/* Category Content Body */}
              <div className="p-6 sm:p-8">
                {activeCategoryData?.type === 'error' ? (
                  <div className="bg-red-50 border border-red-200 p-8 rounded-2xl text-center space-y-3">
                    <AlertTriangle className="w-12 h-12 text-red-500 mx-auto" />
                    <h3 className="text-xl font-bold text-red-800">พบข้อผิดพลาดในการโหลดข้อมูล</h3>
                    <p className="text-sm text-red-600">{activeCategoryData.message}</p>
                  </div>
                ) : activeCategoryData?.type === 'link_list' ? (
                  /* TYPE 1: LINK_LIST (Document Cards with Image Covers) */
                  filteredLinkList.length === 0 ? (
                    <div className="text-center py-16 text-slate-400 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                      <FileText className="w-12 h-12 mx-auto text-slate-300 mb-2" />
                      <p className="font-semibold text-slate-600">ไม่พบเอกสาร</p>
                      <p className="text-xs text-slate-400 mt-1">
                        ยังไม่มีข้อมูลเอกสารในหมวดหมู่นี้
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                      {filteredLinkList.map((link, idx) => {
                        const visual = getVisual(currentView);
                        const IconComp = visual.icon;
                        const delayClass = `delay-${(idx % 4 + 1) * 100}`;
                        const isInactive = !link.url;

                        return (
                          <div
                            key={link.id}
                            className={`animate-fade-in-up ${delayClass} bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col group ${visual.borderHover}`}
                          >
                            {/* Image Header or Fallback Icon */}
                            {link.imageUrl ? (
                              <div className="w-full h-56 bg-slate-50 border-b border-slate-100 overflow-hidden relative flex items-center justify-center p-4">
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-200/50 to-transparent z-10 pointer-events-none"></div>
                                <img
                                  src={link.imageUrl}
                                  alt={link.title}
                                  className="max-w-full max-h-full object-contain relative z-20 group-hover:scale-105 transition-transform duration-500 drop-shadow-md"
                                  onError={e => {
                                    // If image fails to load, replace with clean container
                                    const parent = (e.target as HTMLElement).parentElement;
                                    if (parent) parent.style.display = 'none';
                                  }}
                                />
                              </div>
                            ) : (
                              <div className="py-12 flex justify-center bg-slate-50 border-b border-slate-100">
                                <div
                                  className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-inner ${visual.iconBg}`}
                                >
                                  <IconComp className="w-8 h-8" />
                                </div>
                              </div>
                            )}

                            {/* Card Body */}
                            <div className="p-6 flex-grow flex flex-col justify-between">
                              <div>
                                {link.year && (
                                  <span className="inline-block text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 mb-2.5">
                                    ปีการศึกษา {link.year}
                                  </span>
                                )}
                                <h4 className="font-extrabold text-slate-800 text-base sm:text-lg mb-6 leading-snug">
                                  {link.title}
                                </h4>
                              </div>

                              <a
                                href={isInactive ? undefined : link.url}
                                target={isInactive ? undefined : '_blank'}
                                rel={isInactive ? undefined : 'noopener noreferrer'}
                                onClick={e => {
                                  if (isInactive) e.preventDefault();
                                }}
                                className={`w-full py-3.5 rounded-xl text-sm font-bold flex justify-center items-center shadow-md active:scale-95 transition-all text-white ${
                                  visual.btn
                                } ${isInactive ? 'opacity-50 cursor-not-allowed grayscale' : 'hover:shadow-lg'}`}
                              >
                                {isInactive ? 'ยังไม่มีไฟล์เอกสาร' : 'เปิดดูเอกสาร'}
                                {!isInactive && <ExternalLink className="w-4 h-4 ml-2" />}
                              </a>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )
                ) : activeCategoryData?.type === 'multi_link_list' ? (
                  /* TYPE 2: MULTI_LINK_LIST (Standards 1, 2, 3 grouped by Academic Year) */
                  filteredMultiLinkList.length === 0 ? (
                    <div className="text-center py-16 text-slate-400 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                      <Layers className="w-12 h-12 mx-auto text-slate-300 mb-2" />
                      <p className="font-semibold text-slate-600">ยังไม่มีข้อมูลในหมวดหมู่นี้</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {filteredMultiLinkList.map((item, idx) => {
                        const visual = getVisual(currentView);
                        const IconComp = visual.icon;
                        const delayClass = `delay-${(idx % 4 + 1) * 100}`;

                        return (
                          <div
                            key={idx}
                            className={`animate-fade-in-up ${delayClass} bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ${visual.borderHover}`}
                          >
                            <div className="flex items-center mb-5 border-b border-slate-100 pb-4">
                              <div
                                className={`w-12 h-12 rounded-2xl flex items-center justify-center mr-4 ${visual.iconBg}`}
                              >
                                <IconComp className="w-6 h-6" />
                              </div>
                              <div>
                                <h4 className="text-xl font-black text-slate-800">
                                  ปีการศึกษา {item.year}
                                </h4>
                                <span className="text-xs text-slate-400">
                                  ข้อมูลมาตรฐานการศึกษา
                                </span>
                              </div>
                            </div>

                            <div className="flex flex-col gap-2.5">
                              {item.links.map((link, lIdx) => {
                                const isInactive = !link.url;
                                return (
                                  <a
                                    key={lIdx}
                                    href={isInactive ? undefined : link.url}
                                    target={isInactive ? undefined : '_blank'}
                                    rel={isInactive ? undefined : 'noopener noreferrer'}
                                    onClick={e => {
                                      if (isInactive) e.preventDefault();
                                    }}
                                    className={`w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-semibold flex justify-between items-center transition-all active:scale-95 border ${
                                      isInactive
                                        ? 'border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed'
                                        : `border-transparent text-white ${visual.btn}`
                                    }`}
                                  >
                                    <span className="flex items-center gap-2.5">
                                      <span
                                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                          isInactive
                                            ? 'bg-slate-200 text-slate-500'
                                            : 'bg-white/20 text-white'
                                        }`}
                                      >
                                        {lIdx + 1}
                                      </span>
                                      <span>{link.label}</span>
                                    </span>
                                    <ExternalLink
                                      className={`w-4 h-4 ${isInactive ? 'opacity-30' : 'opacity-90'}`}
                                    />
                                  </a>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )
                ) : (
                  <div className="text-center py-20 text-slate-400 bg-slate-50/50 rounded-3xl border border-dashed border-slate-200">
                    <Info className="w-12 h-12 mx-auto text-slate-300 mb-2" />
                    <p className="font-semibold text-slate-600">ยังไม่มีข้อมูลในระบบ</p>
                    <p className="text-xs text-slate-400 mt-1">กำลังอยู่ในระหว่างการจัดทำฐานข้อมูล</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 3. Debug Banner (Per Skill: frontend-debug-logging) */}
        {data?.debugLogs && data.debugLogs.length > 0 && (
          <div className="max-w-4xl mx-auto mt-10">
            <button
              onClick={() => setShowDebug(!showDebug)}
              className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1 mx-auto"
            >
              <Info className="w-3.5 h-3.5" />
              {showDebug ? 'ซ่อนข้อมูล Debug ระบบ' : 'แสดงข้อมูลสถานะการเชื่อมต่อ (Debug)'}
            </button>

            {showDebug && (
              <div className="mt-3 p-4 bg-slate-100 border border-slate-200 rounded-2xl text-xs font-mono text-slate-700 space-y-1 max-h-48 overflow-y-auto">
                <p className="font-bold text-slate-800 mb-2">บันทึกสถานะการเชื่อมต่อ Google Sheets:</p>
                {data.debugLogs.map((log, i) => (
                  <div key={i} className="text-slate-600">
                    &bull; {log}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* 4. Footer */}
      <footer className="mt-auto py-8 text-center text-slate-400 text-xs sm:text-sm font-medium border-t border-slate-200/50 bg-white/50 backdrop-blur-sm">
        <p className="text-slate-600 font-semibold mb-1">
          © 2569 งานประกันคุณภาพการศึกษา
        </p>
        <p>ศูนย์การศึกษาพิเศษ ประจำจังหวัดลำปาง</p>
      </footer>
    </div>
  );
}
