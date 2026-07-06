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
    },
    {
      name: "forum-web",
      script: "npm",
      args: "start",
      cwd: "./web",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
        NEXT_PUBLIC_API_URL: "http://localhost:5000/api"
      }
    }
  ]
};
