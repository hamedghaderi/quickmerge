import { App } from "@slack/bolt";
import { Octokit } from "@octokit/rest";
import dotenv from 'dotenv';

dotenv.config()

const app = new App({
    token: process.env.SLACK_BOT_TOKEN,
    signingSecret: process.env.SLACK_SIGNING_SECRET
})

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN })

app.command('/hotfix-pr', async ({ command, ack, say }) => {
    await ack();

    console.log(await getLatestReleaseBranch('kyosenergy', 'kyosonline-laravel'))
    

    await say(`Command received: ${command.text}`)
});

const getLatestReleaseBranch = async (owner: string, repo: string) => {
    try {
        const branches = await octokit.repos.listBranches({
            owner,
            repo
        })

        const releaseBranches = branches.data.filter(({name}) => name.includes('release'))
        console.log('re', releaseBranches)

        releaseBranches.sort((a, b) => {
            const dateA = new Date(a.name.replace('release/', ''))
            const dateB = new Date(b.name.replace('release/', ''))

            return Number(dateB) - Number(dateA)
        })

        if (releaseBranches.length > 0) {
            console.log(`Latest release branch: ${releaseBranches[0].name}`)
            return releaseBranches[0].name
        } else {
            console.log('No release branched found.')
        }
    } catch(error: any) {

    }
}

async function getRepositoryDetails(owner: string, repo: string) {
    try {
        const response = await octokit.repos.get({
            owner,
            repo,
        });
        console.log(response.data);
    } catch (error) {
        console.error("Error fetching repository details:", error);
    }
}

(async () => {
    try {
        const port = process.env.PORT || 3000
        await app.start(port)
        console.log(`⚡️ QuickMerge is running on port ${port}!`)
    } catch(error) {
        console.error(`Failed to start QuickMerge: ${error}`)
    }
})();

process.on('unhandledRejection', error => {
    console.log('Unhandled promise rejection', error)
})

