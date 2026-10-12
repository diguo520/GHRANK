/**
 * 积分设置页 —— 余额展示 + 获取任务 + 变动记录
 */
'use client';

import type { CSSProperties, ReactNode } from 'react';
import { Table, Button } from 'antd';
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
   获取任务卡片 —— 单一职责：渲染一个任务行
   ═══════════════════════════════════════════════════════════════ */

interface TaskCardProps {
  title: string;
  reward: string;
  desc: string;
  action: ReactNode;
}

function TaskCard({ title, reward, desc, action }: TaskCardProps) {
  return (
    <div
      style={{
        flex: '1 1 220px',
        minWidth: '220px',
        padding: '16px',
        background: 'transparent',
        border: '1px solid var(--border-subtle)',
        borderRadius: '4px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 600, color: 'var(--text)' }}>
          {title}
        </span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 700, color: 'var(--gold)' }}>
          {reward}
        </span>
      </div>
      <div style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.5, flex: 1 }}>
        {desc}
      </div>
      <div style={{ marginTop: '4px' }}>{action}</div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   数据：积分变动记录
   ═══════════════════════════════════════════════════════════════ */

interface CreditRecord {
  key: string;
  time: string;
  type: string;
  desc: string;
  delta: number;
  balance: string;
}

const creditHistory: CreditRecord[] = [
  { key: '1', time: '2026-08-05 09:12', type: 'Check-in', desc: 'Daily check-in reward', delta: 10, balance: '8,420' },
  { key: '2', time: '2026-08-04 22:30', type: 'Publish', desc: 'Published Prompt "Code Review Assistant"', delta: 50, balance: '8,410' },
  { key: '3', time: '2026-08-04 14:05', type: 'Spend', desc: 'Used advanced model inference', delta: -30, balance: '8,360' },
  { key: '4', time: '2026-08-03 18:48', type: 'Invite', desc: 'Friend "Qilin" completed registration', delta: 200, balance: '8,390' },
  { key: '5', time: '2026-08-02 10:21', type: 'Check-in', desc: 'Daily check-in reward', delta: 10, balance: '8,190' },
];

/* ═══════════════════════════════════════════════════════════════
   页面主体
   ═══════════════════════════════════════════════════════════════ */

export default function CreditsPage() {
  const columns = [
    {
      title: 'Time',
      dataIndex: 'time',
      key: 'time',
      render: (text: string) => (
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-dim)' }}>{text}</span>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (text: string) => (
        <span style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--text)' }}>{text}</span>
      ),
    },
    {
      title: 'Description',
      dataIndex: 'desc',
      key: 'desc',
      render: (text: string) => (
        <span style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--text-dim)' }}>{text}</span>
      ),
    },
    {
      title: 'Change',
      dataIndex: 'delta',
      key: 'delta',
      render: (delta: number) => {
        const positive = delta > 0;
        return (
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '13px',
              fontWeight: 700,
              color: positive ? 'var(--green)' : 'var(--text-muted)',
            }}
          >
            {positive ? `+${delta}` : delta}
          </span>
        );
      },
    },
    {
      title: 'Balance',
      dataIndex: 'balance',
      key: 'balance',
      render: (text: string) => (
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--text)' }}>{text}</span>
      ),
    },
  ];

  return (
    <SettingsShell title="Credits" subtitle="View your credit balance and earning history">
      <div>
        {/* 余额卡片：金色渐变背景 */}
        <section
          style={{
            ...panelStyle,
            marginBottom: '20px',
            padding: '28px 32px',
            background:
              'linear-gradient(135deg, rgba(157, 140, 255, 0.18) 0%, rgba(157, 140, 255, 0.04) 60%, var(--surface) 100%)',
            border: '1px solid rgba(157, 140, 255, 0.35)',
            borderRadius: '4px',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '16px',
            }}
          >
            <div>
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '10px',
                  fontWeight: 600,
                  color: 'var(--gold)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.12em',
                  marginBottom: '10px',
                }}
              >
                Current Balance
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                <span
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '40px',
                    fontWeight: 800,
                    color: 'var(--gold)',
                    letterSpacing: '-0.02em',
                    lineHeight: 1,
                  }}
                >
                  8,420
                </span>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--text-dim)' }}>credits</span>
              </div>
            </div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 14px',
                background: 'rgba(157, 140, 255, 0.12)',
                border: '1px solid var(--gold)',
                borderRadius: '999px',
              }}
            >
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '12px',
                  fontWeight: 700,
                  color: 'var(--gold)',
                  letterSpacing: '0.04em',
                }}
              >
                Lv.12
              </span>
            </div>
          </div>
        </section>

        {/* 获取积分任务 */}
        <section style={panelSectionStyle}>
          <h2 style={sectionHeadingStyle}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>Earn Credits</span>
          </h2>
          <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', padding: '14px 0 4px' }}>
            <TaskCard
              title="Daily Check-in"
              reward="+10 credits"
              desc="Log in daily to claim your credit reward."
              action={
                <Button size="small" type="primary">
                  Check in
                </Button>
              }
            />
            <TaskCard
              title="Publish a Prompt"
              reward="+50 credits"
              desc="Publish a high-quality prompt and get approved to earn credits."
              action={
                <a
                  href="/prompts/new"
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: 'var(--gold)',
                    textDecoration: 'none',
                  }}
                >
                  Publish now →
                </a>
              }
            />
            <TaskCard
              title="Invite Friends"
              reward="+200 credits"
              desc="Invite friends to register and both get rewarded after their first check-in."
              action={
                <a
                  href="/invite"
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: 'var(--gold)',
                    textDecoration: 'none',
                  }}
                >
                  Invite →
                </a>
              }
            />
          </div>
        </section>

        {/* 积分变动记录 */}
        <section style={panelSectionStyle}>
          <h2 style={sectionHeadingStyle}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>Change History</span>
          </h2>
          <div style={{ padding: '12px 0' }}>
            <Table<CreditRecord>
              columns={columns}
              dataSource={creditHistory}
              pagination={false}
              size="middle"
            />
          </div>
        </section>
      </div>
    </SettingsShell>
  );
}
