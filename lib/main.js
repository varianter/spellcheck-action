"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core = __importStar(require("@actions/core"));
const github = __importStar(require("@actions/github"));
const spellcheck_1 = __importDefault(require("./spellcheck"));
const diff_1 = require("./diff");
const path_1 = require("path");
const config_1 = require("./config");
const removeMd = require("remove-markdown");
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { eventName, payload: { action, pull_request } } = github.context;
            console.log(`Action called with event '${eventName}' and action '${action}'`);
            if (eventName !== "pull_request" || action !== 'opened' || !pull_request) {
                throw new Error('Expected pull_request.opened, aborting action.');
            }
            const { repo: { owner, repo } } = github.context;
            console.log(`Received webhook. Pull request #${pull_request.number} opened in repository '${owner}/${repo}'.`);
            const config = yield config_1.getConfig();
            const headSha = pull_request.head.sha;
            const baseSha = pull_request.base.sha;
            const repoToken = core.getInput('repo-token', { required: true });
            const client = new github.GitHub(repoToken);
            const result = yield client.repos.compareCommits({
                base: baseSha,
                head: headSha,
                owner,
                repo,
                headers: {
                    accept: "application/vnd.github.v3.diff"
                }
            });
            console.log(result);
            console.log("Getting file diffs");
            const fileDiffs = diff_1.getDiff(result.data);
            console.log(fileDiffs);
            console.log(`There were ${fileDiffs.length} files with added lines`);
            const spellcheck = spellcheck_1.default(config.language, config.dictionary_folder, config.ignored_words);
            const lineHits = [];
            for (let fileDiff of fileDiffs) {
                console.log(`Checking file ${fileDiff.path}`);
                if (path_1.extname(fileDiff.path) === ".md") {
                    for (let addedLine of fileDiff.addedLines) {
                        const nonMdText = removeMd(addedLine.text);
                        const misspelled = spellcheck(nonMdText).map(m => m.text);
                        console.log(misspelled)
                        if (misspelled.length) {
                            lineHits.push({
                                path: fileDiff.path,
                                position: addedLine.diffLineNumber,
                                misspelled
                            });
                        }
                    }
                }
                else {
                    console.log("Skipping spellcheck for non-.md file");
                }
            }
            console.log(`Found ${lineHits.length} lines total with misspellings`);
            if (lineHits && lineHits.length) {
                yield client.pulls.createReview({
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
        }
        catch (error) {
            core.setFailed(error.message);
            throw error;
        }
    });
}
exports.run = run;
run();
