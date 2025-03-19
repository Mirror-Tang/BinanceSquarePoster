# 使用官方 Python 3.10 镜像
FROM python:3.10

# 设置工作目录
WORKDIR /app

# 复制项目文件
COPY . /app

# 安装依赖
RUN pip install --no-cache-dir -r requirements.txt

# 运行 FastAPI 服务器
CMD ["uvicorn", "twitter_binance_sync_backend:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "2"]



🚀 **PostgreSQL **
这个 SQL 脚本可以：
✅ **创建 `users` 和 `sync_logs` 数据表**（优化数据管理）  
✅ **添加索引，提高查询性能**（加快 Webhook 和日志处理速度）  
✅ **支持未来扩展（适配 Redis 任务队列 & 并行处理）**  

---

### **🔹 如何执行？**
1️⃣ **运行 PostgreSQL**
```bash
docker-compose up -d db
```
2️⃣ **进入 PostgreSQL**
```bash
docker exec -it twitter-binance-db psql -U postgres
```
3️⃣ **执行 SQL 迁移**
```sql
\i /path/to/postgres_migration.sql
```
4️⃣ **修改 `.env` 配置数据库**
```ini
DATABASE_URL=postgresql://postgres:postgres@db:5432/twitter_binance_sync
```
5️⃣ **重启服务**
```bash
docker-compose up -d --build
```

---
