export const translations = {
  en: {
    translation: {
      nav: {
        home: 'Home',
        console: 'AI Console',
        analysis: 'Data Analysis',
        tools: 'Tools Library',
        knowledge: 'Knowledge Base',
        projects: 'Projects',
        settings: 'Settings',
      },
      home: {
        title: 'BioAiSaaS',
        subtitle: 'General-Purpose Biomedical AI Agent Platform',
        description: 'Accelerate your biomedical research with intelligent AI agents. From scRNA-seq annotation to GWAS analysis, our platform handles complex workflows with ease.',
        getStarted: 'Get Started',
        learnMore: 'Learn More',
        features: {
          title: 'Powerful Features',
          aiAgent: {
            title: 'Intelligent AI Agent',
            description: 'Natural language interface for complex biomedical analysis tasks',
          },
          scRNA: {
            title: 'scRNA-seq Analysis',
            description: 'Automated cell type annotation and clustering analysis',
          },
          gwas: {
            title: 'GWAS Analysis',
            description: 'Genome-wide association studies with comprehensive reporting',
          },
          crispr: {
            title: 'CRISPR Screening',
            description: 'High-throughput screening data analysis and visualization',
          },
        },
        quickStart: {
          title: 'Quick Start Guide',
          step1: {
            title: 'Configure API',
            description: 'Set up your API keys in the settings page',
          },
          step2: {
            title: 'Upload Data',
            description: 'Upload your biomedical data files',
          },
          step3: {
            title: 'Run Analysis',
            description: 'Describe your task to the AI agent',
          },
          step4: {
            title: 'Get Results',
            description: 'View and download your analysis results',
          },
        },
        stats: {
          tools: 'Analysis Tools',
          databases: 'Databases',
          users: 'Active Users',
          analyses: 'Analyses Run',
        },
      },
      console: {
        title: 'AI Agent Console',
        placeholder: 'Describe your biomedical analysis task...',
        send: 'Send',
        clear: 'Clear Chat',
        logs: 'Execution Logs',
        results: 'Results',
        examples: {
          title: 'Try These Examples',
          scRNA: 'Annotate cell types in my scRNA-seq data',
          gwas: 'Run GWAS analysis for diabetes risk variants',
          crispr: 'Analyze my CRISPR screening results',
        },
      },
      analysis: {
        title: 'Data Analysis Workspace',
        upload: {
          title: 'Upload Data',
          description: 'Drag and drop files here or click to browse',
          supported: 'Supported formats: CSV, TSV, H5AD, VCF, FASTQ',
        },
        tasks: {
          title: 'Analysis Tasks',
          scRNA: 'scRNA-seq Annotation',
          gwas: 'GWAS Analysis',
          crispr: 'CRISPR Screening',
          pathway: 'Pathway Analysis',
          variant: 'Variant Calling',
        },
        status: {
          idle: 'Ready',
          running: 'Running',
          completed: 'Completed',
          error: 'Error',
        },
        run: 'Run Analysis',
        download: 'Download Results',
      },
      tools: {
        title: 'Tools Library',
        search: 'Search tools...',
        categories: {
          all: 'All Tools',
          sequencing: 'Sequencing',
          genomics: 'Genomics',
          proteomics: 'Proteomics',
          imaging: 'Imaging',
          databases: 'Databases',
        },
        items: {
          scanpy: {
            name: 'Scanpy',
            description: 'Single-cell analysis in Python',
          },
          plink: {
            name: 'PLINK',
            description: 'Whole-genome association analysis',
          },
          mageck: {
            name: 'MAGeCK',
            description: 'CRISPR screen analysis',
          },
          deseq2: {
            name: 'DESeq2',
            description: 'Differential expression analysis',
          },
          cellranger: {
            name: 'Cell Ranger',
            description: '10x Genomics data processing',
          },
          ensembl: {
            name: 'Ensembl',
            description: 'Genome browser and annotation',
          },
        },
      },
      knowledge: {
        title: 'Knowledge Base',
        search: 'Search articles...',
        categories: {
          bestPractices: 'Best Practices',
          protocols: 'Protocols',
          troubleshooting: 'Troubleshooting',
          tutorials: 'Tutorials',
        },
        articles: {
          scRNA: {
            title: 'scRNA-seq Analysis Best Practices',
            description: 'Complete guide to single-cell RNA sequencing analysis',
          },
          gwas: {
            title: 'GWAS Quality Control',
            description: 'Essential QC steps for genome-wide association studies',
          },
          crispr: {
            title: 'CRISPR Screen Design',
            description: 'Guidelines for designing effective CRISPR screens',
          },
        },
      },
      projects: {
        title: 'Project Management',
        new: 'New Project',
        search: 'Search projects...',
        columns: {
          name: 'Name',
          type: 'Type',
          status: 'Status',
          created: 'Created',
          actions: 'Actions',
        },
        empty: 'No projects yet. Create your first project to get started.',
        status: {
          active: 'Active',
          completed: 'Completed',
          archived: 'Archived',
        },
      },
      settings: {
        title: 'Settings',
        api: {
          title: 'API Configuration',
          key: 'API Key',
          placeholder: 'Enter your API key',
          save: 'Save',
          test: 'Test Connection',
        },
        language: {
          title: 'Language',
          description: 'Select your preferred language',
        },
        theme: {
          title: 'Theme',
          description: 'Choose light or dark mode',
          light: 'Light',
          dark: 'Dark',
          system: 'System',
        },
        notifications: {
          title: 'Notifications',
          email: 'Email notifications',
          browser: 'Browser notifications',
        },
      },
      common: {
        loading: 'Loading...',
        error: 'An error occurred',
        success: 'Success',
        cancel: 'Cancel',
        confirm: 'Confirm',
        delete: 'Delete',
        edit: 'Edit',
        view: 'View',
        save: 'Save',
        close: 'Close',
      },
    },
  },
  zh: {
    translation: {
      nav: {
        home: '首页',
        console: 'AI控制台',
        analysis: '数据分析',
        tools: '工具库',
        knowledge: '知识库',
        projects: '项目管理',
        settings: '设置',
      },
      home: {
        title: 'BioAiSaaS',
        subtitle: '通用生物医学AI智能体平台',
        description: '使用智能AI代理加速您的生物医学研究。从scRNA-seq注释到GWAS分析，我们的平台轻松处理复杂工作流程。',
        getStarted: '开始使用',
        learnMore: '了解更多',
        features: {
          title: '强大功能',
          aiAgent: {
            title: '智能AI代理',
            description: '用于复杂生物医学分析任务的自然语言界面',
          },
          scRNA: {
            title: 'scRNA-seq分析',
            description: '自动化细胞类型注释和聚类分析',
          },
          gwas: {
            title: 'GWAS分析',
            description: '全基因组关联研究及综合报告',
          },
          crispr: {
            title: 'CRISPR筛选',
            description: '高通量筛选数据分析和可视化',
          },
        },
        quickStart: {
          title: '快速入门指南',
          step1: {
            title: '配置API',
            description: '在设置页面配置您的API密钥',
          },
          step2: {
            title: '上传数据',
            description: '上传您的生物医学数据文件',
          },
          step3: {
            title: '运行分析',
            description: '向AI代理描述您的任务',
          },
          step4: {
            title: '获取结果',
            description: '查看并下载分析结果',
          },
        },
        stats: {
          tools: '分析工具',
          databases: '数据库',
          users: '活跃用户',
          analyses: '已完成分析',
        },
      },
      console: {
        title: 'AI智能体控制台',
        placeholder: '描述您的生物医学分析任务...',
        send: '发送',
        clear: '清空对话',
        logs: '执行日志',
        results: '结果',
        examples: {
          title: '试试这些示例',
          scRNA: '注释我的scRNA-seq数据中的细胞类型',
          gwas: '运行糖尿病风险变异的GWAS分析',
          crispr: '分析我的CRISPR筛选结果',
        },
      },
      analysis: {
        title: '数据分析工作区',
        upload: {
          title: '上传数据',
          description: '将文件拖放到此处或点击浏览',
          supported: '支持格式：CSV、TSV、H5AD、VCF、FASTQ',
        },
        tasks: {
          title: '分析任务',
          scRNA: 'scRNA-seq注释',
          gwas: 'GWAS分析',
          crispr: 'CRISPR筛选',
          pathway: '通路分析',
          variant: '变异检测',
        },
        status: {
          idle: '就绪',
          running: '运行中',
          completed: '已完成',
          error: '错误',
        },
        run: '运行分析',
        download: '下载结果',
      },
      tools: {
        title: '工具库',
        search: '搜索工具...',
        categories: {
          all: '所有工具',
          sequencing: '测序',
          genomics: '基因组学',
          proteomics: '蛋白质组学',
          imaging: '成像',
          databases: '数据库',
        },
        items: {
          scanpy: {
            name: 'Scanpy',
            description: 'Python单细胞分析工具',
          },
          plink: {
            name: 'PLINK',
            description: '全基因组关联分析',
          },
          mageck: {
            name: 'MAGeCK',
            description: 'CRISPR筛选分析',
          },
          deseq2: {
            name: 'DESeq2',
            description: '差异表达分析',
          },
          cellranger: {
            name: 'Cell Ranger',
            description: '10x Genomics数据处理',
          },
          ensembl: {
            name: 'Ensembl',
            description: '基因组浏览器和注释',
          },
        },
      },
      knowledge: {
        title: '知识库',
        search: '搜索文章...',
        categories: {
          bestPractices: '最佳实践',
          protocols: '实验方案',
          troubleshooting: '故障排除',
          tutorials: '教程',
        },
        articles: {
          scRNA: {
            title: 'scRNA-seq分析最佳实践',
            description: '单细胞RNA测序分析完整指南',
          },
          gwas: {
            title: 'GWAS质量控制',
            description: '全基因组关联研究的基本QC步骤',
          },
          crispr: {
            title: 'CRISPR筛选设计',
            description: '设计有效CRISPR筛选的指南',
          },
        },
      },
      projects: {
        title: '项目管理',
        new: '新建项目',
        search: '搜索项目...',
        columns: {
          name: '名称',
          type: '类型',
          status: '状态',
          created: '创建时间',
          actions: '操作',
        },
        empty: '暂无项目。创建您的第一个项目开始使用。',
        status: {
          active: '进行中',
          completed: '已完成',
          archived: '已归档',
        },
      },
      settings: {
        title: '设置',
        api: {
          title: 'API配置',
          key: 'API密钥',
          placeholder: '输入您的API密钥',
          save: '保存',
          test: '测试连接',
        },
        language: {
          title: '语言',
          description: '选择您偏好的语言',
        },
        theme: {
          title: '主题',
          description: '选择浅色或深色模式',
          light: '浅色',
          dark: '深色',
          system: '跟随系统',
        },
        notifications: {
          title: '通知',
          email: '邮件通知',
          browser: '浏览器通知',
        },
      },
      common: {
        loading: '加载中...',
        error: '发生错误',
        success: '成功',
        cancel: '取消',
        confirm: '确认',
        delete: '删除',
        edit: '编辑',
        view: '查看',
        save: '保存',
        close: '关闭',
      },
    },
  },
};
