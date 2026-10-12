/**
 * TextTypeHero —— Hero 标题打字机动画
 * 迁移自 community.js 的 TextTypeHero 组件
 * 特性：逐字打印、闪烁光标、多句循环、删除重打、变速打字
 */
'use client';

import { useState, useEffect, useRef } from 'react';

interface TextTypeHeroProps {
  texts: string[];
  typingSpeed?: number;
  pauseDuration?: number;
  deletingSpeed?: number;
  variableSpeed?: { min: number; max: number };
  cursorCharacter?: string;
  loop?: boolean;
  initialDelay?: number;
}

/** 范围随机整数 */
function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export default function TextTypeHero({
  texts,
  typingSpeed = 75,
  pauseDuration = 2000,
  deletingSpeed = 50,
  variableSpeed,
  cursorCharacter = '_',
  loop = true,
  initialDelay = 300,
}: TextTypeHeroProps) {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showCursor, setShowCursor] = useState(true);
  const [started, setStarted] = useState(false);
  const startedRef = useRef(false);

  // 当前完整句子
  const currentText = texts[currentIndex % texts.length] || '';

  // 初始延迟后启动打字
  useEffect(() => {
    const id = setTimeout(() => {
      startedRef.current = true;
      setStarted(true);
    }, initialDelay);
    return () => clearTimeout(id);
  }, [initialDelay]);

  // 打字 / 删除主循环
  useEffect(() => {
    if (!started) return;
    let timer: ReturnType<typeof setTimeout>;

    if (isDeleting) {
      if (displayText === '') {
        // 删除完毕，切换到下一句
        setIsDeleting(false);
        setCurrentIndex((idx) => (idx + 1) % texts.length);
        timer = setTimeout(() => {}, pauseDuration);
      } else {
        timer = setTimeout(() => {
          setDisplayText((t) => t.slice(0, -1));
        }, deletingSpeed);
      }
    } else {
      if (displayText === currentText) {
        // 打完一句，暂停后删除（单句且不循环则停止）
        if (texts.length > 1 || loop) {
          timer = setTimeout(() => setIsDeleting(true), pauseDuration);
        }
      } else {
        timer = setTimeout(() => {
          setDisplayText((t) => currentText.slice(0, t.length + 1));
        }, variableSpeed ? randomBetween(variableSpeed.min, variableSpeed.max) : typingSpeed);
      }
    }
    return () => clearTimeout(timer);
  }, [started, displayText, isDeleting, currentText, currentIndex, texts.length, loop, typingSpeed, pauseDuration, deletingSpeed, variableSpeed]);

  // 光标闪烁
  useEffect(() => {
    const id = setInterval(() => setShowCursor((s) => !s), 530);
    return () => clearInterval(id);
  }, []);

  const activeText = texts[currentIndex % texts.length] || '';

  return (
    <h1
      className="community-hero-title text-type-hero relative inline-block"
      style={{
        fontFamily: 'var(--font-display)',
        fontSize: '36px',
        fontWeight: 800,
        color: 'var(--text)',
        lineHeight: 1.1,
        letterSpacing: '0.01em',
        marginBottom: '10px',
        minHeight: '1.1em',
      }}
      aria-label={activeText}
    >
      <span className="text-type-content" style={{ whiteSpace: 'pre' }}>
        {displayText}
      </span>
      <span
        className={`text-type-cursor ${showCursor ? 'is-visible' : ''}`}
        style={{
          display: 'inline-block',
          color: 'var(--gold)',
          fontWeight: 400,
          marginLeft: '2px',
          opacity: showCursor ? 1 : 0,
          transition: 'opacity 0.1s',
          fontFamily: 'var(--font-display)',
        }}
        aria-hidden="true"
      >
        {cursorCharacter}
      </span>
    </h1>
  );
}
