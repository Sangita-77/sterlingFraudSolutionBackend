module.exports = {
  apps: [
    {
      name: "sterlingFraudSolutionBackend",
      script: "./server.js",
      env: {
        MONGO_URI: "mongodb+srv://sterlingFraudSolution:G7tRIO1HN1UsKTif@cluster0.pofnwps.mongodb.net/sterlingFraudSolution",
        PORT: 3000,
        JWT_SECRET: "your-secret-key"
      }
    }
  ]
};
