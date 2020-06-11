import { Application } from "probot";

export = (app: Application) => {
  app.log("Yay, the app was loaded!");

  const handlePullRequest = require("./pullRequestChange");
  app.on(["pull_request"], handlePullRequest );
};
