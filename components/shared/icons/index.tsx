/**
 * Icons —— 全站统一图标库（v2.0 lucide-react 迁移）
 *
 * 迁移内容：
 * - 40+ 自定义 SVG → lucide-react 组件
 * - 保留统一的 props 签名（size/className/style/filled）
 *
 * 兼容性：
 * - 所有导出名称不变
 * - 所有 props 签名不变
 * - 调用方零修改
 *
 * 注意：
 * - lucide-react 默认 stroke-width=2，与原 SVG 一致
 * - Heart/Bookmark 的 filled 通过 fill/stroke 切换实现
 * - GitHub/Star 等品牌图标 lucide-react 也提供
 */

import type { CSSProperties, SVGProps } from 'react';
import {
  Heart,
  Bookmark,
  Share2,
  Reply,
  Send,
  Plus,
  Check,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Search,
  ChevronDown,
  ArrowRight,
  ArrowLeft,
  ExternalLink,
  Clock,
  Eye,
  User,
  Users,
  FileText,
  Tag,
  List,
  Home,
  Bell,
  Terminal,
  TrendingUp,
  TrendingDown,
  Minus,
  Info,
  Mail,
  MessageSquare,
  Github,
  Star,
  Lock,
  Coffee,
  MapPin,
  Calendar,
  Edit3,
  Settings,
  Link2,
  Trophy,
  Shield,
  Globe,
  Key,
  Trash2,
  Flame,
  Sparkles,
  BarChart3,
  Download,
  Upload,
  X,
  Coins,
  HelpCircle,
  Flag,
  type LucideProps,
} from 'lucide-react';

/* ═══════════════════════════════════════════════════════════════
   基础类型（保持不变）
   ═══════════════════════════════════════════════════════════════ */

interface IconBaseProps extends Omit<SVGProps<SVGSVGElement>, 'width' | 'height'> {
  size?: number;
  className?: string;
  style?: CSSProperties;
}

interface ToggleIconProps extends IconBaseProps {
  filled?: boolean;
}

/* ═══════════════════════════════════════════════════════════════
   适配工厂：把 lucide-react 组件包装为项目的 IconBaseProps 签名
   ═══════════════════════════════════════════════════════════════ */

function adapt<P extends IconBaseProps>(
  LucideComp: React.ComponentType<LucideProps>
): React.FC<P> {
  const Wrapped: React.FC<P> = ({ size = 16, className, style, ...rest }) => (
    <LucideComp
      size={size}
      className={className}
      style={style}
      {...(rest as LucideProps)}
    />
  );
  Wrapped.displayName = `Adapted(${LucideComp.displayName || 'LucideIcon'})`;
  return Wrapped as unknown as React.FC<P>;
}

function adaptToggle<P extends ToggleIconProps>(
  LucideComp: React.ComponentType<LucideProps>
): React.FC<P> {
  const Wrapped: React.FC<P> = ({ size = 16, filled = false, className, style, ...rest }) => (
    <LucideComp
      size={size}
      className={className}
      style={{
        fill: filled ? 'currentColor' : 'none',
        ...style,
      }}
      {...(rest as LucideProps)}
    />
  );
  Wrapped.displayName = `AdaptedToggle(${LucideComp.displayName || 'LucideIcon'})`;
  return Wrapped as unknown as React.FC<P>;
}

/* ═══════════════════════════════════════════════════════════════
   交互图标
   ═══════════════════════════════════════════════════════════════ */

export const HeartIcon = adaptToggle<ToggleIconProps>(Heart);
export const BookmarkIcon = adaptToggle<ToggleIconProps>(Bookmark);
export const ShareIcon = adapt<IconBaseProps>(Share2);
export const ReplyIcon = adapt<IconBaseProps>(Reply);
export const SendIcon = adapt<IconBaseProps>(Send);
export const PlusIcon = adapt<IconBaseProps>(Plus);
export const CheckIcon = adapt<IconBaseProps>(Check);
export const CopyIcon = adapt<IconBaseProps>(Copy);
export const DownloadIcon = adapt<IconBaseProps>(Download);
export const UploadIcon = adapt<IconBaseProps>(Upload);
export const CloseIcon = adapt<IconBaseProps>(X);
export const SearchIcon = adapt<IconBaseProps>(Search);
export const ChevronDownIcon = adapt<IconBaseProps>(ChevronDown);
export const ArrowRightIcon = adapt<IconBaseProps>(ArrowRight);
export const ArrowLeftIcon = adapt<IconBaseProps>(ArrowLeft);
export const ExternalLinkIcon = adapt<IconBaseProps>(ExternalLink);

