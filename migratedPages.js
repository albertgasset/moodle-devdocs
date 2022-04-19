const path = require('path');
const fs = require('fs');

const obsoleteDocs = [
    "MDLQA-features",
    "Setting_up_Eclipse",
    "Setting_up_Netbeans",
];

/**
 * A list of documents which have been migrated with their source and destination paths shown.
 */
const migratedDocs = {
    Access_API: "/docs/apis/access.md",
    Activity_modules: "/docs/apis/plugintypes/mod.md",
    Coding_style: "/general/development/policies/codingstyle/index.md",
    Communication_Between_Components: "/general/development/policies/component-communication/index.md",
    Core_APIs: "/docs/apis.md",
    Developer_meeting_February_2022: "/general/community/meetings/202202.md",
    Developer_meetings: "/general/community/meetings.md",
    Integration_Review: "/general/development/process/integration-review.md",
    Mission: "/general/community/mission.md",
    Moodle_App: "/docs/guides/moodleapp/coding-style.md",
    Moodle_App_Coding_Style: "/docs/guides/moodleapp/coding-style.md",
    Moodle_App_Overview: "/docs/guides/moodleapp/overview.md",
    Moodle_research: "/general/community/research.md",
    Overview: "/general/community/intro.md",
    Peer_reviewing: "/general/development/process/peer-review.md",
    Process: "/general/development/process.md",
    QA_testing: "/general/development/process/testing/qa.md",
    Roadmap: "/general/community/roadmap.md",
    Testing: "/general/development/process/testing.md",
    Testing_of_integrated_issues: "/general/development/process/testing/integrated-issues.md",
    Tracker_introduction: "/general/development/tracker.md",
    Tracker_tips: "/general/development/tracker/tips.md",
};

const isObsolete = (legacyPath) => obsoleteDocs.indexOf(legacyPath) !== -1;

/**
 * Whether the specified path has been migrated.
 *
 * @returns {bool}
 */
const isMigrated = (legacyPath) => (typeof migratedDocs[legacyPath] !== 'undefined');

/**
 * Get the path to the new doc from a legacy doc path.
 *
 * @param legacyPath {string}
 * @returns {string}
 */
const getMigratedDoc = legacyPath => {
    if (!isMigrated) {
        return null;
    }

    const filename = migratedDocs[legacyPath];

    if (filename.startsWith('/')) {
        return filename.substr(1);
    }

    return filename;
};

const getAbsoluteDirectory = (relativePath) => {
    const absolutePath = path.join(process.env.PWD, relativePath);
    const pathStat = fs.statSync(absolutePath);
    if (pathStat.isFile()) {
        return path.dirname(absolutePath);
    }

    return absolutePath;
};

/**
 * Get the path to the new doc relative to the file it was in.
 *
 * This has to consider whether the file is in the same docs instance or not due to versioning.
 *
 * @param {strin} legacyPath
 * @param {string} usedIn
 * @returns {string}
 */
const getMigrationLink = (legacyPath, usedIn) => {
    const replacementFile = getMigratedDoc(legacyPath);
    if (!replacementFile) {
        return null;
    }

    const relativeUsedIn = path.relative(process.env.PWD, usedIn);

    const replacementIsGeneral = replacementFile.startsWith('general/');
    const usedInIsGeneral = relativeUsedIn.startsWith('general/');
    const bothGeneral = replacementIsGeneral && usedInIsGeneral;
    const neitherGeneral = !replacementIsGeneral && !usedInIsGeneral;

    if (bothGeneral || neitherGeneral) {
        const absRelativeUsedIn = getAbsoluteDirectory(relativeUsedIn);
        const absReplacementFile = path.join(process.env.PWD, replacementFile);
        const relativeLink = path.relative(absRelativeUsedIn, absReplacementFile);

        if (relativeLink.startsWith('.')) {
            return relativeLink;
        } else {
            return `./${relativeLink}`;
        }
    }

    if (replacementFile.endsWith('index.md')) {
        return `/${replacementFile.replace(/\/index\.md$/, '')}`;
    }

    if (replacementFile.endsWith('.md')) {
        return `/${replacementFile.replace(/\.md$/, '')}`;
    }

    return `/${replacementFile}`;
};

module.exports = {
    isMigrated,
    isObsolete,
    getMigrationLink,
};
