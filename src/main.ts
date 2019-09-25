import * as core from '@actions/core';
import * as github from '@actions/github';
import initSpellchecker from "./spellcheck";
import { getDiff } from "./diff";
import { extname } from "path";
import { getConfig } from "./config";
const removeMd = require("remove-markdown");

export async function run() {
  try {
    const { eventName, payload: { action, pull_request } } = github.context;
    console.log(`Action called with event '${eventName}' and action '${action}'`);

    if (eventName !==  "pull_request" || action !== 'opened' || !pull_request) {
      throw new Error('Expected pull_request.opened, aborting action.')
    }

    const { repo: { owner, repo } } = github.context;

    console.log(
      `Received webhook. Pull request #${pull_request.number} opened in repository '${owner}/${repo}'.`
    );

    const config = await getConfig();

    const headSha = pull_request.head.sha;
    const baseSha = pull_request.base.sha;

    const repoToken: string = core.getInput('repo-token', {required: true});
    const client: github.GitHub = new github.GitHub(repoToken);

    const result: any = await client.repos.compareCommits({
      base: baseSha,
      head: headSha,
      owner,
      repo,
      headers: {
        accept: "application/vnd.github.v3.diff"
      }
    });

    console.log("Getting file diffs");
    const fileDiffs = getDiff(result.data);

    console.log(`There were ${fileDiffs.length} files with added lines`);

    const spellcheck = initSpellchecker(
      config.language,
      config.dictionary_folder,
      config.ignored_words
    );

    const lineHits: Array<{
      path: string;
      misspelled: string[];
      position: number;
    }> = [];
    for (let fileDiff of fileDiffs) {
      console.log(`Checking file ${fileDiff.path}`);
      if (extname(fileDiff.path) === ".md") {
        for (let addedLine of fileDiff.addedLines) {
          const nonMdText = removeMd(addedLine.text);
          const misspelled = spellcheck(nonMdText).map(m => m.text);
          if (misspelled.length) {
            lineHits.push({
              path: fileDiff.path,
              position: addedLine.diffLineNumber,
              misspelled
            });
          }
        }
      } else {
        console.log("Skipping spellcheck for non-.md file");
      }
    }

    console.log(`Found ${lineHits.length} lines total with misspellings`);

    if (lineHits && lineHits.length) {
       await client.pulls.createReview
       ({
          repo,
          owner,
          commit_id: headSha,
          body: config.main_comment,
          event: "COMMENT",
          comments: lineHits.map(hit => ({
            body: `"${hit.misspelled.join('", "')}"`,
            path: hit.path,
            position: hit.position
          })),
          pull_number: pull_request.number
      });
    }
  } catch (error) {
    core.setFailed(error.message);
    throw error;
  }
}

run();
