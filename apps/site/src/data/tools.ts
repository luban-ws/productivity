/**
 * 鲁班工坊生产力工具数据
 */

export interface Tool {
    id: string;
    name: string;
    nameEn: string;
    icon: string;
    description: string;
    descriptionEn: string;
    descriptionJa: string;
    descriptionKo: string;
    features: string[];
    featuresEn: string[];
    featuresJa: string[];
    featuresKo: string[];
    githubUrl: string;
    npmUrl: string;
}

export const tools: Tool[] = [
    {
        id: "qingniao",
        name: "青鸟",
        nameEn: "Qingniao",
        icon: "🌌",
        description:
            "零配置优先的通用发布工具，专为 monorepo 项目设计。自动检测包管理器、workspace 类型、构建工具，让发布流程如青鸟飞行般优雅流畅。",
        descriptionEn:
            "Zero-config-first universal publishing tool designed for monorepo projects. Automatically detects package managers, workspace types, and build tools, making the publishing process as elegant as a bluebird's flight.",
        descriptionJa:
            "モノレポプロジェクト向けに設計されたゼロ設定優先の汎用公開ツール。パッケージマネージャー、ワークスペースタイプ、ビルドツールを自動検出し、公開プロセスを青い鳥の飛行のようにエレガントでスムーズにします。",
        descriptionKo:
            "모노레포 프로젝트를 위해 설계된 제로 설정 우선 범용 게시 도구. 패키지 관리자, 워크스페이스 유형, 빌드 도구를 자동으로 감지하여 게시 프로세스를 파랑새의 비행처럼 우아하고 부드럽게 만듭니다.",
        features: ["零配置优先", "自动检测", "Changeset 集成", "Turbo 支持", "智能版本管理"],
        featuresEn: [
            "Zero-config first",
            "Auto-detection",
            "Changeset integration",
            "Turbo support",
            "Smart versioning",
        ],
        featuresJa: [
            "ゼロ設定優先",
            "自動検出",
            "Changeset 統合",
            "Turbo サポート",
            "スマートバージョン管理",
        ],
        featuresKo: [
            "제로 설정 우선",
            "자동 감지",
            "Changeset 통합",
            "Turbo 지원",
            "스마트 버전 관리",
        ],
        githubUrl:
            "https://github.com/luban-ws/productivity/tree/main/packages/@systembug/qingniao",
        npmUrl: "https://www.npmjs.com/package/@systembug/qingniao",
    },
    {
        id: "wenxin",
        name: "文心",
        nameEn: "Wenxin",
        icon: "📚",
        description:
            "通用 API 文档生成工具，支持 JSDoc 和 TypeScript。混合模式自动合并类型信息到 JSDoc 文档，让文档生成如文心雕龙般精美。",
        descriptionEn:
            "Universal API documentation generator supporting JSDoc and TypeScript. Hybrid mode automatically merges type information into JSDoc documentation, making documentation generation as exquisite as carving a dragon.",
        descriptionJa:
            "JSDoc と TypeScript をサポートする汎用 API ドキュメント生成ツール。ハイブリッドモードは型情報を JSDoc ドキュメントに自動的にマージし、ドキュメント生成を文心雕龍のように美しくします。",
        descriptionKo:
            "JSDoc 및 TypeScript를 지원하는 범용 API 문서 생성 도구. 하이브리드 모드는 타입 정보를 JSDoc 문서에 자동으로 병합하여 문서 생성을 문심조룡처럼 정교하게 만듭니다.",
        features: ["JSDoc 支持", "TypeScript 支持", "混合模式", "零配置", "向后兼容"],
        featuresEn: [
            "JSDoc support",
            "TypeScript support",
            "Hybrid mode",
            "Zero-config",
            "Backward compatible",
        ],
        featuresJa: [
            "JSDoc サポート",
            "TypeScript サポート",
            "ハイブリッドモード",
            "ゼロ設定",
            "後方互換性",
        ],
        featuresKo: [
            "JSDoc 지원",
            "TypeScript 지원",
            "하이브리드 모드",
            "제로 설정",
            "하위 호환성",
        ],
        githubUrl: "https://github.com/luban-ws/productivity/tree/main/packages/@systembug/wenxin",
        npmUrl: "https://www.npmjs.com/package/@systembug/wenxin",
    },
    {
        id: "pangu",
        name: "盘古",
        nameEn: "Pangu",
        icon: "🚀",
        description:
            "交互式开发服务器启动工具。从配置文件读取 demo 列表，快速启动开发服务器，如盘古开天辟地般开启开发之旅。",
        descriptionEn:
            "Interactive development server launcher. Reads demo lists from configuration files and quickly starts development servers, opening your development journey like Pangu creating the world.",
        descriptionJa:
            "対話型開発サーバー起動ツール。設定ファイルからデモリストを読み取り、開発サーバーを素早く起動し、盤古が天地を開いたように開発の旅を始めます。",
        descriptionKo:
            "대화형 개발 서버 실행 도구. 설정 파일에서 데모 목록을 읽고 개발 서버를 빠르게 시작하여 반고가 천지를 개벽한 것처럼 개발 여정을 시작합니다.",
        features: ["交互式菜单", "配置文件支持", "多包管理器", "快速启动", "JSON/YAML 配置"],
        featuresEn: [
            "Interactive menu",
            "Config file support",
            "Multi-package manager",
            "Quick start",
            "JSON/YAML config",
        ],
        featuresJa: [
            "対話型メニュー",
            "設定ファイルサポート",
            "マルチパッケージマネージャー",
            "クイックスタート",
            "JSON/YAML 設定",
        ],
        featuresKo: [
            "대화형 메뉴",
            "설정 파일 지원",
            "다중 패키지 관리자",
            "빠른 시작",
            "JSON/YAML 설정",
        ],
        githubUrl: "https://github.com/luban-ws/productivity/tree/main/packages/@systembug/pangu",
        npmUrl: "https://www.npmjs.com/package/@systembug/pangu",
    },
    {
        id: "diting",
        name: "谛听",
        nameEn: "Diting",
        icon: "👂",
        description:
            "平台中立的日志库，使用 chalk 和 pino 进行日志记录。如谛听能听万物、辨真伪、记录善恶，为应用程序提供全面的日志记录能力。",
        descriptionEn:
            "Platform-neutral logging library using chalk and pino for logging. Like Diting who can hear all things, distinguish truth from falsehood, and record good and evil, providing comprehensive logging capabilities for applications.",
        descriptionJa:
            "chalk と pino を使用したプラットフォーム中立のロギングライブラリ。万物を聞き、真偽を区別し、善悪を記録する諦聴のように、アプリケーションに包括的なロギング機能を提供します。",
        descriptionKo:
            "chalk와 pino를 사용하는 플랫폼 중립 로깅 라이브러리. 만물을 듣고 진위를 구별하며 선악을 기록하는 체청처럼, 애플리케이션에 포괄적인 로깅 기능을 제공합니다.",
        features: ["平台中立", "多日志级别", "彩色输出", "结构化日志", "可插拔传输器"],
        featuresEn: [
            "Platform-neutral",
            "Multiple log levels",
            "Colored output",
            "Structured logs",
            "Pluggable transports",
        ],
        featuresJa: [
            "プラットフォーム中立",
            "複数のログレベル",
            "カラー出力",
            "構造化ログ",
            "プラガブルトランスポート",
        ],
        featuresKo: [
            "플랫폼 중립",
            "다중 로그 레벨",
            "컬러 출력",
            "구조화된 로그",
            "플러그 가능한 전송",
        ],
        githubUrl: "https://github.com/luban-ws/productivity/tree/main/packages/@systembug/diting",
        npmUrl: "https://www.npmjs.com/package/@systembug/diting",
    },
];
