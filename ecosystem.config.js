// PM2 설정 파일 — EC2 직접 배포 시 사용
// next.config.ts의 output: "standalone" 필요
// 사용법: pm2 start ecosystem.config.js

module.exports = {
  apps: [
    {
      name: "uni-boilerplate",
      script: ".next/standalone/server.js",
      instances: 1,
      exec_mode: "fork",
      watch: false,
      env: {
        NODE_ENV: "production",
        PORT: 3000,
        HOSTNAME: "0.0.0.0",
      },
    },
  ],
};
