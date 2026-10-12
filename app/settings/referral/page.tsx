/**
 * 推荐奖励 —— 邀请好友注册，双方获取积分奖励
 */
'use client';

import { useState } from 'react';
import type { CSSProperties } from 'react';
import { Table, Button, Tag, Input } from 'antd';
import SettingsShell from '../_components/SettingsShell';
import { panelStyle } from '../_components/SettingsForm';

/* ═══════════════════════════════════════════════════════════════
   共享样式常量
   ═══════════════════════════════════════════════════════════════ */

const sectionHeadingStyle: CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontSize: '10px',
  fontWeight: 600,
  color: 'var(--text-muted)',
  textTransform: 'uppercase',
  letterSpacing: '0.12em',
  padding: '16px 0 8px',
  borderBottom: '1px solid var(--border-subtle)',
};

const panelSectionStyle: CSSProperties = {
  ...panelStyle,
  padding: '8px 24px 18px',
  marginBottom: '20px',
};

/* ═══════════════════════════════════════════════════════════════
   统计卡片 —— 单一职责：渲染一个统计指标
   ═══════════════════════════════════════════════════════════════ */

interface StatCardProps {
  label: string;
  value: string;
  /** 数值强调色，默认为主文本色 */
  accent?: string;
}

function StatCard({ label, value, accent = 'var(--text)' }: StatCardProps) {
  return (
    <div
      style={{
        flex: '1 1 180px',
        minWidth: '180px',
        padding: '18px 20px',
        background: 'var(--surface-overlay)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '4px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
      }}
    >
      <span
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '10px',
          fontWeight: 600,
          color: 'var(--text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.12em',
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: '28px',
          fontWeight: 800,
          color: accent,
          letterSpacing: '-0.02em',
          lineHeight: 1,
        }}
      >
        {value}
      </span>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   步骤项 —— 单一职责：渲染一个带编号圆圈的步骤
   ═══════════════════════════════════════════════════════════════ */

interface StepItemProps {
  index: number;
  text: string;
}

function StepItem({ index, text }: StepItemProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '28px',
          height: '28px',
          borderRadius: '50%',
          border: '1px solid var(--gold)',
          background: 'rgba(157, 140, 255, 0.08)',
          fontFamily: 'var(--font-mono)',
          fontSize: '13px',
          fontWeight: 700,
          color: 'var(--gold)',
          flexShrink: 0,
        }}
      >
        {index}
      </span>
      <span style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--text-dim)' }}>
        {text}
      </span>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   数据：推荐记录
   ═══════════════════════════════════════════════════════════════ */

type ReferralStatus = 'done' | 'pending';

interface ReferralRecord {
  key: string;
  user: string;
  registeredAt: string;
  status: ReferralStatus;
  reward: string;
}

const referralRecords: ReferralRecord[] = [
  { key: '1', user: 'alexshader', registeredAt: '2026-07-28', status: 'done', reward: '+200 credits' },
  { key: '2', user: 'kairos', registeredAt: '2026-07-21', status: 'done', reward: '+200 credits' },
  { key: '3', user: 'nova_dev', registeredAt: '2026-07-15', status: 'done', reward: '+200 credits' },
  { key: '4', user: 'byteforge', registeredAt: '2026-08-02', status: 'pending', reward: '—' },
  { key: '5', user: 'pixelwitch', registeredAt: '2026-08-04', status: 'pending', reward: '—' },
];

const REFERRAL_LINK = 'https://ghrank.io/r/alex2025';

/* ═══════════════════════════════════════════════════════════════
   页面主体
   ═══════════════════════════════════════════════════════════════ */

export default function ReferralPage() {
  const [copied, setCopied] = useState(false);

  // 复制推荐链接到剪贴板，并给予 2 秒的视觉反馈
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(REFERRAL_LINK);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // 剪贴板 API 不可用时静默失败，避免阻断交互
    }
  };

  const columns = [
    {
      title: 'User',
      dataIndex: 'user',
      key: 'user',
      render: (text: string) => (
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--text)' }}>
          @{text}
        </span>
      ),
    },
    {
      title: 'Registered',
      dataIndex: 'registeredAt',
      key: 'registeredAt',
      render: (text: string) => (
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-dim)' }}>
          {text}
        </span>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: ReferralStatus) =>
        status === 'done' ? (
          <Tag color="green" variant="filled">Completed</Tag>
        ) : (
          <Tag color="orange" variant="filled">Pending</Tag>
        ),
    },
    {
      title: 'Reward',
      dataIndex: 'reward',
      key: 'reward',
      render: (text: string) => (
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '13px',
            fontWeight: 700,
            color: text === '—' ? 'var(--text-muted)' : 'var(--gold)',
          }}
        >
          {text}
        </span>
      ),
    },
  ];

  return (
    <SettingsShell title="Referral Rewards" subtitle="Invite friends and both get rewarded">
      <div>
        {/* Stats row */}
        <section
          style={{
            display: 'flex',
            gap: '14px',
            flexWrap: 'wrap',
            marginBottom: '20px',
          }}
        >
          <StatCard label="Invited Users" value="24" />
          <StatCard label="Registered" value="18" accent="var(--green)" />
          <StatCard label="Total Rewards" value="$156.00" accent="var(--gold)" />
        </section>

        {/* 推荐链接 */}
        <section style={panelSectionStyle}>
          <h2 style={sectionHeadingStyle}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>My Referral Link</span>
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px 0 4px', flexWrap: 'wrap' }}>
            <Input
              value={REFERRAL_LINK}
              readOnly
              style={{ flex: 1, minWidth: '240px', fontFamily: 'var(--font-mono)', fontSize: '13px' }}
            />
            <Button type="primary" onClick={handleCopy}>
              {copied ? 'Copied' : 'Copy Link'}
            </Button>
          </div>
        </section>

        {/* 运作机制 */}
        <section style={panelSectionStyle}>
          <h2 style={sectionHeadingStyle}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>How it Works</span>
          </h2>
          <div style={{ display: 'flex', gap: '20px', padding: '20px 0 8px', flexWrap: 'wrap' }}>
            <StepItem index={1} text="Share your unique link" />
            <StepItem index={2} text="Friends register via the link" />
            <StepItem index={3} text="Both receive 200 credits" />
          </div>
        </section>

        {/* 推荐列表 */}
        <section style={panelSectionStyle}>
          <h2 style={sectionHeadingStyle}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>Referral Records</span>
          </h2>
          <div style={{ padding: '12px 0' }}>
            <Table<ReferralRecord>
              columns={columns}
              dataSource={referralRecords}
              pagination={false}
              size="middle"
            />
          </div>
        </section>
      </div>
    </SettingsShell>
  );
}
