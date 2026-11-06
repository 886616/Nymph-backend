// pm2 process file. Must be .cjs because package.json has "type": "module".
// Start:   pm2 start ecosystem.config.cjs
// Reload:  pm2 reload ecosystem.config.cjs --update-env
// Boot:    pm2 save && pm2 startup   (run the command it prints)
module.exports = {
  apps: [
    {
      name: "events-api",
      script: "src/index.ts",
      interpreter: "node",
      interpreter_args: "--import tsx", // runs the TypeScript source directly (Node 20.6+)
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      max_memory_restart: "300M",
      time: true,
      env: {
        NODE_ENV: "production",
        // PORT and the DB / JWT values come from the .env file in this folder
      },
    },
  ],
};
