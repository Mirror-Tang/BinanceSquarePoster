# Twitter to Binance Square Sync

## 🚀 项目简介
本项目是一个自动同步 Twitter 推文到 Binance Square 的开源工具，基于 **FastAPI**、**Celery**、**Redis**、**Puppeteer** 和 **PostgreSQL** 运行，并支持 **AMD SEV (Secure Encrypted Virtualization)** 以增强用户数据安全。

## 🎯 功能特点
✅ **自动同步 Twitter 推文到 Binance Square**

✅ **支持 Redis 任务队列，提升并发性能**

✅ **支持 Puppeteer 进行 Binance Square 自动发帖**

✅ **采用 PostgreSQL 作为数据库，提高查询速度**

✅ **错误恢复机制：支持失败自动重试 & 任务队列管理**

✅ **AMD SEV 安全运行，保障用户 Twitter & Binance 账户信息**

✅ **提供 API 接口，前端可视化管理同步 & 错误日志**

---

## 📂 目录结构
```
📂 twitter-binance-sync
├── 📂 backend            # 后端代码 (FastAPI, Celery, Redis, PostgreSQL)
│   ├── 📜 main.py        # FastAPI 主入口
│   ├── 📜 database.py    # 数据库连接管理
│   ├── 📜 models.py      # 数据库模型
│   ├── 📜 tasks.py       # Celery 任务队列 (推文同步)
│   ├── 📜 binance.py     # Binance 发帖 (调用 Puppeteer)
│   ├── 📜 config.py      # 读取环境变量
│   ├── 📜 requirements.txt # Python 依赖
│   ├── 📂 tests          # 后端测试代码
│   ├── 📜 Dockerfile     # 后端 Dockerfile
│   ├── 📜 entrypoint.sh  # 容器启动脚本
│   ├── 📜 .env.example   # 环境变量示例
│   ├── 📂 migrations     # Alembic 迁移文件 (数据库升级)
│   ├── 📜 alembic.ini    # 数据库迁移配置
│   ├── 📂 logs           # 日志存储 (可配置挂载到 SEV 设备)
│   └── 📜 README.md      # 介绍后端功能
│
├── 📂 frontend           # 前端代码 (Next.js, React)
│   ├── 📜 pages/index.tsx # UI 入口
│   ├── 📜 components     # 组件库
│   ├── 📜 styles         # 样式文件
│   ├── 📜 package.json   # 前端依赖
│   ├── 📜 Dockerfile     # 前端 Dockerfile
│   ├── 📜 .env.example   # 前端环境变量
│   ├── 📜 README.md      # 介绍前端功能
│   └── 📂 tests          # 前端测试代码
│
├── 📂 automation         # 自动化工具 (Puppeteer)
│   ├── 📜 binance_puppeteer.js  # Puppeteer 自动发帖
│   ├── 📜 package.json    # Node.js 依赖
│   ├── 📜 Dockerfile      # Puppeteer 运行环境
│   ├── 📜 .env.example    # 环境变量
│   ├── 📜 README.md       # 介绍 Puppeteer 自动化
│   ├── 📂 logs            # 自动化日志存储
│   └── 📂 tests           # Puppeteer 自动化测试
│
├── 📂 deployment         # 部署相关 (AMD SEV)
│   ├── 📜 docker-compose.yml  # 组合部署 (前端+后端+Redis+数据库)
│   ├── 📜 entrypoint.sh       # 容器启动逻辑
│   ├── 📜 sec_config.toml     # SEV 配置 (启用加密)
│   ├── 📜 deploy.sh           # 部署脚本 (一键运行)
│   ├── 📜 README.md           # 部署文档
│   └── 📂 logs                # 部署日志
│
├── 📂 docs               # 文档相关
│   ├── 📜 API.md         # API 说明
│   ├── 📜 SETUP.md       # 安装指南
│   ├── 📜 SECURITY.md    # AMD SEV 配置指南
│   ├── 📜 ARCHITECTURE.md # 架构设计文档
│   ├── 📜 CONTRIBUTING.md # 开源贡献指南
│   ├── 📜 CODE_OF_CONDUCT.md # 代码规范
│   ├── 📜 LICENSE        # 许可证 (MIT/GPL)
│   ├── 📜 README.md      # 总体介绍
│   └── 📜 CHANGELOG.md   # 版本更新日志
│
└── 📜 .gitignore         # 忽略不必要的文件
```

---

## 📌 快速开始
### **1️⃣ 运行后端**
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000
```

### **2️⃣ 运行前端**
```bash
cd frontend
npm install
npm run dev
```

### **3️⃣ 启动 Redis + Celery**
```bash
docker-compose up -d redis
celery -A backend.tasks worker --loglevel=info
```

### **4️⃣ 测试 Binance 发帖**
```bash
cd automation
node binance_puppeteer.js "test_user" "Hello Binance!"
```

---

## 📦 Docker 部署
1️⃣ **启动全部服务**
```bash
docker-compose up -d --build
```
2️⃣ **查看日志**
```bash
docker-compose logs -f
```

---

## 🔒 AMD SEV 安全运行
1️⃣ **配置 SEV**
```bash
echo "[sev] enabled = true" > deployment/sec_config.toml
```
2️⃣ **运行 SEV 容器**
```bash
docker-compose up -d --build
```

---

## 📜 许可证
本项目基于 **Commercial License**，欢迎贡献代码！🎯

---

## 🤝 贡献指南
欢迎提交 **Issue & PR**！

🚀 **Enjoy & contribute!** 🎉