/* ═══════════════════════════════════════════════════════════════
   内容/信息图标
   ═══════════════════════════════════════════════════════════════ */

export const ClockIcon = adapt<IconBaseProps>(Clock);
export const EyeIcon = adapt<IconBaseProps>(Eye);
export const UserIcon = adapt<IconBaseProps>(User);
export const UsersIcon = adapt<IconBaseProps>(Users);
export const FileTextIcon = adapt<IconBaseProps>(FileText);
export const TagIcon = adapt<IconBaseProps>(Tag);
export const ListIcon = adapt<IconBaseProps>(List);
export const HomeIcon = adapt<IconBaseProps>(Home);
export const NewsIcon = adapt<IconBaseProps>(Bell); // 原 NewsIcon 语义为铃铛
export const TerminalIcon = adapt<IconBaseProps>(Terminal);
export const TrendUpIcon = adapt<IconBaseProps>(TrendingUp);
export const TrendDownIcon = adapt<IconBaseProps>(TrendingDown);
export const TrendFlatIcon = adapt<IconBaseProps>(Minus);
export const InfoIcon = adapt<IconBaseProps>(Info);
export const MailIcon = adapt<IconBaseProps>(Mail);
export const MessageIcon = adapt<IconBaseProps>(MessageSquare);

/** 热门标识 —— 火焰图标 */
export const HotIcon = adapt<IconBaseProps>(Flame);
/** 新帖标识 —— 火花图标 */
export const NewIcon = adapt<IconBaseProps>(Sparkles);
/** 投票标识 —— 条形图图标（用于帖子列表 hasPoll 标记） */
export const PollIcon = adapt<IconBaseProps>(BarChart3);
/** 提问标识 —— 问号图标（用于 threadType=question 的帖子标记） */
export const QuestionIcon = adapt<IconBaseProps>(HelpCircle);
/** 积分标识 —— 金币图标（用于展示 questionPoints 提问帖的积分奖励） */
export const CoinsIcon = adapt<IconBaseProps>(Coins);

/* ═══════════════════════════════════════════════════════════════
   品牌/特殊图标
   ═══════════════════════════════════════════════════════════════ */

export const GitHubIcon = adapt<IconBaseProps>(Github);
export const StarIcon = adaptToggle<ToggleIconProps>(Star);
export const LockIcon = adapt<IconBaseProps>(Lock);
export const CoffeeIcon = adapt<IconBaseProps>(Coffee);

/* ═══════════════════════════════════════════════════════════════
   Profile 专用图标
   ═══════════════════════════════════════════════════════════════ */

export const MapPinIcon = adapt<IconBaseProps>(MapPin);
export const CalendarIcon = adapt<IconBaseProps>(Calendar);
export const EditIcon = adapt<IconBaseProps>(Edit3);
export const SettingsIcon = adapt<IconBaseProps>(Settings);
export const LinkIcon = adapt<IconBaseProps>(Link2);
export const TrophyIcon = adapt<IconBaseProps>(Trophy);
export const BellIcon = adapt<IconBaseProps>(Bell);
export const ShieldIcon = adapt<IconBaseProps>(Shield);
export const GlobeIcon = adapt<IconBaseProps>(Globe);
export const KeyIcon = adapt<IconBaseProps>(Key);
export const TrashIcon = adapt<IconBaseProps>(Trash2);
export const LockClosedIcon = adapt<IconBaseProps>(Lock);
/** 已采纳/已分配标识 —— 带勾圆圈图标（用于 Bounty 卡 "assigned/settled" 状态） */
export const CheckCircleIcon = adapt<IconBaseProps>(CheckCircle2);
/** 告警标识 —— 三角感叹号图标（用于 Bounty 卡 "open/expired" 状态提示） */
export const AlertIcon = adapt<IconBaseProps>(AlertTriangle);

/* ═══════════════════════════════════════════════════════════════
   管理/举报专用图标
   ═══════════════════════════════════════════════════════════════ */

/** 举报按钮 —— 旗帜图标（用于 ReplyItem / PostActions 上的举报入口） */
export const ReportIcon = adapt<IconBaseProps>(Flag);
