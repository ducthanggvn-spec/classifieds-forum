module.exports = {
  apps: [
    {
      name: "forum-backend",
      script: "src/index.js",
      cwd: "./backend",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "production",
        PORT: 5000
      }
    }
  ]
};
