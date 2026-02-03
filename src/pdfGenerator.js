const fs = require('fs');
const path = require('path');
const markdownpdf = require('markdown-pdf');
const config = require('./config');

// Load the PDF template
const pdfTemplate = fs.readFileSync(
    path.join(__dirname, 'templates', 'pdf-template.md'),
    'utf8'
);

function formatDate(date = new Date()) {
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function getWeekEnding(date = new Date()) {
    // Get the date of the upcoming Sunday (end of week)
    const dateCopy = new Date(date);
    const day = dateCopy.getDay();
    const diff = dateCopy.getDate() - day + (day === 0 ? -6 : 0); // Adjust to Monday
    const monday = new Date(dateCopy);
    monday.setDate(diff);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    return formatDate(sunday);
}

function extractSection(content, sectionKeywords, excludeKeywords = []) {
    // Try to find a section in the content that matches the keywords
    const lines = content.split('\n');
    let inSection = false;
    let sectionContent = [];
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const isHeading = /^#{1,3}\s+.+/.test(line);
        const lineLower = line.toLowerCase();
        
        // Check if this line contains excluded keywords (like "Blockers:" in an achievements section)
        const hasExcludedContent = excludeKeywords.some(keyword => 
            lineLower.includes(keyword.toLowerCase()) && 
            (lineLower.includes(':') || isHeading) // Only if it's a label/heading
        );
        
        if (isHeading) {
            // Check if this heading matches any of our keywords
            const matches = sectionKeywords.some(keyword => 
                lineLower.includes(keyword.toLowerCase())
            );
            
            if (matches) {
                // Found matching section, start collecting
                inSection = true;
                sectionContent = [];
            } else if (inSection) {
                // We've hit a new heading while in a section, stop collecting
                break;
            }
        } else if (inSection) {
            // Stop if we hit content that belongs to another category
            if (hasExcludedContent) {
                break;
            }
            // Collect all content (including empty lines for formatting)
            sectionContent.push(line);
        }
    }
    
    // Trim empty lines from the end
    while (sectionContent.length > 0 && !sectionContent[sectionContent.length - 1].trim()) {
        sectionContent.pop();
    }
    
    // Filter out lines that are clearly from other sections
    const filtered = sectionContent.filter(line => {
        const lineLower = line.toLowerCase();
        return !excludeKeywords.some(keyword => 
            lineLower.includes(keyword.toLowerCase()) && lineLower.includes(':')
        );
    });
    
    return filtered.length > 0 ? filtered.join('\n').trim() : null;
}

function formatIndividualStatuses(allReports) {
    if (!allReports || Object.keys(allReports).length === 0) {
        return '*No individual reports submitted this week*';
    }
    
    let individualStatuses = '';
    for (const [userId, data] of Object.entries(allReports)) {
        individualStatuses += `### ${data.name}\n\n`;
        individualStatuses += `${data.text.trim()}\n\n`;
        // individualStatuses += '---\n\n';
    }
    
    return individualStatuses.trim();
}

function applyTemplate(summaryContent, allReports = null) {
    const date = formatDate();
    const weekEnding = getWeekEnding();
    
    // Try to extract specific sections from the AI summary
    // Use broader keyword matching to catch variations
    // Exclude conflicting keywords to prevent cross-contamination
    const achievements = extractSection(summaryContent, [
        'achievement', 'achievements', 'win', 'wins', 'completed', 
        'milestone', 'milestones', 'accomplish', 'deliverable'
    ], ['blocker', 'risk', 'issue', 'problem']) || '*No specific achievements section found in summary*';
    
    const blockers = extractSection(summaryContent, [
        'blocker', 'blockers', 'risk', 'risks', 'issue', 'issues', 
        'problem', 'problems', 'dependency', 'dependencies', 'challenge', 'challenges'
    ], ['achievement', 'win', 'completed', 'milestone']) || '*No specific blockers section found in summary*';
    
    const metrics = extractSection(summaryContent, [
        'metric', 'metrics', 'kpi', 'kpis', 'progress', 'percentage', 
        'data', 'number', 'numbers', 'statistic', 'statistics', 'measure'
    ], []) || '*No specific metrics section found in summary*';
    
    const nextSteps = extractSection(summaryContent, [
        'next step', 'next steps', 'priority', 'priorities', 'upcoming', 
        'planned', 'plan', 'action', 'actions', 'todo', 'todos', 'future'
    ], []) || '*No specific next steps section found in summary*';
    
    const overallStatus = extractSection(summaryContent, [
        'overall', 'status', 'statuses', 'summary', 'assessment', 
        'health', 'conclusion', 'final', 'wrap'
    ], []) || '*No specific overall status section found in summary*';
    
    // Format individual team member statuses
    const individualStatuses = formatIndividualStatuses(allReports);
    
    let result = pdfTemplate
        .replace('{{DATE}}', date)
        .replace('{{WEEK_ENDING}}', weekEnding)
        .replace('{{ACHIEVEMENTS}}', achievements)
        .replace('{{BLOCKERS}}', blockers)
        .replace('{{METRICS}}', metrics)
        .replace('{{NEXT_STEPS}}', nextSteps)
        .replace('{{OVERALL_STATUS}}', overallStatus)
        .replace('{{INDIVIDUAL_STATUSES}}', individualStatuses);
    
    // Only replace SUMMARY_CONTENT if it exists in template
    if (pdfTemplate.includes('{{SUMMARY_CONTENT}}')) {
        result = result.replace('{{SUMMARY_CONTENT}}', summaryContent);
    }
    
    return result;
}

async function createPdfFromMarkdown(summaryMarkdown, allReports = null) {
    const pdfPath = config.pdfOutputPath;
    
    // Apply template to wrap the summary with consistent structure
    const fullMarkdown = applyTemplate(summaryMarkdown, allReports);

    return new Promise((resolve, reject) => {
        markdownpdf()
            .from.string(fullMarkdown)
            .to(pdfPath, (err) => {
                if (err) return reject(err);
                resolve(pdfPath);
            });
    });
}

function deletePdf(pdfPath) {
    if (fs.existsSync(pdfPath)) {
        fs.unlinkSync(pdfPath);
    }
}

module.exports = { createPdfFromMarkdown, deletePdf };