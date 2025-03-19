from celery import Celery
import subprocess
import os

# 读取环境变量
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")

# 配置 Celery 任务队列
celery_app = Celery("tasks", broker=REDIS_URL)

@celery_app.task(bind=True, max_retries=3)
def sync_tweet_to_binance(self, username, tweet_text):
    try:
        # 运行 Puppeteer 脚本同步推文
        result = subprocess.run([
            "node", "binance_puppeteer_setup.js", username, tweet_text
        ], capture_output=True, text=True)
        
        if result.returncode == 0:
            return {"status": "success", "message": f"推文 {tweet_text} 已同步"}
        else:
            raise Exception(f"同步失败: {result.stderr}")
    except Exception as e:
        print(f"同步失败: {e}")
        raise self.retry(exc=e, countdown=5)